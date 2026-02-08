import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Chip, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExploreIcon from '@mui/icons-material/Explore';
import MarketTicker from './MarketTicker';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleLogoClick = () => {
        navigate('/dashboard');
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleProfileMenuClose();
        navigate('/profile');
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleProfileMenuClose();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: 'linear-gradient(120deg, rgba(12,27,42,0.95) 0%, rgba(29,95,209,0.95) 55%, rgba(42,114,255,0.95) 100%)',
                    backdropFilter: 'blur(14px)',
                    borderBottom: '1px solid rgba(255,255,255,0.12)'
                }}
            >
                <Toolbar sx={{ minHeight: 70 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, cursor: 'pointer' }} onClick={handleLogoClick}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #e8f1ff, #ffffff)',
                            display: 'grid',
                            placeItems: 'center',
                            color: '#1d5fd1',
                            fontWeight: 700,
                            boxShadow: '0 8px 24px rgba(12,60,120,0.2)'
                        }}
                    >
                        ST
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                        StockTracker
                    </Typography>
                    <Chip
                        label="LIVE"
                        size="small"
                        sx={{
                            ml: 1,
                            bgcolor: 'rgba(255,255,255,0.16)',
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                </Box>
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ExploreIcon />}
                            onClick={() => navigate('/explore')}
                            sx={{
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.4)',
                                borderRadius: 999,
                                px: 2.5,
                                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Explore
                        </Button>
                        <Chip
                            avatar={<Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>{user.email?.[0]?.toUpperCase()}</Avatar>}
                            label={user.email}
                            onClick={handleProfileMenuOpen}
                            sx={{
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.12)',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        />
                        <IconButton 
                            color="inherit"
                            onClick={handleProfileMenuOpen}
                            aria-controls="profile-menu"
                            aria-haspopup="true"
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <Menu
                            id="profile-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleProfileMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    mt: 1,
                                    minWidth: 160
                                }
                            }}
                        >
                            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                )}
                </Toolbar>
            </AppBar>
            {user && <MarketTicker />}
        </Box>
    );
};

export default Navbar; 
