// src/Categories.jsx
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
    AddCategoryRequest,
    DeleteCategoriesRequest,
    GetCategoriesRequest,
    UpdateCategoriesRequest,
} from '../Request/CategoryRequest.jsx';
import { showSuccess } from '../Components/ToasterComponent.jsx';
import { ConfirmAlert } from '../Components/AlertComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import {
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} from '../redux/Slicers/CategorySlice.js';

const Categories = () => {
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.categories);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [parentCategory, setParentCategory] = useState('');

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });

    const orderColumns = [
        { field: 'id', headerName: 'SLNo' },
        { field: 'name', headerName: 'Category Name' },
        { field: 'parent', headerName: 'Parent Category' },
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
                dispatch(setLoading(true));
                const res = await GetCategoriesRequest();
                if (res?.data?.length) {
                    const transformed = res.data.map((item, index) => ({
                        id: index + 1,
                        name: item.name,
                        parent: item.parentCategoryName || null,
                        realId: item.categoryId,
                    }));
                    dispatch(setCategories(transformed));
                }
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName) return;

        dispatch(setLoading(true));
        try {
            if (selectedCategory) {
                // Update category
                const parentCategoryId = categories.find((cat) => cat.name === parentCategory)?.realId || null;
                const data = {
                    name: categoryName,
                    parentCategoryId,
                };
                const result = await UpdateCategoriesRequest(selectedCategory.realId, data);
                if (result?.status === 'Success') {
                    showSuccess(result?.message);
                    dispatch(updateCategory({ id: selectedCategory.id, name: categoryName, parent: parentCategory || null }));
                }
            } else {
                // Add category
                const parentCategoryId = categories.find((cat) => cat.name === parentCategory)?.realId || null;
                const data = {
                    name: categoryName,
                    parentCategoryId,
                };
                const res = await AddCategoryRequest(data);
                if (res?.status === 'Success') {
                    showSuccess('Category Added Successfully');
                    const newCategory = {
                        id: categories.length + 1,
                        name: categoryName,
                        parent: parentCategory || null,
                        realId: res.data?.categoryId || `uuid${categories.length + 1}`, // Adjust based on API response
                    };
                    dispatch(addCategory(newCategory));
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            dispatch(setLoading(false));
            setCategoryName('');
            setParentCategory('');
            setSelectedCategory(null);
            setModalOpen(false);
        }
    };

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setCategoryName('');
        setParentCategory('');
        setModalOpen(true);
    };

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setCategoryName(category.name || '');
        setParentCategory(category.parent || '');
        setModalOpen(true);
    };

    const handleDelete = async (categoryRow) => {
        const result = await ConfirmAlert();
        if (!result) return;

        dispatch(setLoading(true));
        try {
            const realId = categoryRow.realId;
            const deleteResult = await DeleteCategoriesRequest(realId);
            if (deleteResult?.status === 'Success') {
                showSuccess(deleteResult?.message);
                dispatch(deleteCategory(categoryRow.id));
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const modalBody = (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    select
                    label="Parent Category"
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    margin="normal"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </TextField>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {selectedCategory ? 'Update' : 'Add'} Category
                    </Button>
                </Box>
            </form>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Button variant="contained" onClick={handleAddCategory} sx={{ mb: 2 }} disabled={isLoading}>
                Add Category
            </Button>


            <OrdersTable
                title="Categories"
                orderRows={categories.map((row) => ({
                    ...row,
                    name: row.name || 'N/A',
                    parent: row.parent || 'None',
                }))}
                orderColumns={orderColumns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />

            <InputModal
                title={selectedCategory ? 'Update Category' : 'Add Category'}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedCategory(null);
                    setCategoryName('');
                    setParentCategory('');
                }}
            >
                {modalBody}
            </InputModal>
        </Box>
    );
};

export default Categories;