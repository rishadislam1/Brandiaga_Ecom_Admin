import React, {useEffect, useState} from 'react';
import { Button, TextField, Typography, Card, CardContent, Divider, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logoImage from "../assets/images/logo.png";
import {useNavigate} from "react-router-dom";
import {LoginRequest} from "../Request/AuthRequest.jsx";
import {showError, showSuccess} from "../Components/ToasterComponent.jsx";


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isAuthenticated = !!localStorage.getItem('token');
    const from = location.state?.from?.pathname || "/admin/dashboard";

    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            // ✅ If already logged in, redirect back to the page you came from (or dashboard)
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, from, navigate]);
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
            setEmailError('Please enter a valid email');
        } else {
            setEmailError('');
        }
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (e.target.value && e.target.value.length < 6) {
            setPasswordError('Password must be at least 6 characters');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            if (!email) setEmailError('Email is required');
            if (!password) setPasswordError('Password is required');
            return;
        }
        if (!emailError && !passwordError) {

            const data = {email,password};
            const res = await LoginRequest(data);

            if(res.message === "Login Successfull" && res.data.roleName === "Admin"){
                localStorage.setItem('token', res.data.token);
                showSuccess("Successfully Login");
                navigate('/admin')
            }else{
                showError("You don't have permission to this portal.")
            }

        }
    };

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
                <CardContent className="p-10">
                    <div className="flex justify-center mb-8">
                        <img src={logoImage} alt="Logo" className="h-20 w-auto" />
                    </div>
                    <Typography variant="h4" className="text-center font-bold mb-2 text-gray-800">
                        Admin Portal
                    </Typography>
                    <Typography variant="subtitle1" className="text-center mb-8 text-gray-500">
                        Sign in to access your dashboard
                    </Typography>
                    <Divider className="mb-8"  sx={{ mt: 3 }}/>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <TextField
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            error={!!emailError}
                            helperText={emailError}
                            className="bg-white rounded-lg"
                            sx={{ mt: 2 }}
                            InputProps={{
                                className: "rounded-lg",
                            }}
                            InputLabelProps={{
                                className: "text-gray-600",
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            error={!!passwordError}
                            helperText={passwordError}
                            className="bg-white rounded-lg"
                            sx={{ mt: 3 }}
                            InputProps={{
                                className: "rounded-lg",
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            InputLabelProps={{
                                className: "text-gray-600",
                            }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            className="py-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-md transition duration-300"
                            sx={{ mt: 5 }}
                            disabled={!!emailError || !!passwordError}
                        >
                            Sign In
                        </Button>
                    </form>
                    <Typography className="text-center mt-6 text-gray-600 text-sm"  sx={{ mt: 4 }}>
                        Forgot your password?{' '}
                        <a href="#" className="text-blue-600 hover:underline font-medium">
                            Reset it here
                        </a>
                    </Typography>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;