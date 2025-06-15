import * as React from 'react';
import { useEffect, useState, useCallback, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import OrdersTable from '../Components/Table.jsx';
import InputModal from '../Components/InputModal.jsx';
import {
    AddProductRequest,
    DeleteProductsRequest,
    GetProductsRequest,
    UpdateProductsRequest,
} from '../Request/ProductRequest.jsx';
import { showSuccess, showError } from '../Components/ToasterComponent.jsx';
import { ConfirmAlert } from '../Components/AlertComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import { setCategories } from '../redux/Slicers/CategorySlice.js';
import { setProducts, addProducts, deleteProduct } from '../redux/Slicers/ProductSlice.js';
import { GetCategoriesRequest } from '../Request/CategoryRequest.jsx';
import { baseURL } from '../hooks/useAxiosSecure.jsx';

// Memoized DescriptionEditor Component
const DescriptionEditor = memo(
    ({ value, onChange }) => {
        useEffect(() => {
            console.log('DescriptionEditor re-rendered');
        }, []);

        return (
            <Box sx={{ mt: 2, mb: 2 }}>
                <InputLabel required>Description</InputLabel>
                <Editor
                    apiKey={'p5u69hg1wicaog21xvru3rxyrsqxvmebbvdnysx75hn5k3tr'}
                    value={value}
                    onEditorChange={onChange}
                    init={{
                        height: 300,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'help', 'wordcount',
                        ],
                        toolbar:
                            'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                        content_style: 'body { font-family:Roboto,Helvetica,Arial,sans-serif; font-size:14px }',
                        branding: false,
                        inline: false,
                        setup: (editor) => {
                            editor.on('init', () => editor.focus());
                            editor.on('blur', () => editor.focus());
                        },
                    }}
                />
                {!value.trim() && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                        Description is required
                    </Box>
                )}
            </Box>
        );
    },
    (prevProps, nextProps) => prevProps.value === nextProps.value && prevProps.onChange === nextProps.onChange
);

// Updated orderColumns with MUI IconButton
const getOrderColumns = (baseURL, handleEdit, handleDelete) => [
    { field: 'id', headerName: 'SLNo', width: 80 },
    { field: 'name', headerName: 'Product Name', width: 150 },
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'price', headerName: 'Price', width: 100 },
    { field: 'discountPrice', headerName: 'Discount Price', width: 120 },
    { field: 'category', headerName: 'Category', width: 120 },
    {
        field: 'description',
        headerName: 'Description',
        width: 300,
        renderCell: (params) => (
            <div className="whitespace-normal break-words">
                <div dangerouslySetInnerHTML={{ __html: params.row.description || 'N/A' }} />
            </div>
        ),
    },

    {
        field: 'images',
        headerName: 'Images',
        width: 200,
        renderCell: (params) =>
            params?.row?.imageUrls?.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {params.row.imageUrls.map((url, index) => (
                        <img
                            key={index}
                            src={baseURL + url}
                            alt={`Product ${index}`}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                            onError={(e) => (e.target.src = '/fallback-image.jpg')}
                        />
                    ))}
                </Box>
            ) : (
                'No Images'
            ),
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                    onClick={() => handleEdit(params.row)}
                    aria-label={`Edit product ${params.row.name}`}
                    color="success"
                >
                    <EditIcon />
                </IconButton>
                <IconButton
                    onClick={() => handleDelete(params.row)}
                    aria-label={`Delete product ${params.row.name}`}
                    color="error"
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
    },
];

