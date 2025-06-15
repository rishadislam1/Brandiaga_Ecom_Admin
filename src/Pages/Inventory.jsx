import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OrdersTable from '../Components/Table.jsx';
import InputModal from '../Components/InputModal.jsx';
import {
    GetInventoryRequest,
    AddInventoryRequest,
    UpdateInventoryRequest,
    DeleteInventoryRequest,
} from '../Request/InventoryRequest.jsx';
import { showSuccess } from '../Components/ToasterComponent.jsx';
import { ConfirmAlert } from '../Components/AlertComponent.jsx';
import { setCategories } from '../redux/Slicers/CategorySlice.js';
import { setProducts } from '../redux/Slicers/ProductSlice.js';
import {
    setInventories,
    addInventory,
    updateInventory,
    deleteInventory,
} from '../redux/Slicers/InventorySlice.js';
import {GetCategoriesRequest} from "../Request/CategoryRequest.jsx";
import {GetProductsRequest} from "../Request/ProductRequest.jsx";

const Inventory = () => {
    const dispatch = useDispatch();
    const { inventories } = useSelector((state) => state.inventory);
    const { products } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [inventoryProduct, setInventoryProduct] = useState('');
    const [quantity, setQuantity] = useState('');

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const orderColumns = [
        { field: 'id', headerName: 'SLNo' },
        { field: 'productName', headerName: 'Product' },
        { field: 'quantity', headerName: 'Quantity' },
        {
            field: 'actions',
            headerName: 'Actions',
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)} aria-label="edit">
                        <EditIcon className="text-green-700" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row)} aria-label="delete">
                        <DeleteIcon className="text-red-700" />
                    </IconButton>
                </>
            ),
        },
    ];

    useEffect(() => {
        (async () => {
            try {


                // Fetch categories (for consistency, though not used directly)
                const catRes = await GetCategoriesRequest();
                if (catRes?.data?.length) {
                    const transformedCategories = catRes.data.map((item, index) => ({
                        id: index + 1,
                        name: item.name,
                        parent: item.parentCategoryName || null,
                        realId: item.categoryId,
                    }));
                    dispatch(setCategories(transformedCategories));
                }

                // Fetch products for dropdown
                const prodRes = await GetProductsRequest();
                if (prodRes?.data?.length) {
                    const transformedProducts = prodRes.data.map((item, index) => ({
                        id: index + 1,
                        name: item.name,
                        sku: item.sku,
                        price: item.price,
                        discountPrice: item.discountPrice,
                        category: categories.find((cat) => cat.realId === item.categoryId)?.name || 'None',
                        realId: item.productId,
                    }));
                    dispatch(setProducts(transformedProducts));
                }

                // Fetch inventories
                const invRes = await GetInventoryRequest();
                if (invRes?.data?.length) {
                    const transformedInventories = invRes.data.map((item, index) => ({
                        id: index + 1,
                        productId: item.productId,
                        productName: products.find((prod) => prod.realId === item.productId)?.name || 'Unknown',
                        quantity: item.quantity,
                        realId: item.inventoryId,
                    }));
                    dispatch(setInventories(transformedInventories));
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inventoryProduct || !quantity) return;


        try {
            const productId = products.find((prod) => prod.name === inventoryProduct)?.realId || null;
            const data = {
                productId,
                quantity: parseInt(quantity),
            };

            if (selectedInventory) {
                // Update inventory
                const result = await UpdateInventoryRequest(selectedInventory.realId, data);
                if (result?.status === 'Success') {
                    showSuccess(result?.message);
                    dispatch(
                        updateInventory({
                            id: selectedInventory.id,
                            productId,
                            quantity: parseInt(quantity),
                        })
                    );
                }
            } else {
                // Add inventory
                const res = await AddInventoryRequest(data);
                if (res?.status === 'Success') {
                    showSuccess('Inventory Added Successfully');
                    const newInventory = {
                        id: inventories.length + 1,
                        productId,
                        productName: inventoryProduct || 'Unknown',
                        quantity: parseInt(quantity),
                        realId: res.data?.inventoryId || `uuid${inventories.length + 1}`,
                    };
                    dispatch(addInventory(newInventory));
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {

            setInventoryProduct('');
            setQuantity('');
            setSelectedInventory(null);
            setModalOpen(false);
        }
    };

    const handleAddInventory = () => {
        setSelectedInventory(null);
        setInventoryProduct('');
        setQuantity('');
        setModalOpen(true);
    };

    const handleEdit = (inventory) => {
        setSelectedInventory(inventory);
        setInventoryProduct(inventory.productName || '');
        setQuantity(inventory.quantity || '');
        setModalOpen(true);
    };

    const handleDelete = async (inventoryRow) => {
        const result = await ConfirmAlert();
        if (!result) return;


        try {
            const realId = inventoryRow.realId;
            const deleteResult = await DeleteInventoryRequest(realId);
            if (deleteResult?.status === 'Success') {
                showSuccess(deleteResult?.message);
                dispatch(deleteInventory(inventoryRow.id));
            }
        } catch (error) {
            console.error('Failed to delete inventory:', error);
        }
    };

    const modalBody = (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    select
                    label="Product"
                    value={inventoryProduct}
                    onChange={(e) => setInventoryProduct(e.target.value)}
                    margin="normal"
                    required
                >
                    <MenuItem value="">
                        <em>Select Product</em>
                    </MenuItem>
                    {products.map((prod) => (
                        <MenuItem key={prod.id} value={prod.name}>
                            {prod.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    margin="normal"
                    required
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {selectedInventory ? 'Update' : 'Add'} Inventory
                    </Button>
                </Box>
            </form>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Button variant="contained" onClick={handleAddInventory} sx={{ mb: 2 }} disabled={isLoading}>
                Add Inventory
            </Button>


            <OrdersTable
                title="Inventory"
                orderRows={inventories.map((row) => ({
                    ...row,
                    productName: row.productName || 'N/A',
                    quantity: row.quantity || 'N/A',
                }))}
                orderColumns={orderColumns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />

            <InputModal
                title={selectedInventory ? 'Update Inventory' : 'Add Inventory'}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedInventory(null);
                    setInventoryProduct('');
                    setQuantity('');
                }}
            >
                {modalBody}
            </InputModal>
        </Box>
    );
};

export default Inventory;