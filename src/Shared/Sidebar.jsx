import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box,
    Drawer,
    CssBaseline,
    AppBar as MuiAppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Button,
    Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryIcon from "@mui/icons-material/History";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import DiscountIcon from "@mui/icons-material/Percent";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import SeoIcon from "@mui/icons-material/Search";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ApiIcon from "@mui/icons-material/Api";
import TranslateIcon from "@mui/icons-material/Translate";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import { setLoading } from "../redux/Slicers/LoadingSlice.js";

import logoImage from "../assets/images/logo.png";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: open ? 0 : `-${drawerWidth}px`,
    })
);

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
}));

const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/admin/dashboard" },
    { text: "Product Management", icon: <InventoryIcon />, path: "/admin/admin/products" },
    { text: "Category Management", icon: <CategoryIcon />, path: "/admin/admin/categories" },
    { text: "Inventory Management", icon: <InventoryIcon />, path: "/admin/admin/inventory" },
    { text: "Order Management", icon: <ShoppingCartIcon />, path: "/admin/admin/orders" },
    { text: "Customer Management", icon: <PeopleIcon />, path: "/admin/admin/customers" },
    { text: "Transaction History", icon: <HistoryIcon />, path: "/admin/admin/transactions" },
    { text: "Shipping & Delivery Management", icon: <LocalShippingIcon />, path: "/admin/admin/shipping" },
    { text: "Coupon & Discount Management", icon: <DiscountIcon />, path: "/admin/admin/discounts" },
    { text: "Flash Sales & Promotions", icon: <FlashOnIcon />, path: "/admin/admin/promotions" },
    { text: "Banner & Slider Management", icon: <SlideshowIcon />, path: "/admin/admin/banners" },
    { text: "SEO Settings", icon: <SeoIcon />, path: "/admin/admin/seo" },
    { text: "Reports & Analytics", icon: <AnalyticsIcon />, path: "/admin/admin/reports" },
    { text: "Live Chat", icon: <ChatIcon />, path: "/admin/admin/chat" },
];

const Sidebar = () => {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [unreadCount, setUnreadCount] = useState(0);
    const [connection, setConnection] = useState(null);
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setAdminId(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub);
        }

        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:5147/livechatHub", {
                accessTokenFactory: () => token || "",
            })
            .withAutomaticReconnect()
            .build();

        newConnection.on("ReceiveMessage", (message) => {
            if (adminId) {
                setUnreadCount((prev) => prev + 1);
            }
        });

        newConnection.on("Connected", (connectionId) => {
            console.log("Admin connected with ID:", connectionId);
        });

        newConnection.on("UserDisconnected", (connectionId) => {
            console.log("User disconnected:", connectionId);
        });

        newConnection.start().catch((err) => console.error("SignalR connection failed:", err));

        const fetchNotifications = async () => {
            if (adminId) {
                try {
                    const response = await axios.get(`http://localhost:5147/api/notification/user/${adminId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUnreadCount(response.data.data.filter((n) => !n.isRead).length);
                } catch (err) {
                    console.error("Failed to fetch notifications:", err);
                }
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);

        setConnection(newConnection);

        return () => {
            newConnection.stop();
            clearInterval(interval);
        };
    }, [adminId]);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            localStorage.clear();
            navigate("/admin");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const currentMenu = menuItems.find((item) => item.path === location.pathname);

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: "none" }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        {currentMenu ? currentMenu.text : "Welcome"}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <Box>
                    <DrawerHeader>
                        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                            <Link to="/admin/admin">
                                <img
                                    src={logoImage}
                                    alt="Brandiaga Logo"
                                    loading="lazy"
                                    style={{ height: 60, width: 60 }}
                                />
                            </Link>
                        </Box>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List sx={{ flexGrow: 1 }}>
                        {menuItems.map(({ text, icon, path }) => (
                            <ListItem key={text} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={path}
                                    selected={location.pathname === path}
                                    sx={{
                                        "&.Mui-selected": {
                                            backgroundColor: theme.palette.primary.main,
                                            color: "white",
                                            "& .MuiListItemIcon-root": {
                                                color: "white",
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon>
                                        {text === "Live Chat" && unreadCount > 0 ? (
                                            <Badge badgeContent={unreadCount} color="error">
                                                {icon}
                                            </Badge>
                                        ) : (
                                            icon
                                        )}
                                    </ListItemIcon>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Button
                    onClick={handleLogout}
                    sx={{
                        backgroundColor: "black",
                        color: "white",
                        margin: 2,
                        padding: 1.5,
                        borderRadius: 1,
                        "&:hover": {
                            backgroundColor: "#333",
                        },
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        textTransform: "none",
                        fontWeight: "medium",
                    }}
                >
                    <LogoutIcon />
                    Log Out
                </Button>
            </Drawer>

            <Main open={open}>
                <DrawerHeader />
                <Outlet />
            </Main>
        </Box>
    );
};

export default Sidebar;