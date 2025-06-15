import * as React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Backdrop from '@mui/material/Backdrop';

const Loader = () => {
    const isLoading = useSelector((state) => state.loading.isLoading);

    return (
        <Backdrop
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            open={isLoading}
        >
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    width: '100%',
                    zIndex: (theme) => theme.zIndex.drawer + 1001,
                }}
            >
                <LinearProgress

                    sx={{
                        height: 6,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: (theme) => theme.palette.primary.main,
                        },
                    }}
                />
            </Box>
        </Backdrop>
    );
};

export default Loader;