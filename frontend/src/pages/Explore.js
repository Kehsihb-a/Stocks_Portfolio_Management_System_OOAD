import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid,
    Divider,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Container,
    Alert,
    Chip
} from '@mui/material';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Explore = () => {
    const [news, setNews] = useState([]);
    const [topMovers, setTopMovers] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const extractApiError = (data) => {
        if (!data || typeof data !== 'object') {
            return null;
        }
        return data.error || data.Information || data.Note || data['Error Message'] || null;
    };

    useEffect(() => {
        const fetchTopMovers = async () => {
            try {
                const response = await api.get('/stocks/top-movers');
                const apiError = extractApiError(response.data);
                if (apiError) {
                    setError(apiError);
                    setTopMovers(null);
                    return;
                }
                setTopMovers(response.data);
            } catch (error) {
                console.error('Error fetching top movers:', error);
                setError(error.response?.data || 'Failed to fetch top movers.');
            }
        };

        const fetchNews = async () => {
            try {
                const response = await api.get('/stocks/news');
                const apiError = extractApiError(response.data);
                if (apiError) {
                    setError(apiError);
                    setNews([]);
                    return;
                }
                const newsData = Array.isArray(response.data)
                    ? response.data
                    : (response.data?.feed || []);
                setNews(newsData);
            } catch (error) {
                console.error('Error fetching news:', error);
                setError(error.response?.data || 'Failed to fetch news.');
                setNews([]); // Set empty array on error
            }
        };

        const fetchData = async () => {
            setIsLoading(true);
            await Promise.all([fetchTopMovers(), fetchNews()]);
            setIsLoading(false);
        };

        fetchData();
        // Refresh data every 30 minutes to avoid free-tier rate limits
        const interval = setInterval(fetchData, 1800000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <Box>
                <Navbar />
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                        <CircularProgress />
                    </Box>
                </Container>
            </Box>
        );
    }

    const heatmapData = [
        ...(topMovers?.top_gainers || []).slice(0, 6),
        ...(topMovers?.top_losers || []).slice(0, 6)
    ];

    return (
        <Box sx={{ minHeight: '100vh', pb: 6 }} className="page-shell">
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box className="hero-panel glow-border" sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                        Explore Markets
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Live movers, heatmap pulses, and market headlines curated for you.
                    </Typography>
                </Box>
                {error && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={3}>
                    {/* Market Movers Section */}
                    {topMovers && (
                        <>
                            {/* Top Gainers */}
                            <Grid item xs={12} md={6}>
                                <Paper className="glass-card glow-border" sx={{ overflow: 'hidden', height: '100%' }}>
                                    <Typography variant="h6" sx={{ p: 2, bgcolor: '#1f7a4f', color: 'white', letterSpacing: 0.4 }}>
                                        Top Gainers
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Symbol</TableCell>
                                                    <TableCell>Price</TableCell>
                                                    <TableCell>Change</TableCell>
                                                    <TableCell>Volume</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {topMovers.top_gainers?.slice(0, 5).map((stock, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{stock.ticker}</TableCell>
                                                        <TableCell>${parseFloat(stock.price).toFixed(2)}</TableCell>
                                                        <TableCell sx={{ color: 'success.main' }}>
                                                            +{parseFloat(stock.change_percentage).toFixed(2)}%
                                                        </TableCell>
                                                        <TableCell>{parseInt(stock.volume).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>

                            {/* Top Losers */}
                            <Grid item xs={12} md={6}>
                                <Paper className="glass-card glow-border" sx={{ overflow: 'hidden', height: '100%' }}>
                                    <Typography variant="h6" sx={{ p: 2, bgcolor: '#b63b3b', color: 'white', letterSpacing: 0.4 }}>
                                        Top Losers
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Symbol</TableCell>
                                                    <TableCell>Price</TableCell>
                                                    <TableCell>Change</TableCell>
                                                    <TableCell>Volume</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {topMovers.top_losers?.slice(0, 5).map((stock, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{stock.ticker}</TableCell>
                                                        <TableCell>${parseFloat(stock.price).toFixed(2)}</TableCell>
                                                        <TableCell sx={{ color: 'error.main' }}>
                                                            {parseFloat(stock.change_percentage).toFixed(2)}%
                                                        </TableCell>
                                                        <TableCell>{parseInt(stock.volume).toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        </>
                    )}

                        {heatmapData.length > 0 && (
                            <Grid item xs={12}>
                                <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Market Heatmap
                                    </Typography>
                                    <Box className="heatmap-grid">
                                        {heatmapData.map((stock, idx) => {
                                            const change = parseFloat(stock.change_percentage) || 0;
                                            const intensity = Math.min(0.85, Math.abs(change) / 10 + 0.2);
                                            const base = change >= 0 ? `rgba(31,122,79,${intensity})` : `rgba(182,59,59,${intensity})`;
                                            return (
                                                <Box key={`${stock.ticker}-${idx}`} className="heatmap-tile" sx={{ background: base }}>
                                                    <Typography variant="body2">{stock.ticker}</Typography>
                                                    <Typography variant="caption">
                                                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>
                        )}

                    {/* Market News */}
                    <Grid item xs={12}>
                        <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h4">
                                    Latest Market News
                                </Typography>
                                <Chip label="General" size="small" sx={{ bgcolor: '#e8f3ff' }} />
                            </Box>
                            <Grid container spacing={3}>
                                {news.length > 0 ? (
                                    news.map((item, index) => (
                                        <Grid item xs={12} key={index}>
                                            <Box sx={{ 
                                                mb: 3,
                                                p: 2,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                boxShadow: 1,
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr', md: '160px 1fr' },
                                                gap: 2,
                                                alignItems: 'start'
                                            }}>
                                                <Box sx={{ 
                                                    width: '100%',
                                                    height: 110,
                                                    borderRadius: 2,
                                                    background: item.image
                                                        ? `url(${item.image}) center/cover`
                                                        : 'linear-gradient(135deg, #cfe4ff, #f7fbff)',
                                                    border: '1px solid rgba(0,0,0,0.06)'
                                                }} />
                                                <Box>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {item.source}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h6" component="a" 
                                                        href={item.url} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ 
                                                            textDecoration: 'none',
                                                            color: 'primary.main',
                                                            display: 'block',
                                                            mb: 2,
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                    >
                                                        {item.title || item.headline}
                                                    </Typography>
                                                    {item.summary && (
                                                        <Typography variant="body1" color="text.primary" sx={{ 
                                                            lineHeight: 1.6,
                                                            fontSize: '1rem'
                                                        }}>
                                                            {item.summary}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                {index < news.length - 1 && <Divider sx={{ mt: 3 }} />}
                                            </Box>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Typography variant="body1" color="text.secondary" align="center">
                                            No news available at the moment.
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Explore;
