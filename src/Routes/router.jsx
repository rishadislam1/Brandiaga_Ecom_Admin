import {createBrowserRouter} from "react-router-dom";
import Sidebar from "../Shared/Sidebar.jsx";
import Dashboard from "../Pages/Dashboard.jsx";
import Login from "../Pages/Login.jsx";
import PrivateRoutes from "./PrivateRoutes.jsx";
import Products from "../Pages/Products.jsx";
import ShowCategory from "../Pages/Categories.jsx";
import Inventory from "../Pages/Inventory.jsx";
import CustomerManagement from "../Pages/CustomerManagement.jsx";
import Banners from "../Pages/Banners.jsx";
import SEO from "../Pages/SEO.jsx";
import AdminChat from "../Pages/AdminChat.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login/>
    },
    {
        path:'/admin',
        element: <PrivateRoutes><Sidebar/></PrivateRoutes>,
        children: [
            {
                path:'/admin/dashboard',
                element: <Dashboard/>
            },
            {
                path:'/admin/products',
                element: <Products/>
            },
            {
                path:'/admin/categories',
                element: <ShowCategory/>
            },
            {
                path: '/admin/inventory',
                element: <Inventory/>
            },
            {
                path: '/admin/customers',
                element: <CustomerManagement/>
            },
            {
                path: '/admin/banners',
                element: <Banners/>
            },
            {
                path: '/admin/seo',
                element: <SEO/>
            },
            {
                path: '/admin/chat',
                element: <AdminChat/>
            }
        ]
    }
]);