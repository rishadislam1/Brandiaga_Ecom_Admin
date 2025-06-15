import * as React from 'react';
import { useEffect, useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import OrdersTable from '../Components/Table.jsx';
import InputModal from '../Components/InputModal.jsx';
import { showSuccess, showError } from '../Components/ToasterComponent.jsx';
import { ConfirmAlert } from '../Components/AlertComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import { setSeoEntries, addSeoEntry, updateSeoEntry, deleteSeoEntry } from '../redux/Slicers/SeoSlice.js';
import { GetProductsRequest } from '../Request/ProductRequest.jsx';
import {AddSeoRequest, DeleteSeoRequest, GetSeoEntriesRequest, UpdateSeoRequest} from "../Request/seoRequest.jsx";

// Memoized ModalBody Component
const ModalBody = memo(
    ({
         productId,
         setProductId,
         metaTitle,
         setMetaTitle,
         metaDescription,
         setMetaDescription,
         products,
         isLoading,
         handleSubmit,
         resetForm,
         selectedSeoEntry,
     }) => {
        return (
            <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth margin="normal" required error={!productId}>
                        <InputLabel>Product</InputLabel>
                        <Select
                            value={products.find(pp=>pp.realId ===productId) }
                            onChange={(e) => setProductId(e.target.value)}
                            label="Product"

                        >
                            <MenuItem value="">
                                <em>Select a product</em>
                            </MenuItem>
                            {products.map((prod) => (
                                <MenuItem key={prod.realId} value={prod.realId}>
                                    {prod.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {!productId && (
                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                                Product is required
                            </Box>
                        )}
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Meta Title"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        margin="normal"
                        required
                        error={!metaTitle.trim()}
                        helperText={!metaTitle.trim() && 'Meta Title is required'}
                    />
                    <TextField
                        fullWidth
                        label="Meta Description"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        margin="normal"
                        required
                        multiline
                        rows={4}
                        error={!metaDescription.trim()}
                        helperText={!metaDescription.trim() && 'Meta Description is required'}
                    />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={resetForm}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isLoading}
                        >
                            {selectedSeoEntry ? 'Update' : 'Add'} SEO Entry
                        </Button>
                    </Box>
                </form>
            </Box>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.productId === nextProps.productId &&
            prevProps.metaTitle === nextProps.metaTitle &&
            prevProps.metaDescription === nextProps.metaDescription &&
            prevProps.products === nextProps.products &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.selectedSeoEntry === nextProps.selectedSeoEntry
        );
    }
);

// SEO Columns
const getSeoColumns = (handleEdit, handleDelete) => [
    { field: 'id', headerName: 'SLNo', width: 80 },
    { field: 'productName', headerName: 'Product Name', width: 200 },
    { field: 'metaTitle', headerName: 'Meta Title', width: 250 },
    { field: 'metaDescription', headerName: 'Meta Description', width: 350 },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    onClick={() => {
                        console.log(params.row)
                        handleEdit(params.row)
                    }}
                    aria-label={`Edit SEO for ${params.row.productName}`}
                    color="success"
                >
                    <EditIcon />
                </IconButton>
                <IconButton
                    onClick={() => handleDelete(params.row)}
                    aria-label={`Delete SEO for ${params.row.productName}`}
                    color="error"
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
    },
];

const Seo = () => {
    const dispatch = useDispatch();
    const { seoEntries } = useSelector((state) => state.seo);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSeoEntry, setSelectedSeoEntry] = useState(null);
    const [productId, setProductId] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [products, setProducts] = useState([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
console.log(products)
    // Reset form
    const resetForm = useCallback(() => {
        setProductId('');
        setMetaTitle('');
        setMetaDescription('');
        setSelectedSeoEntry(null);
        setModalOpen(false);
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!productId || !metaTitle.trim() || !metaDescription.trim()) {
                showError('Please fill in all required fields with valid values.');
                return;
            }

            dispatch(setLoading(true));
            try {
                const data = {
                    pageType: products.find(p => p.realId === productId)?.name || 'N/A',
                    pageId: productId,

                    metaTitle: metaTitle.trim(),
                    metaDescription: metaDescription.trim(),
                };

                if (selectedSeoEntry) {
                    // Assume UpdateSeoRequest exists
                    const result = await UpdateSeoRequest(selectedSeoEntry.realId, data);
                    if (result) {
                        showSuccess(result.message);
                        const updatedEntry = {
                            id: selectedSeoEntry.id,
                            productName: products.find(p => p.realId === productId)?.name || 'N/A',
                            metaTitle: metaTitle.trim(),
                            metaDescription: metaDescription.trim(),
                            realId: selectedSeoEntry.realId,
                        };
                        dispatch(updateSeoEntry(updatedEntry));
                        resetForm();
                    }
                } else {
                    // Assume AddSeoRequest exists
                    const res = await AddSeoRequest(data);
                    if (res) {
                        showSuccess(res.message);
                        const newEntry = {
                            id: seoEntries.length + 1,
                            productName: products.find(p => p.realId === productId)?.name || 'N/A',
                            metaTitle: metaTitle.trim(),
                            metaDescription: metaDescription.trim(),
                            realId: res.data.seoid, // Assume backend returns Id
                        };
                        dispatch(addSeoEntry(newEntry));
                        resetForm();
                    }
                }
            } catch (error) {
                showError('Failed to save SEO entry. Please try again.');
                console.error('Error:', error);
            } finally {
                dispatch(setLoading(false));
            }
        },
        [productId, metaTitle, metaDescription, selectedSeoEntry, products, seoEntries.length, dispatch, resetForm]
    );

    // Handle edit
    const handleEdit = useCallback((seoEntry) => {
        setSelectedSeoEntry(seoEntry);
        setProductId(seoEntry.realId || '');
        setMetaTitle(seoEntry.metaTitle || '');
        setMetaDescription(seoEntry.metaDescription || '');
        setModalOpen(true);
    }, []);

    // Handle delete
    const handleDelete = useCallback(
        async (seoEntry) => {
            const result = await ConfirmAlert();
            if (!result) return;

            try {
                // Assume DeleteSeoRequest exists
                const deleteResult = await DeleteSeoRequest(seoEntry.realId);
                if (deleteResult) {
                    showSuccess(deleteResult.message);
                    dispatch(deleteSeoEntry(seoEntry.id));
                } else {
                    showError('Failed to delete SEO entry.');
                }
            } catch (error) {
                showError('Failed to delete SEO entry. Please try again.');
                console.error('Failed to delete SEO entry:', error);
            }
        },
        [dispatch]
    );

    // Fetch products and SEO entries on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(setLoading(true));

                // Fetch products
                const prodRes = await GetProductsRequest();
                if (prodRes?.status === 'Success' && prodRes?.data?.length) {
                    const transformedProducts = prodRes.data.map((item) => ({
                        realId: item.productId,
                        name: item.name || 'N/A',
                    }));
                    setProducts(transformedProducts);
                }

                // Assume GetSeoEntriesRequest exists
                const seoRes = await GetSeoEntriesRequest();
                console.log(seoRes)
                if (seoRes?.data?.length>0) {
                    const transformedSeoEntries = seoRes.data.map((item, index) => ({
                        id: index + 1,
                        productName: item.pageType || 'N/A',
                        metaTitle: item.metaTitle || 'N/A',
                        metaDescription: item.metaDescription || 'N/A',
                        realId: item.seoid, // Assume backend returns Id
                    }));
                    dispatch(setSeoEntries(transformedSeoEntries));
                }
            } catch (error) {
                showError('Failed to load data. Please try again.');
                console.error('Failed to load data:', error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchData();
    }, []);

    return (
        <Box sx={{ p: 4, bgcolor: 'grey.100', minHeight: '100vh', width: '99%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 500 }}>SEO Management</h1>
                <Button
                    variant="contained"
                    onClick={() => setModalOpen(true)}
                    disabled={isLoading || products.length === 0}
                >
                    Add SEO Entry
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : products.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'error.main' }}>
                    No products available. Please add a product first.
                </Box>
            ) : seoEntries.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'error.main' }}>
                    No SEO entries available. Please add an SEO entry.
                </Box>
            ) : (
                <OrdersTable
                    title="SEO Entries"
                    orderRows={seoEntries.map((row) => ({
                        ...row,
                        productName: row.productName || 'N/A',
                        metaTitle: row.metaTitle || 'N/A',
                        metaDescription: row.metaDescription || 'N/A',
                    }))}
                    orderColumns={getSeoColumns(handleEdit, handleDelete)}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            )}

            <InputModal
                title={selectedSeoEntry ? 'Update SEO Entry' : 'Add SEO Entry'}
                open={modalOpen}
                onClose={resetForm}
            >
                <ModalBody
                    productId={productId}
                    setProductId={setProductId}
                    metaTitle={metaTitle}
                    setMetaTitle={setMetaTitle}
                    metaDescription={metaDescription}
                    setMetaDescription={setMetaDescription}
                    products={products}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    selectedSeoEntry={selectedSeoEntry}
                />
            </InputModal>
        </Box>
    );
};

export default Seo;