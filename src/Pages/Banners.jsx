import * as React from 'react';
import { useEffect, useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import OrdersTable from '../Components/Table.jsx';
import InputModal from '../Components/InputModal.jsx';
import {
    GetBannersRequest,
    AddBannerRequest,
    UpdateBannerRequest,
    DeleteBannerRequest,
} from '../Request/BannerRequest.jsx';
import { showSuccess, showError } from '../Components/ToasterComponent.jsx';
import { ConfirmAlert } from '../Components/AlertComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import { setBanners, addBanner, updateBanner, deleteBanner } from '../redux/Slicers/BannerSlice.js';
import { baseURL } from '../hooks/useAxiosSecure.jsx';
import {InputLabel} from "@mui/material";

// Memoized ModalBody Component
const ModalBody = memo(
    ({
         title,
         setTitle,
         linkUrl,
         setLinkUrl,
         displayOrder,
         setDisplayOrder,
         isActive,
         setIsActive,
         imagePreview,
         handleImageChange,
         handleRemoveImage,
         isLoading,
         handleSubmit,
         resetForm,
         selectedBanner,
     }) => {
        return (
            <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        margin="normal"
                        required
                        error={!title.trim()}
                        helperText={!title.trim() && 'Title is required'}
                    />
                    <TextField
                        fullWidth
                        label="Link URL"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Display Order"
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                        margin="normal"
                        required
                        error={isNaN(displayOrder) || displayOrder < 0}
                        helperText={(isNaN(displayOrder) || displayOrder < 0) && 'Enter a valid non-negative number'}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        }
                        label="Active"
                    />
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Banner Image</InputLabel>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={handleImageChange}
                            style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                        />
                    </Box>
                    {imagePreview ? (
                        <Box sx={{ mt: 2, position: 'relative' }}>
                            <img
                                src={imagePreview}
                                alt="Banner Preview"
                                style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                                onError={(e) => { e.target.src = '/fallback-image.jpg'; }}
                            />
                            <IconButton
                                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                                onClick={handleRemoveImage}
                                aria-label="Remove image"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Box sx={{ mt: 2, color: 'text.secondary' }}>No image selected</Box>
                    )}
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
                            {selectedBanner ? 'Update' : 'Add'} Banner
                        </Button>
                    </Box>
                </form>
            </Box>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.title === nextProps.title &&
            prevProps.imageUrl === nextProps.imageUrl &&
            prevProps.imageBase64 === nextProps.imageBase64 &&
            prevProps.linkUrl === nextProps.linkUrl &&
            prevProps.displayOrder === nextProps.displayOrder &&
            prevProps.isActive === nextProps.isActive &&
            prevProps.imagePreview === nextProps.imagePreview &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.selectedBanner === nextProps.selectedBanner
        );
    }
);

// Banner Columns
const getBannerColumns = (baseURL, handleEdit, handleDelete) => [
    { field: 'id', headerName: 'SLNo', width: 80 },
    { field: 'title', headerName: 'Title', width: 150 },
    {
        field: 'imageUrl',
        headerName: 'Image',
        width: 120,
        renderCell: (params) => (
            params?.row?.imageUrl ? (
                <img
                    src={params.row.imageUrl}
                    alt="Banner"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                    onError={(e) => { e.target.src = '/fallback-image.jpg'; }}
                />
            ) : 'No Image'
        ),
    },
    { field: 'linkUrl', headerName: 'Link URL', width: 200 },
    { field: 'displayOrder', headerName: 'Display Order', width: 120 },
    {
        field: 'isActive',
        headerName: 'Active',
        width: 100,
        renderCell: (params) => (params.row.isActive ? 'Yes' : 'No'),
    },
    {
        field: 'createdAt',
        headerName: 'Created At',
        width: 150,
        renderCell: (params) => new Date(params.row.createdAt).toLocaleDateString(),
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    onClick={() => handleEdit(params.row)}
                    aria-label={`Edit banner ${params.row.title}`}
                    color="success"
                >
                    <EditIcon />
                </IconButton>
                <IconButton
                    onClick={() => handleDelete(params.row)}
                    aria-label={`Delete banner ${params.row.title}`}
                    color="error"
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
    },
];

