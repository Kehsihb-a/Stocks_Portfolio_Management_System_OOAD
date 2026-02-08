import React from 'react';
import { Box, Container, Grid, Typography, Paper } from '@mui/material';
import Navbar from '../components/Navbar';
import HoldingsList from '../components/HoldingsList';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <Box sx={{ minHeight: '100vh', pb: 6 }} className="page-shell">
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Welcome Section */}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="hero-panel glow-border" sx={{ mb: 3 }}>
                            <Typography variant="h4" gutterBottom fontWeight={700}>
                                Welcome back, {user?.name || user?.email}
                            </Typography>
                            <Typography variant="subtitle1">
                                Track your portfolio, explore markets, and manage your watchlists.
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Holdings Section */}
                    <Grid item xs={12}>
                        <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                            <Typography variant="h5" gutterBottom fontWeight="medium" sx={{ mb: 3 }}>
                                Your Portfolio
                            </Typography>
                            <HoldingsList />
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Home; 
