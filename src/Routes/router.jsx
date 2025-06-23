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
import Orders from "../Pages/Orders.jsx";
import Shipping from "../Pages/Shipping.jsx";
import Report from "../Pages/Report.jsx";


export const router = createBrowserRouter([
    {
        path: "/admin",
        element: <Login/>
    },
    {
        path:'/admin/admin',
        element: <PrivateRoutes><Sidebar/></PrivateRoutes>,
        children: [
            {
                path:'/admin/admin/dashboard',
                element: <Dashboard/>
            },
            {
                path:'/admin/admin/products',
                element: <Products/>
            },
            {
                path:'/admin/admin/categories',
                element: <ShowCategory/>
            },
            {
                path: '/admin/admin/inventory',
                element: <Inventory/>
            },
            {
                path: '/admin/admin/customers',
                element: <CustomerManagement/>
            },
            {
                path: '/admin/admin/banners',
                element: <Banners/>
            },
            {
                path: '/admin/admin/seo',
                element: <SEO/>
            },
            {
                path: '/admin/admin/chat',
                element: <AdminChat/>
            },
            {
                path: '/admin/admin/orders',
                element: <Orders/>
            },
            {
                path: '/admin/admin/shipping',
                element: <Shipping/>
            },
            {
                path: '/admin/admin/reports',
                element: <Report/>
            },
        ]
    }
]);