const Banners = () => {
    const dispatch = useDispatch();
    const { banners } = useSelector((state) => state.banners);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageBase64, setImageBase64] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [displayOrder, setDisplayOrder] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    // Reset form
    const resetForm = useCallback(() => {
        setTitle('');
        setImageUrl('');
        setImageBase64('');
        setLinkUrl('');
        setDisplayOrder('');
        setIsActive(false);
        setImagePreview('');
        setSelectedBanner(null);
        setModalOpen(false);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
    }, [imagePreview]);

    // Handle image selection and preview
    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const extension = file.name.split('.').pop().toLowerCase();
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!validExtensions.includes(extension)) {
            showError(`Invalid file type: ${file.name}. Only JPG, JPEG, PNG, and GIF are allowed.`);
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError(`File size exceeds 5MB: ${file.name}`);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result;
            setImageBase64(base64String);
            setImagePreview(URL.createObjectURL(file));
        };
        reader.onerror = () => {
            showError('Failed to read image file.');
        };
        reader.readAsDataURL(file);
    }, []);

    // Handle image removal
    const handleRemoveImage = useCallback(() => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageBase64('');
        setImagePreview('');
        setImageUrl('');
    }, [imagePreview]);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!title.trim() || (isNaN(displayOrder) || displayOrder < 0) || (!imageBase64 && !imageUrl && !selectedBanner?.imageUrl)) {
                showError('Please fill in all required fields with valid values.');
                return;
            }

            dispatch(setLoading(true));
            try {
                const formData = new FormData();
                formData.append('Title', title.trim());
                formData.append('ImageUrl', imageUrl);
                if (imageBase64 && !selectedBanner) {
                    formData.append('imageFile', dataURLtoFile(imageBase64, `banner-${Date.now()}.${imageBase64.includes('jpeg') ? 'jpg' : 'png'}`));
                } else if (imageBase64 && selectedBanner) {
                    formData.append('ImageBase64', imageBase64);
                }
                formData.append('LinkUrl', linkUrl);
                formData.append('DisplayOrder', parseInt(displayOrder));
                formData.append('IsActive', isActive);

                if (selectedBanner) {
                    const result = await UpdateBannerRequest(selectedBanner.realId, formData);
                    if (result?.Success) {
                        showSuccess(result.Message);
                        const updatedBanner = {
                            id: selectedBanner.id,
                            title: title.trim(),
                            imageUrl: imageBase64 ? `/upload/bannerimage/${Date.now()}.${imageBase64.includes('jpeg') ? 'jpg' : 'png'}` : (imageUrl || selectedBanner.imageUrl),
                            linkUrl,
                            displayOrder: parseInt(displayOrder),
                            isActive,
                            createdAt: selectedBanner.createdAt,
                            realId: selectedBanner.realId,
                        };
                        dispatch(updateBanner(updatedBanner));
                        resetForm();
                    }
                } else {
                    const res = await AddBannerRequest(formData);
                    if (res?.Success) {
                        showSuccess(res.Message);
                        const newBanner = {
                            id: banners.length + 1,
                            title: title.trim(),
                            imageUrl: imageBase64 ? `/upload/bannerimage/${Date.now()}.${imageBase64.includes('jpeg') ? 'jpg' : 'png'}` : imageUrl,
                            linkUrl,
                            displayOrder: parseInt(displayOrder),
                            isActive,
                            createdAt: new Date().toISOString(),
                            realId: res.Data.BannerId,
                        };
                        dispatch(addBanner(newBanner));
                        resetForm();
                    }
                }
            } catch (error) {
                showError('Failed to save banner. Please try again.');
                console.error('Error:', error);
            } finally {
                dispatch(setLoading(false));
            }
        },
        [title, imageUrl, imageBase64, linkUrl, displayOrder, isActive, selectedBanner, banners.length, dispatch, resetForm]
    );

    // Convert data URL to File for FormData
    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    // Handle edit
    const handleEdit = useCallback((banner) => {
        setSelectedBanner(banner);
        setTitle(banner.title || '');
        setImageUrl(banner.imageUrl || '');
        setImageBase64('');
        setLinkUrl(banner.linkUrl || '');
        setDisplayOrder(banner.displayOrder || 0);
        setIsActive(banner.isActive || false);
        setImagePreview(banner.imageUrl ? banner.imageUrl : '');
        setModalOpen(true);
    }, []);

    // Handle delete
    const handleDelete = useCallback(
        async (banner) => {
            const result = await ConfirmAlert();
            if (!result) return;

            dispatch(setLoading(true));
            try {
                const deleteResult = await DeleteBannerRequest(banner.realId);
                if (deleteResult?.Success) {
                    showSuccess(deleteResult.Message);
                    dispatch(deleteBanner(banner.id));
                } else {
                    showError('Failed to delete banner.');
                }
            } catch (error) {
                showError('Failed to delete banner. Please try again.');
                console.error('Failed to delete banner:', error);
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch]
    );

    // Fetch banners on mount
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                dispatch(setLoading(true));
                const res = await GetBannersRequest();

                if (res?.data?.length>0) {
                    const transformedBanners = res.data.map((item, index) => ({
                        id: index + 1,
                        title: item.title || 'N/A',
                        imageUrl: baseURL+ item.imageUrl || '',
                        linkUrl: item.linkUrl || '',
                        displayOrder: item.displayOrder || 0,
                        isActive: item.isActive || false,
                        createdAt: item.createdAt || new Date().toISOString(),
                        realId: item.bannerId,
                    }));

                    dispatch(setBanners(transformedBanners));
                }
            } catch (error) {
                showError('Failed to load banners. Please try again.');
                console.error('Failed to load banners:', error);
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchBanners();
    }, []);

    // Clean up image preview
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    return (
        <Box sx={{ p: 4, bgcolor: 'grey.100', minHeight: '100vh', width: '99%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Banner Management</h1>
                <Button
                    variant="contained"
                    onClick={() => setModalOpen(true)}
                    disabled={isLoading}
                >
                    Add Banner
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : banners.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'error.main' }}>
                    No banners available. Please add a banner.
                </Box>
            ) : (
                <OrdersTable
                    title="Banners"
                    orderRows={banners.map((row) => ({
                        ...row,
                        title: row.title || 'N/A',
                        imageUrl: row.imageUrl || '',
                        linkUrl: row.linkUrl || '',
                        displayOrder: row.displayOrder || 0,
                        isActive: row.isActive,
                        createdAt: row.createdAt,
                    }))}
                    orderColumns={getBannerColumns(baseURL, handleEdit, handleDelete)}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            )}

            <InputModal
                title={selectedBanner ? 'Update Banner' : 'Add Banner'}
                open={modalOpen}
                onClose={resetForm}
            >
                <ModalBody
                    title={title}
                    setTitle={setTitle}
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    imageBase64={imageBase64}
                    setImageBase64={setImageBase64}
                    linkUrl={linkUrl}
                    setLinkUrl={setLinkUrl}
                    displayOrder={displayOrder}
                    setDisplayOrder={setDisplayOrder}
                    isActive={isActive}
                    setIsActive={setIsActive}
                    imagePreview={imagePreview}
                    setImagePreview={setImagePreview}
                    handleImageChange={handleImageChange}
                    handleRemoveImage={handleRemoveImage}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    selectedBanner={selectedBanner}
                />
            </InputModal>
        </Box>
    );
};

export default Banners;