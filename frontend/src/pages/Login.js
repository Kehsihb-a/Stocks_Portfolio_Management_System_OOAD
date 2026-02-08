import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Paper,
    Container,
    Alert,
    Divider
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as loginApi } from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const data = await loginApi({ email, password });
            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
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
                            StockTracker
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Track your portfolio, explore markets, and trade with confidence.
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #e8f1ff 0%, #ffffff 100%)',
                                border: '1px solid rgba(29, 95, 209, 0.12)'
                            }}
                        >
                            <Typography variant="subtitle2" color="text.secondary">
                                Tip
                            </Typography>
                            <Typography variant="body2">
                                Use your demo user to explore features before you trade.
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
                            Sign In
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Welcome back. Continue building your portfolio.
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
                                id="email"
                                label="Email Address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.2, borderRadius: 2 }}
                            >
                                Sign In
                            </Button>
                            
                            <Divider sx={{ my: 2 }}>
                                <Typography color="textSecondary" variant="body2">
                                    OR
                                </Typography>
                            </Divider>
                            
                            <Box textAlign="center">
                                <Typography variant="body2" color="textSecondary">
                                    Don't have an account?{' '}
                                    <RouterLink 
                                        to="/register"
                                        style={{ textDecoration: 'none', color: 'var(--brand-600)' }}
                                    >
                                        Sign Up
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

export default Login; 
