import * as React from 'react';
import { Navigate, Outlet, useNavigation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {setLoading} from "../redux/Slicers/LoadingSlice.js";

const PrivateRoutes = ({ children }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    React.useEffect(() => {
        if (navigation.state === 'loading') {
            dispatch(setLoading(true));
        } else {
            dispatch(setLoading(false));
        }
    }, [navigation.state, dispatch]);

    const isAuthenticated = !!localStorage.getItem('token');

    React.useEffect(() => {
        const checkAuth = async () => {
            dispatch(setLoading(true));
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                dispatch(setLoading(false));
            }
        };
        checkAuth();
    }, [dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // ⬇️ Render passed children instead of <Outlet />
    return children;
};


export default PrivateRoutes;