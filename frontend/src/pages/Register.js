import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Alert, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { register } from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobileNo: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await register(formData);
            login(response.user, response.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Container component="main" maxWidth="sm">
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
                        gap: 3
                    }}
                >
                    <Box className="hero-panel glow-border" sx={{ p: 2 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: -1, mb: 2 }}>
                            Join StockTracker
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Build watchlists, track holdings, and explore market news.
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #e7f7f0 0%, #ffffff 100%)',
                                border: '1px solid rgba(12, 120, 80, 0.12)'
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                Secure by default
                            </Typography>
                            <Typography variant="body2">
                                We never store plain text passwords and always use JWT tokens.
                            </Typography>
                        </Paper>
                    </Box>
                    <Paper
                        elevation={0}
                        className="glass-card glow-border"
                        sx={{
                            p: 4,
                            borderRadius: 4
                        }}
                    >
                        <Typography component="h1" variant="h5" sx={{ mb: 1, textAlign: 'left', fontWeight: 600 }}>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Start tracking your portfolio in minutes.
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                autoFocus
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Mobile Number"
                                value={formData.mobileNo}
                                onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.2, borderRadius: 2 }}
                            >
                                Sign Up
                            </Button>
                            <Box textAlign="center">
                                <Typography variant="body2" color="textSecondary">
                                    Already have an account?{' '}
                                    <RouterLink 
                                        to="/"
                                        style={{ textDecoration: 'none', color: 'var(--brand-600)' }}
                                    >
                                        Sign In
                                    </RouterLink>
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default Register; 
