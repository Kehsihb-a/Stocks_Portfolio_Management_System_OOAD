import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import StockDetails from './pages/StockDetails';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import WatchlistPage from './pages/WatchlistPage';
import WatchlistDetail from './pages/WatchlistDetail';
import { AuthProvider } from './contexts/AuthContext';
import Explore from './pages/Explore';
import SharedPortfolio from './pages/SharedPortfolio';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1d5fd1' },
    secondary: { main: '#ff7a59' },
    success: { main: '#1f7a4f' },
    error: { main: '#b63b3b' },
    background: {
      default: '#f7fbff',
      paper: '#ffffff'
    },
    text: {
      primary: '#0c1b2a',
      secondary: '#2a3d52'
    }
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: -1.2 },
    h2: { fontWeight: 700, letterSpacing: -1 },
    h3: { fontWeight: 700, letterSpacing: -0.8 },
    h4: { fontWeight: 700, letterSpacing: -0.6 },
    h5: { fontWeight: 600, letterSpacing: -0.4 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 18, paddingBlock: 8 }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16, border: '1px solid rgba(12,27,42,0.06)' }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 18, border: '1px solid rgba(12,27,42,0.06)' }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#2a3d52' }
      }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/stock/:symbol" element={
              <PrivateRoute>
                <StockDetails />
              </PrivateRoute>
            } />
            <Route path="/watchlist" element={
              <PrivateRoute>
                <WatchlistPage />
              </PrivateRoute>
            } />
            <Route path="/watchlist/:id" element={
              <PrivateRoute>
                <WatchlistDetail />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/portfolio/shared/:userId" element={<SharedPortfolio />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
