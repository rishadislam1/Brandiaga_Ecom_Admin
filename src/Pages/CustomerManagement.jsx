import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OrdersTable from '../Components/Table.jsx';
import InputModal from '../Components/InputModal.jsx';
import {
    AddUserRequest,
    DeleteUsersRequest,
    GetUsersRequest,
} from '../Request/UserRequest.jsx';
import { showSuccess } from '../Components/ToasterComponent.jsx';
import { ConfirmAlert } from '../Components/AlertComponent.jsx';
import { setLoading } from '../redux/Slicers/LoadingSlice.js';
import {
    setUsers,
    addUser,
    deleteUser,
} from '../redux/Slicers/UserSlice.js';

const CustomerManagement = () => {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state.users);
    const { isLoading } = useSelector((state) => state.loading);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('User'); // Default role

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
console.log(role)
    const userColumns = [
        { field: 'id', headerName: 'SLNo' },
        { field: 'firstName', headerName: 'First Name' },
        { field: 'lastName', headerName: 'Last Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'phoneNumber', headerName: 'Phone Number' },
        { field: 'role', headerName: 'Role' }, // Added Role column
        {
            field: 'actions',
            headerName: 'Actions',
            renderCell: (params) => (
                <>

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
                const res = await GetUsersRequest();
                if (res?.data?.length) {
                    const transformed = res.data.map((item, index) => ({
                        id: index + 1,
                        firstName: item.firstName,
                        lastName: item.lastName,
                        email: item.email,
                        phoneNumber: item.phoneNumber,
                        role: item.roleName || 'User', // Default to User if role not provided
                        realId: item.userId,
                    }));
                    dispatch(setUsers(transformed));
                }
            } catch (error) {
                console.error('Failed to load users:', error);
            } finally {
                dispatch(setLoading(false));
            }
        })();
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !phoneNumber || !role || (!selectedUser && !password)) return;

        dispatch(setLoading(true));
        try {
            const data = {
                firstName,
                lastName,
                email,
                phoneNumber,
                role, // Include role in the data
                ...(password && { password }), // Include password only if provided
            };

            const res = await AddUserRequest(data);
            if (res?.status === 'Success') {
                showSuccess('User Added Successfully');
                const newUser = {
                    id: users.length + 1,
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    role,
                    realId: res.data?.userId || `uuid${users.length + 1}`,
                };
                dispatch(addUser(newUser));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            dispatch(setLoading(false));
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setPhoneNumber('');
            setRole('User'); // Reset to default
            setSelectedUser(null);
            setModalOpen(false);
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPhoneNumber('');
        setRole('User'); // Default role for new user
        setModalOpen(true);
    };



    const handleDelete = async (userRow) => {
        const result = await ConfirmAlert();
        if (!result) return;

        dispatch(setLoading(true));
        try {
            const realId = userRow.realId;
            const deleteResult = await DeleteUsersRequest(realId);
            if (deleteResult?.status === 'Success') {
                showSuccess(deleteResult?.message);
                dispatch(deleteUser(userRow.id));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const modalBody = (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required={!selectedUser}
                />
                <TextField
                    fullWidth
                    label="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        labelId="role-label"
                        value={role}
                        label="Role"
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="User">User</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {selectedUser ? 'Update' : 'Add'} User
                    </Button>
                </Box>
            </form>
        </Box>
    );

    return (
        <Box sx={{ p: 4 }}>
            <Button variant="contained" onClick={handleAddUser} sx={{ mb: 2 }} disabled={isLoading}>
                Add User
            </Button>

            <OrdersTable
                title="Users"
                orderRows={users.map((row) => ({
                    ...row,
                    firstName: row.firstName || 'N/A',
                    lastName: row.lastName || 'N/A',
                    email: row.email || 'N/A',
                    phoneNumber: row.phoneNumber || 'N/A',
                    role: row.role || 'N/A', // Add role to table data
                }))}
                orderColumns={userColumns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
            />

            <InputModal
                title={selectedUser ? 'Update User' : 'Add User'}
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedUser(null);
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPassword('');
                    setPhoneNumber('');
                    setRole('User'); // Reset role
                }}
            >
                {modalBody}
            </InputModal>
        </Box>
    );
};

export default CustomerManagement;