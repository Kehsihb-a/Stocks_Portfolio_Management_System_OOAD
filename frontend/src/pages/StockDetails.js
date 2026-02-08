import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Grid, Button,
    ButtonGroup, CircularProgress, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
    Divider, Chip
} from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const INTERVALS = ['1min', '5min', '15min', '30min', '1h', '1day', '1week'];

const StockDetails = () => {
    const { symbol } = useParams();
    const [stockData, setStockData] = useState(null);
    const [quote, setQuote] = useState(null);
    const [selectedInterval, setSelectedInterval] = useState('1h');
    const [loading, setLoading] = useState(true);
    const { user, login: updateAuth } = useAuth();
    const [openBuyDialog, setOpenBuyDialog] = useState(false);
    const [openSellDialog, setOpenSellDialog] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [holdings, setHoldings] = useState(null);
    const [fundamentals, setFundamentals] = useState(null);
    const [financials, setFinancials] = useState(null);
    const [companyNews, setCompanyNews] = useState([]);
    const [compareSymbols, setCompareSymbols] = useState('');
    const [compareResults, setCompareResults] = useState([]);
    const [note, setNote] = useState('');
    const [alerts, setAlerts] = useState([]);
    const [alertPrice, setAlertPrice] = useState('');

    const normalizeQuote = (data) => {
        if (!data || typeof data !== 'object') {
            return null;
        }
        const hasPrice =
            data.close !== undefined ||
            data.price !== undefined ||
            data.last !== undefined ||
            data.regularMarketPrice !== undefined;
        if (!hasPrice && (data.status === 'error' || data.code || data.message || data.Note)) {
            setError(data.message || data.Note || 'Quote unavailable. Check API key or rate limit.');
            return null;
        }
        const close = parseFloat(
            data.close ?? data.price ?? data.last ?? data.regularMarketPrice
        );
        const percentChange = parseFloat(
            data.percent_change ?? data.change_percent ?? data.percentChange ?? data.change
        );
        return {
            ...data,
            close: Number.isFinite(close) ? close : null,
            percent_change: Number.isFinite(percentChange) ? percentChange : 0
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchStockData(),
                    fetchQuote(),
                    fetchHoldings(),
                    fetchFundamentals(),
                    fetchFinancials(),
                    fetchCompanyNews()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };
        
        fetchData();
    }, [symbol]);

    useEffect(() => {
        if (success) {
            fetchHoldings();
        }
    }, [success]);

    useEffect(() => {
        const storedNote = localStorage.getItem(`note:${symbol}`);
        setNote(storedNote || '');
        const storedAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        setAlerts(storedAlerts.filter(a => a.symbol === symbol));
    }, [symbol]);

    const fetchStockData = async () => {
        try {
            const response = await api.get(`/stocks/${symbol}/data?interval=${selectedInterval}`);
            // Transform data for chart
            const chartData = response.data?.values?.map(item => ({
                time: new Date(item.datetime).toLocaleString(),
                price: parseFloat(item.close),
                volume: parseInt(item.volume),
                high: parseFloat(item.high),
                low: parseFloat(item.low),
                open: parseFloat(item.open)
            })) || [];
            setStockData(chartData.reverse());
        } catch (error) {
            console.error('Error fetching stock data:', error);
        }
    };

    const fetchQuote = async () => {
        try {
            const response = await api.get(`/stocks/${symbol}/quote`);
            setQuote(normalizeQuote(response.data));
        } catch (error) {
            console.error('Error fetching quote:', error);
            setError('Quote unavailable. Please try again.');
        }
    };

    const fetchHoldings = async () => {
        try {
            const response = await api.get(`/holdings/${symbol}`);
            setHoldings(response.data);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching holding:', error);
            }
        }
    };

    const fetchFundamentals = async () => {
        try {
            const response = await api.get(`/stocks/${symbol}/fundamentals`);
            if (response.data?.Note || response.data?.["Error Message"]) {
                setError(response.data.Note || response.data["Error Message"]);
                return;
            }
            setFundamentals(response.data);
        } catch (error) {
            console.error('Error fetching fundamentals:', error);
            setError('Failed to fetch fundamentals.');
        }
    };

    const fetchFinancials = async () => {
        try {
            const response = await api.get(`/stocks/${symbol}/financials`);
            if (response.data?.Note || response.data?.["Error Message"]) {
                setError(response.data.Note || response.data["Error Message"]);
                return;
            }
            setFinancials(response.data);
        } catch (error) {
            console.error('Error fetching financials:', error);
            setError('Failed to fetch financials.');
        }
    };

    const fetchCompanyNews = async () => {
        try {
            const response = await api.get(`/stocks/${symbol}/news`);
            const newsData = Array.isArray(response.data) ? response.data : [];
            setCompanyNews(newsData.slice(0, 6));
        } catch (error) {
            console.error('Error fetching company news:', error);
        }
    };

    const handleBuy = async () => {
        try {
            if (!quote?.close) {
                setError('Price not available yet. Please try again.');
                return;
            }
            const response = await api.post('/transactions/buy', {
                symbol,
                quantity: parseFloat(quantity),
                price: quote.close
            });
            updateAuth({ ...user, balance: response.data.user.balance }, localStorage.getItem('token'));
            setSuccess('Successfully bought stocks!');
            fetchHoldings();
            setOpenBuyDialog(false);
            setQuantity('');
        } catch (error) {
            console.error('Error buying stock:', error);
            setError(error.response?.data || 'Failed to buy stock');
        }
    };

    const handleSell = async () => {
        try {
            if (!quote?.close) {
                setError('Price not available yet. Please try again.');
                return;
            }
            const response = await api.post('/transactions/sell', {
                symbol,
                quantity: parseFloat(quantity),
                price: quote.close
            });
            updateAuth({ ...user, balance: response.data.user.balance }, localStorage.getItem('token'));
            setSuccess('Successfully sold stocks!');
            fetchHoldings();
            setOpenSellDialog(false);
            setQuantity('');
        } catch (error) {
            console.error('Error selling stock:', error);
            setError(error.response?.data || 'Failed to sell stock');
        }
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        setQuantity(value);
        setError(''); // Clear any previous errors
    };

    const handleSaveNote = () => {
        localStorage.setItem(`note:${symbol}`, note);
        setSuccess('Note saved.');
    };

    const handleAddAlert = () => {
        if (!alertPrice || isNaN(parseFloat(alertPrice))) {
            setError('Enter a valid alert price.');
            return;
        }
        const newAlert = {
            id: Date.now(),
            symbol,
            target: parseFloat(alertPrice),
            createdAt: new Date().toISOString()
        };
        const all = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        const next = [...all, newAlert];
        localStorage.setItem('priceAlerts', JSON.stringify(next));
        setAlerts(next.filter(a => a.symbol === symbol));
        setAlertPrice('');
        setSuccess('Alert added.');
    };

    const handleRemoveAlert = (id) => {
        const all = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
        const next = all.filter(a => a.id !== id);
        localStorage.setItem('priceAlerts', JSON.stringify(next));
        setAlerts(next.filter(a => a.symbol === symbol));
    };

    const handleCompare = async () => {
        const symbols = compareSymbols.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).slice(0, 3);
        if (!symbols.length) {
            setError('Enter up to 3 symbols to compare.');
            return;
        }
        try {
            const results = await Promise.all(
                symbols.map(sym =>
                    api.get(`/stocks/${sym}/quote`)
                        .then(r => ({ symbol: sym, data: r.data }))
                        .catch(() => ({ symbol: sym, data: null }))
                )
            );
            setCompareResults(results);
        } catch {
            setCompareResults([]);
        }
    };

    const formatNumber = (value) => {
        const num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const renderFundamentals = () => {
        if (!fundamentals) return null;

        return (
            <Grid item xs={12}>
                <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Company Fundamentals
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Market Cap
                                        </Typography>
                                    <Typography variant="h6">
                                        {fundamentals.MarketCapitalization
                                            ? `$${(parseFloat(fundamentals.MarketCapitalization) / 1e9).toFixed(2)}B`
                                            : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            P/E Ratio
                                        </Typography>
                                    <Typography variant="h6">
                                        {fundamentals.PERatio || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Dividend Yield
                                        </Typography>
                                    <Typography variant="h6">
                                        {fundamentals.DividendYield ? `${(parseFloat(fundamentals.DividendYield) * 100).toFixed(2)}%` : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Beta
                                        </Typography>
                                    <Typography variant="h6">
                                        {fundamentals.Beta || 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Book Value
                                        </Typography>
                                    <Typography variant="h6">
                                        {fundamentals.BookValue ? `$${fundamentals.BookValue}` : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            EPS
                                        </Typography>
                                    <Typography variant="h6">
                                        {fundamentals.EPS ? `$${fundamentals.EPS}` : 'N/A'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        );
    };

    const renderPriceChart = () => {
        if (!stockData || stockData.length === 0) return null;

        return (
            <Grid item xs={12}>
                <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Price History
                    </Typography>
                    <ButtonGroup 
                        variant="outlined" 
                        size="small" 
                        sx={{ mb: 2 }}
                    >
                        {INTERVALS.map((interval) => (
                            <Button
                                key={interval}
                                onClick={() => setSelectedInterval(interval)}
                                variant={selectedInterval === interval ? 'contained' : 'outlined'}
                            >
                                {interval}
                            </Button>
                        ))}
                    </ButtonGroup>
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <LineChart data={stockData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="time"
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis 
                                    domain={['auto', 'auto']}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke="#8884d8" 
                                    dot={false}
                                    name="Price"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </Grid>
        );
    };

    const renderFinancials = () => {
        if (financials?.annualReports) {
            const last5Years = financials.annualReports.slice(0, 5);
            const chartData = last5Years.map(report => ({
                year: report.fiscalDateEnding.split('-')[0],
                operatingCashFlow: parseFloat(report.operatingCashflow) / 1e6,
                netIncome: parseFloat(report.netIncome) / 1e6
            })).reverse();

            return (
                <Grid item xs={12}>
                <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Financial Performance
                    </Typography>
                        <Box sx={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis 
                                        label={{ 
                                            value: 'USD (Millions)', 
                                            angle: -90, 
                                            position: 'insideLeft' 
                                        }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="operatingCashFlow" fill="#8884d8" name="Operating Cash Flow" />
                                    <Bar dataKey="netIncome" fill="#82ca9d" name="Net Income" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            );
        }

        if (financials?.metric) {
            const m = financials.metric;
            return (
                <Grid item xs={12}>
                <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Financial Snapshot
                    </Typography>
                    <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Net Margin (TTM)
                                        </Typography>
                                        <Typography variant="h6">
                                            {m.netMarginTTM ? `${(parseFloat(m.netMarginTTM) * 100).toFixed(2)}%` : 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Operating Margin (TTM)
                                        </Typography>
                                        <Typography variant="h6">
                                            {m.operatingMarginTTM ? `${(parseFloat(m.operatingMarginTTM) * 100).toFixed(2)}%` : 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            ROE (TTM)
                                        </Typography>
                                        <Typography variant="h6">
                                            {m.roeTTM ? `${(parseFloat(m.roeTTM) * 100).toFixed(2)}%` : 'N/A'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            );
        }

        return null;
    };

    if (loading) {
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

    return (
        <Box sx={{ minHeight: '100vh', pb: 6 }} className="page-shell">
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                <Grid container spacing={3}>
                    {/* Stock Info */}
                    <Grid item xs={12}>
                        <Box className="hero-panel glow-border">
                            <Grid container spacing={2} alignItems="center">
                                <Grid item>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        {symbol}
                                    </Typography>
                                </Grid>
                                {quote && (
                                    <>
                                        <Grid item>
                                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                ${formatNumber(quote.close)}
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Typography 
                                                variant="h6"
                                                color={quote.percent_change >= 0 ? 'success.main' : 'error.main'}
                                            >
                                                {quote.percent_change >= 0 ? '+' : ''}
                                                {formatNumber(quote.percent_change)}%
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Chip
                                                label={quote.percent_change >= 0 ? 'Bullish' : 'Bearish'}
                                                color={quote.percent_change >= 0 ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </Grid>
                                    </>
                                )}
                                {fundamentals?.CompanyName && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            {fundamentals.CompanyName}
                                            {fundamentals.Industry ? ` • ${fundamentals.Industry}` : ''}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Price Chart */}
                    {renderPriceChart()}

                    {/* Fundamentals */}
                    {renderFundamentals()}

                    {/* Financials */}
                    {renderFinancials()}

                    {/* Company News */}
                    {companyNews.length > 0 && (
                        <Grid item xs={12}>
                            <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Latest {symbol} News
                                </Typography>
                                <Grid container spacing={2}>
                                    {companyNews.map((item, idx) => (
                                        <Grid item xs={12} md={6} key={idx}>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 2 }}>
                                                <Box sx={{
                                                    width: 96,
                                                    height: 72,
                                                    borderRadius: 2,
                                                    background: item.image
                                                        ? `url(${item.image}) center/cover`
                                                        : 'linear-gradient(135deg, #cfe4ff, #f7fbff)',
                                                    border: '1px solid rgba(0,0,0,0.06)'
                                                }} />
                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        component="a"
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 600 }}
                                                    >
                                                        {item.headline || item.title}
                                                    </Typography>
                                                    {item.summary && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                            {item.summary}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}

                    {/* Alerts & Notes */}
                    <Grid item xs={12}>
                        <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Price Alerts
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <TextField
                                            label="Target Price"
                                            value={alertPrice}
                                            onChange={(e) => setAlertPrice(e.target.value)}
                                            size="small"
                                        />
                                        <Button variant="contained" onClick={handleAddAlert}>
                                            Add Alert
                                        </Button>
                                    </Box>
                                    {alerts.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No alerts yet.
                                        </Typography>
                                    ) : (
                                        alerts.map((a) => (
                                            <Box key={a.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">
                                                    Target: ${a.target.toFixed(2)}
                                                </Typography>
                                                <Button size="small" color="error" onClick={() => handleRemoveAlert(a.id)}>
                                                    Remove
                                                </Button>
                                            </Box>
                                        ))
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom>
                                        Research Notes
                                    </Typography>
                                    <TextField
                                        multiline
                                        minRows={4}
                                        fullWidth
                                        placeholder="Write your thesis or key notes for this stock..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                    <Button variant="contained" sx={{ mt: 2 }} onClick={handleSaveNote}>
                                        Save Note
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Compare */}
                    <Grid item xs={12}>
                        <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Compare Stocks
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                <TextField
                                    label="Symbols (comma separated)"
                                    placeholder="AAPL, MSFT, NVDA"
                                    value={compareSymbols}
                                    onChange={(e) => setCompareSymbols(e.target.value)}
                                    size="small"
                                    sx={{ minWidth: 260 }}
                                />
                                <Button variant="contained" onClick={handleCompare}>
                                    Compare
                                </Button>
                            </Box>
                            {compareResults.length > 0 && (
                                <Grid container spacing={2}>
                                    {compareResults.map((r) => {
                                        const price = parseFloat(r.data?.close || r.data?.c || 0);
                                        const pct = parseFloat(r.data?.percent_change || r.data?.dp || 0);
                                        return (
                                            <Grid item xs={12} md={4} key={r.symbol}>
                                                <Card sx={{ borderRadius: 3 }}>
                                                    <CardContent>
                                                        <Typography variant="h6">{r.symbol}</Typography>
                                                        <Typography variant="h5">${price.toFixed(2)}</Typography>
                                                        <Typography color={pct >= 0 ? 'success.main' : 'error.main'}>
                                                            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            )}
                        </Paper>
                    </Grid>

                    {/* Trading Actions */}
                    {user && (
                        <Grid item xs={12}>
                            <Paper className="glass-card glow-border" sx={{ p: 3 }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom>
                                            Trading Actions
                                        </Typography>
                                        <ButtonGroup>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => setOpenBuyDialog(true)}
                                            >
                                                Buy
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => setOpenSellDialog(true)}
                                                disabled={!holdings || holdings.quantity <= 0}
                                            >
                                                Sell
                                            </Button>
                                        </ButtonGroup>
                                    </Grid>
                                    {holdings && (
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle1">
                                                Your Position:
                                            </Typography>
                                            <Typography>
                                                Quantity: {holdings.quantity}
                                            </Typography>
                                            <Typography>
                                                Average Price: ${holdings.averagePrice?.toFixed(2)}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}
                </Grid>

                {/* Buy Dialog */}
                <Dialog open={openBuyDialog} onClose={() => setOpenBuyDialog(false)}>
                    <DialogTitle>Buy {symbol}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Quantity"
                            type="number"
                            fullWidth
                            value={quantity}
                            onChange={handleQuantityChange}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Price per share: {quote?.close ? `$${formatNumber(quote.close)}` : 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                Available balance: {user?.balance != null ? `$${user.balance.toFixed(2)}` : 'N/A'}
                            </Typography>
                            {quote && quantity && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Total Cost: ${(quote.close * parseFloat(quantity || 0)).toFixed(2)}
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenBuyDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleBuy}
                            variant="contained"
                            disabled={
                                !quantity || 
                                parseFloat(quantity) <= 0 || 
                                !quote || 
                                !user || 
                                (quote.close * parseFloat(quantity)) > user.balance
                            }
                        >
                            Buy
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Sell Dialog */}
                <Dialog open={openSellDialog} onClose={() => setOpenSellDialog(false)}>
                    <DialogTitle>Sell {symbol}</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Quantity"
                            type="number"
                            fullWidth
                            value={quantity}
                            onChange={handleQuantityChange}
                            inputProps={{ 
                                min: 0, 
                                max: holdings?.quantity || 0,
                                step: 0.01
                            }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Price per share: {quote?.close ? `$${formatNumber(quote.close)}` : 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                                Available to sell: {holdings?.quantity != null ? holdings.quantity : 'N/A'}
                            </Typography>
                            {quote && quantity && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Total Value: ${(quote.close * parseFloat(quantity || 0)).toFixed(2)}
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenSellDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSell}
                            variant="contained"
                            color="error"
                            disabled={
                                !quantity || 
                                parseFloat(quantity) <= 0 || 
                                !holdings || 
                                parseFloat(quantity) > holdings.quantity ||
                                !quote
                            }
                        >
                            Sell
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default StockDetails; 