// ModalBody Component with MUI
const ModalBody = memo(
    ({
         productName,
         setProductName,
         sku,
         setSku,
         price,
         setPrice,
         discountPrice,
         setDiscountPrice,
         category,
         setCategory,
         description,
         setDescription,
         specKey,
         setSpecKey,
         specValue,
         setSpecValue,
         specifications,
         handleAddSpecification,
         handleRemoveSpecification,
         handleImageChange,
         imagePreviews,
         handleRemoveImage,
         categories,
         isLoading,
         handleSubmit,
         resetForm,
         selectedProduct,
     }) => {
        const handleDescriptionChange = useCallback(
            (content) => setDescription(content || ''),
            [setDescription]
        );

        console.log(specifications);

        return (
            <Box sx={{ p: 4, maxWidth: 800, mx: 'auto', bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        margin="normal"
                        required
                        error={!productName.trim()}
                        helperText={!productName.trim() && 'Product name is required'}
                    />
                    <TextField
                        fullWidth
                        label="SKU"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        margin="normal"
                        required
                        error={!sku.trim()}
                        helperText={!sku.trim() && 'SKU is required'}
                    />
                    <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        margin="normal"
                        required
                        error={!price || isNaN(price) || price <= 0}
                        helperText={(!price || isNaN(price) || price <= 0) && 'Enter a valid price'}
                    />
                    <TextField
                        fullWidth
                        label="Discount Price"
                        type="number"
                        value={discountPrice}
                        onChange={(e) => setDiscountPrice(e.target.value)}
                        margin="normal"
                        required
                        error={!discountPrice || isNaN(discountPrice) || discountPrice <= 0}
                        helperText={(!discountPrice || isNaN(discountPrice) || discountPrice <= 0) && 'Enter a valid discount price'}
                    />
                    <FormControl fullWidth margin="normal" required error={!category}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">
                                <em>Select a category</em>
                            </MenuItem>
                            {categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {!category && (
                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                                Category is required
                            </Box>
                        )}
                    </FormControl>
                    <DescriptionEditor value={description} onChange={handleDescriptionChange} />
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <InputLabel required>Specifications</InputLabel>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                            <TextField
                                label="Specification Key"
                                value={specKey}
                                onChange={(e) => setSpecKey(e.target.value)}
                                sx={{ flex: 1 }}
                                placeholder="Enter key"
                            />
                            <TextField
                                label="Specification Value"
                                value={specValue}
                                onChange={(e) => setSpecValue(e.target.value)}
                                sx={{ flex: 1 }}
                                placeholder="Enter value"
                            />
                            <IconButton
                                onClick={handleAddSpecification}
                                disabled={!specKey.trim() || !specValue.trim()}
                                color="primary"
                                aria-label="Add specification"
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                        {specifications.length === 0 && (
                            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mb: 2 }}>
                                At least one specification is required
                            </Box>
                        )}
                        {specifications.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                {specifications.map((spec, index) => (
                                    <Box key={`${spec.key}-${index}`} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                                        <TextField
                                            value={spec.key}
                                            InputProps={{ readOnly: true }}
                                            sx={{ flex: 1 }}
                                            variant="filled"
                                        />
                                        <TextField
                                            value={spec.value}
                                            InputProps={{ readOnly: true }}
                                            sx={{ flex: 1 }}
                                            variant="filled"
                                        />
                                        <IconButton
                                            onClick={() => handleRemoveSpecification(index)}
                                            color="error"
                                            aria-label={`Remove specification ${spec.key}`}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Product Images</InputLabel>
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png"
                            onChange={handleImageChange}
                            style={{ display: 'block', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                        />
                    </Box>
                    {imagePreviews.length > 0 ? (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {imagePreviews.map((preview, index) => (
                                <Box key={preview.url + index} sx={{ position: 'relative' }}>
                                    <img
                                        src={preview.url}
                                        alt={`Preview ${index}`}
                                        style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                                        onError={(e) => {
                                            console.log(`Image failed to load: ${preview.url}`);
                                            e.target.src = '/fallback-image.jpg';
                                        }}
                                    />
                                    <IconButton
                                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
                                        onClick={() => handleRemoveImage(index)}
                                        aria-label={`Remove image ${index}`}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ mt: 2, color: 'text.secondary' }}>No images selected</Box>
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
                            {selectedProduct ? 'Update' : 'Add'} Product
                        </Button>
                    </Box>
                </form>
            </Box>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.productName === nextProps.productName &&
            prevProps.sku === nextProps.sku &&
            prevProps.price === nextProps.price &&
            prevProps.discountPrice === nextProps.discountPrice &&
            prevProps.category === nextProps.category &&
            prevProps.description === nextProps.description &&
            prevProps.specKey === nextProps.specKey &&
            prevProps.specValue === nextProps.specValue &&
            prevProps.specifications === nextProps.specifications &&
            prevProps.imagePreviews === nextProps.imagePreviews &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.selectedProduct === nextProps.selectedProduct
        );
    }
);

const Products = () => {
    const dispatch = useDispatch();
    const { products } = useSelector((state) => state.products);
    const { categories } = useSelector((state) => state.categories);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productName, setProductName] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [specKey, setSpecKey] = useState('');
    const [specValue, setSpecValue] = useState('');
    const [specifications, setSpecifications] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

    // Reset form
    const resetForm = useCallback(() => {
        setProductName('');
        setSku('');
        setPrice('');
        setDiscountPrice('');
        setCategory('');
        setDescription('');
        setSpecKey('');
        setSpecValue('');
        setSpecifications([]);
        setNewImages([]);
        setExistingImages([]);
        setImagePreviews([]);
        setSelectedProduct(null);
        setModalOpen(false);
    }, []);

    // Fetch image as file for existing images
    const fetchImageAsFile = useCallback(async (url, filename) => {
        try {
            const response = await fetch(baseURL + url, { mode: 'cors' });
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();
            return new File([blob], filename || `image-${Date.now()}.jpg`, {
                type: blob.type,
            });
        } catch (error) {
            console.error(`Failed to fetch image: ${url}`, error);
            return null;
        }
    }, []);

    // Handle image selection and preview
    const handleImageChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        console.log('Files selected:', selectedFiles);
        const validFiles = selectedFiles.filter((file) => {
            const extension = file.name.split('.').pop().toLowerCase();
            const validExtensions = ['jpg', 'jpeg', 'png'];
            if (!validExtensions.includes(extension)) {
                showError(`Invalid file type: ${file.name}. Only JPG and PNG are allowed.`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                showError(`File size exceeds 5MB: ${file.name}`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const newPreviews = validFiles.map((file, index) => ({
            url: URL.createObjectURL(file),
            isNew: true,
            index: newImages.length + index,
        }));

        setNewImages((prev) => [...prev, ...validFiles]);
        setImagePreviews((prev) => {
            const updatedPreviews = [...prev, ...newPreviews];
            console.log('Updated imagePreviews:', updatedPreviews);
            return updatedPreviews;
        });
    }, [newImages.length]);

    // Handle image removal
    const handleRemoveImage = useCallback((index) => {
        setImagePreviews((prev) => {
            const preview = prev[index];
            if (!preview) return prev;

            const newPreviews = prev.filter((_, i) => i !== index);
            console.log('Removed image, new previews:', newPreviews);

            if (preview.isNew) {
                URL.revokeObjectURL(preview.url);
                setNewImages((prevImages) => prevImages.filter((_, i) => i !== preview.index));
            } else {
                setExistingImages((prevImages) => prevImages.filter((url) => (baseURL + url) !== preview.url));
            }

            return newPreviews;
        });
    }, []);

    // Handle adding a specification
    const handleAddSpecification = useCallback(() => {
        if (!specKey.trim() || !specValue.trim()) {
            showError('Please enter both specification key and value.');
            return;
        }

        if (specifications.some((spec) => spec.key === specKey.trim())) {
            showError('Specification key already exists.');
            return;
        }

        setSpecifications((prev) => [...prev, { key: specKey.trim(), value: specValue.trim() }]);
        setSpecKey('');
        setSpecValue('');
    }, [specKey, specValue, specifications]);

    // Handle removing a specification
    const handleRemoveSpecification = useCallback((index) => {
        setSpecifications((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Handle form submission
    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (
                !productName.trim() ||
                !sku.trim() ||
                !price ||
                isNaN(price) ||
                price <= 0 ||
                !discountPrice ||
                isNaN(discountPrice) ||
                discountPrice <= 0 ||
                !category ||
                !description.trim() ||
                specifications.length === 0
            ) {
                showError('Please fill in all required fields with valid values.');
                return;
            }

            dispatch(setLoading(true));
            try {
                const formData = new FormData();
                formData.append('name', productName.trim());
                formData.append('sku', sku.trim());
                formData.append('price', parseFloat(price));
                formData.append('discountPrice', parseFloat(discountPrice));
                const categoryId = categories.find((cat) => cat.name === category)?.realId;
                if (!categoryId) {
                    showError('Invalid category selected.');
                    dispatch(setLoading(false));
                    return;
                }
                formData.append('categoryId', categoryId);
                formData.append('description', description);

                const specObject = specifications.reduce((obj, item) => {
                    obj[item.key] = item.value;
                    return obj;
                }, {});
                if (Object.keys(specObject).length === 0) {
                    showError('At least one specification is required.');
                    dispatch(setLoading(false));
                    return;
                }
                formData.append('specification', JSON.stringify(specObject));

                newImages.forEach((image) => formData.append('images', image));

                if (selectedProduct) {
                    if (existingImages.length > 0) {
                        const existingImageFiles = await Promise.all(
                            existingImages.map((url, index) => fetchImageAsFile(url, `image-${index}.jpg`))
                        );
                        const validFiles = existingImageFiles.filter((file) => file !== null);
                        validFiles.forEach((file) => formData.append('images', file));
                    }

                    const result = await UpdateProductsRequest(selectedProduct.realId, formData);
                    if (result?.status === 'Success') {
                        showSuccess(result.message);
                        const prodRes = await GetProductsRequest();
                        if (prodRes?.data?.length) {
                            const transformedProducts = prodRes.data.map((item, index) => ({
                                id: index + 1,
                                name: item.name || 'N/A',
                                sku: item.sku || 'N/A',
                                price: item.price || 0,
                                discountPrice: item.discountPrice || 0,
                                category: categories.find((cat) => cat.realId === item.categoryId)?.name || 'None',
                                description: item.description || '',
                                specification: item.specification || {},
                                realId: item.productId,
                                imageUrls: item.imageUrls || [],
                            }));
                            dispatch(setProducts(transformedProducts));
                        }
                    }
                } else {
                    const res = await AddProductRequest(formData);
                    if (res?.status === 'Success') {
                        showSuccess('Product Added Successfully');
                        const newProduct = {
                            id: products.length + 1,
                            name: productName.trim(),
                            sku: sku.trim(),
                            price: parseFloat(price),
                            discountPrice: parseFloat(discountPrice),
                            category,
                            description,
                            specification: specObject,
                            realId: res.data?.productId,
                            imageUrls: res.data?.imageUrls || [],
                        };
                        dispatch(addProducts(newProduct));
                    }
                }
            } catch (error) {
                showError('Failed to save product. Please try again.');
                console.error('Error:', error);
            } finally {
                resetForm();
                dispatch(setLoading(false));
            }
        },
        [
            productName,
            sku,
            price,
            discountPrice,
            category,
            description,
            specifications,
            newImages,
            existingImages,
            selectedProduct,
            categories,
            products.length,
            dispatch,
            fetchImageAsFile,
            resetForm,
        ]
    );

    // Handle edit
    const handleEdit = useCallback((product) => {
        setSelectedProduct(product);
        setProductName(product.name || '');
        setSku(product.sku || '');
        setPrice(product.price || '');
        setDiscountPrice(product.discountPrice || '');
        setCategory(product.category || '');
        setDescription(product.description || '');
        setSpecifications(
            product.specification && typeof product.specification === 'string' && product.specification.trim() !== ''
                ? Object.entries(JSON.parse(product.specification)).map(([key, value]) => ({ key, value }))
                : product.specification && typeof product.specification === 'object' && Object.keys(product.specification).length > 0
                    ? Object.entries(product.specification).map(([key, value]) => ({ key, value }))
                    : []
        );
        setNewImages([]);
        setExistingImages(product.imageUrls || []);
        setImagePreviews(
            (product.imageUrls || []).map((url, index) => ({
                url: baseURL + url,
                isNew: false,
                index,
            }))
        );
        setModalOpen(true);
    }, []);

    // Handle delete
    const handleDelete = useCallback(
        async (productRow) => {
            const result = await ConfirmAlert();
            if (!result) return;

            dispatch(setLoading(true));
            try {
                const deleteResult = await DeleteProductsRequest(productRow.realId);
                if (deleteResult?.status === 'Success') {
                    showSuccess(deleteResult.message);
                    dispatch(deleteProduct(productRow.id));
                } else {
                    showError('Failed to delete product.');
                }
            } catch (error) {
                showError('Failed to delete product. Please try again.');
                console.error('Failed to delete product:', error);
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch]
    );

    // Fetch categories and products on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(setLoading(true));

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

                const prodRes = await GetProductsRequest();
                if (prodRes?.data?.length) {
                    const transformedProducts = prodRes.data.map((item, index) => ({
                        id: index + 1,
                        name: item.name || 'N/A',
                        sku: item.sku || 'N/A',
                        price: item.price || 0,
                        discountPrice: item.discountPrice || 0,
                        category: categories.find((cat) => cat.realId === item.categoryId)?.name || 'None',
                        description: item.description || '',
                        specification: item.specification || {},
                        realId: item.productId,
                        imageUrls: item.imageUrls || [],
                    }));
                    dispatch(setProducts(transformedProducts));
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

    // Clean up image previews
    useEffect(() => {
        return () => {
            imagePreviews.forEach((preview) => {
                if (preview.isNew) URL.revokeObjectURL(preview.url);
            });
        };
    }, [imagePreviews]);

    return (
        <Box sx={{ p: 4, bgcolor: 'grey.100', minHeight: '100vh', width: '99%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Product Management</h1>
                <Button
                    variant="contained"
                    onClick={() => setModalOpen(true)}
                    disabled={isLoading}
                >
                    Add Product
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', color: 'error.main' }}>
                    No categories available. Please add a category first.
                </Box>
            ) : (
                <OrdersTable
                    title="Products"
                    orderRows={products.map((row) => ({
                        ...row,
                        name: row.name || 'N/A',
                        sku: row.sku || 'N/A',
                        price: row.price || 0,
                        discountPrice: row.discountPrice || 0,
                        category: row.category || 'None',
                        description: row.description || 'N/A',
                        specification: row.specification || {},
                        imageUrls: row.imageUrls || [],
                    }))}
                    orderColumns={getOrderColumns(baseURL, handleEdit, handleDelete)}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            )}

            <InputModal
                title={selectedProduct ? 'Update Product' : 'Add Product'}
                open={modalOpen}
                onClose={resetForm}
            >
                <ModalBody
                    productName={productName}
                    setProductName={setProductName}
                    sku={sku}
                    setSku={setSku}
                    price={price}
                    setPrice={setPrice}
                    discountPrice={discountPrice}
                    setDiscountPrice={setDiscountPrice}
                    category={category}
                    setCategory={setCategory}
                    description={description}
                    setDescription={setDescription}
                    specKey={specKey}
                    setSpecKey={setSpecKey}
                    specValue={specValue}
                    setSpecValue={setSpecValue}
                    specifications={specifications}
                    handleAddSpecification={handleAddSpecification}
                    handleRemoveSpecification={handleRemoveSpecification}
                    handleImageChange={handleImageChange}
                    imagePreviews={imagePreviews}
                    handleRemoveImage={handleRemoveImage}
                    categories={categories}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                    selectedProduct={selectedProduct}
                />
            </InputModal>
        </Box>
    );
};

export default Products;