import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Paper,
  Collapse,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import { styled } from '@mui/material/styles';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Avatar from '@mui/material/Avatar';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import MenuIcon from '@mui/icons-material/Menu';
import ReactMarkdown from 'react-markdown';

const API_URL = 'http://localhost:8000';

// Custom styled components for enhanced look
const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #23243a 60%, #2a033d 100%)',
  color: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.25)',
  border: '1.5px solid #4CAF50',
}));
const GradientAccordion = styled(Accordion)(({ theme }) => ({
  background: 'linear-gradient(135deg, #23243a 60%, #2a033d 100%)',
  color: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
  border: '1.5px solid #4CAF50',
  marginBottom: 8,
}));
const GradientPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #23243a 60%, #2a033d 100%)',
  color: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
  border: '1.5px solid #4CAF50',
}));
const AccentButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(90deg, #4CAF50 0%, #00bcd4 100%)',
  color: '#fff',
  borderRadius: 8,
  fontWeight: 600,
  boxShadow: '0 2px 8px 0 rgba(76,175,80,0.18)',
  '&:hover': {
    background: 'linear-gradient(90deg, #00bcd4 0%, #4CAF50 100%)',
    color: '#fff',
  },
}));
const AccentTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    background: '#23243a',
    color: '#fff',
    borderRadius: 8,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4CAF50',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#00bcd4',
  },
  '& .MuiInputLabel-root': {
    color: '#b2dfdb',
  },
}));

// Animated SVG background
const AnimatedBackground = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 0,
  pointerEvents: 'none',
  background: 'radial-gradient(circle at 20% 30%, #4CAF50 0%, transparent 60%), radial-gradient(circle at 80% 70%, #00bcd4 0%, transparent 60%)',
  opacity: 0.18,
  animation: 'bgmove 12s linear infinite',
  '@keyframes bgmove': {
    '0%': { backgroundPosition: '0% 0%, 100% 100%' },
    '100%': { backgroundPosition: '100% 100%, 0% 0%' },
  },
});

// Custom styled scrollbars
const customScrollbar = {
  '&::-webkit-scrollbar': {
    width: '10px',
    background: '#23243a',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#4CAF50',
    borderRadius: '8px',
  },
};

// Custom Loader (animated bar chart)
function BarChartLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 32, gap: 2 }}>
      {[8, 16, 24, 16, 8].map((h, i) => (
        <div key={i} style={{
          width: 6,
          height: h,
          background: '#4CAF50',
          borderRadius: 2,
          animation: `bounce 1s ${i * 0.1}s infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          to { transform: scaleY(1.5); background: #00bcd4; }
        }
      `}</style>
    </div>
  );
}

// Sticky Footer
const Footer = styled('footer')(({ theme }) => ({
  position: 'fixed',
  left: 0,
  bottom: 0,
  width: '100vw',
  background: 'rgba(24,25,42,0.95)',
  color: '#b2dfdb',
  textAlign: 'center',
  padding: '8px 0',
  fontSize: 15,
  zIndex: 100,
  borderTop: '2px solid #4CAF50',
  letterSpacing: 1,
}));

function App() {
  // State
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [fileOverview, setFileOverview] = useState('');
  const [dataSample, setDataSample] = useState([]);
  const [columns, setColumns] = useState([]);
  const [summary, setSummary] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [pythonCode, setPythonCode] = useState('');
  const [sqlCode, setSqlCode] = useState('');
  const [validation, setValidation] = useState(null);
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isXL = useMediaQuery(theme.breakpoints.up('xl'));
  const [themeMode, setThemeMode] = useState('dark');
  const [helpOpen, setHelpOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile/tablet sidebar toggle

  // Theme switching
  const muiTheme = createTheme({
    palette: {
      mode: themeMode,
      primary: { main: themeMode === 'dark' ? '#43e97b' : '#388E3C' }, // Vibrant green (dark), deep green (light)
      secondary: { main: themeMode === 'dark' ? '#38f9d7' : '#1976D2' }, // Vibrant teal (dark), deep blue (light)
      background: {
        default: themeMode === 'dark' ? '#181A20' : '#F8FAFC', // Deep blue/charcoal (dark), soft light gray (light)
        paper: themeMode === 'dark' ? '#23243a' : '#FFFFFF', // Slightly lighter for cards
      },
      text: {
        primary: themeMode === 'dark' ? '#F5F5F7' : '#23243A', // High contrast
        secondary: themeMode === 'dark' ? '#B0B3B8' : '#6B7280', // Muted
      },
      divider: themeMode === 'dark' ? 'rgba(67,233,123,0.18)' : '#E0E0E0',
    },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h6: {
        fontWeight: 700,
        letterSpacing: 0.5,
      },
      body1: {
        fontSize: 16,
      },
      body2: {
        fontSize: 15,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: themeMode === 'dark' ? '1px solid #38f9d7' : '1px solid #E0E0E0',
          },
          head: {
            fontWeight: 700,
            color: themeMode === 'dark' ? '#43e97b' : '#388E3C',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
            textTransform: 'none',
          },
        },
      },
    },
  });

  // Font loading useEffect
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    document.body.style.fontFamily = 'Inter, Roboto, Arial, sans-serif';
    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  // Show snackbar on successful file upload or visualization
  useEffect(() => {
    if (sessionId && !error) {
      setSnackbar({ open: true, message: 'File uploaded and processed!', severity: 'success' });
    }
  }, [sessionId]);
  useEffect(() => {
    if (visualizations.length > 0 && !error) {
      setSnackbar({ open: true, message: 'Visualizations generated!', severity: 'info' });
    }
  }, [visualizations]);

  // Auto-close sidebar on mobile/tablet when a menu item is clicked
  const handleSidebarClose = () => {
    if (isMobile) setSidebarOpen(false);
  };

  // Handlers
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSessionId('');
    setFileOverview('');
    setDataSample([]);
    setColumns([]);
    setSummary('');
    setQueryResult(null);
    setPythonCode('');
    setSqlCode('');
    setValidation(null);
    setVisualizations([]);
    setError('');
    handleSidebarClose();
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    handleSidebarClose();
  };

  const handleProcessData = async () => {
    if (!file) {
      setError('Please upload a file.');
      return;
    }
    setLoading(true);
    setError('');
    handleSidebarClose();
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'File upload failed');
      }
      const data = await res.json();
      setFileOverview(data.file_overview);
      setDataSample(data.dataframe_head);
      setColumns(data.columns);
      setSummary(data.file_overview);

      // Always fetch visualizations after upload
      let vizData = null;
      try {
        const vizRes = await fetch(`${API_URL}/visualize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: data.session_id, query: '', result: null })
        });
        vizData = await vizRes.json();
        setVisualizations(vizData.visualizations || []);
      } catch (vizErr) {
        setVisualizations([]);
      }

      setSessionId(data.session_id);

      // If query is present, process it (this will also fetch visualizations for the query)
      if (query.trim()) {
        await handleQuery(data.session_id, query);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleQuery = async (sid, q) => {
    setLoading(true);
    setError('');
    try {
      // Query execution
      const res = await fetch(`${API_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, query: q })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Query failed');
      }
      const data = await res.json();
      setQueryResult(data);
      // Code conversion
      const codeRes = await fetch(`${API_URL}/convert_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, query: q })
      });
      const codeData = await codeRes.json();
      setPythonCode(codeData.python_code);
      setSqlCode(codeData.sql_code);
      // Validation
      const valRes = await fetch(`${API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, query: q })
      });
      const valData = await valRes.json();
      setValidation(valData);
      // Visualizations for query
      await handleVisualizations(sid, q, data.result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVisualizations = async (sid, q = null, result = null) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, query: q, result: result })
      });
      const data = await res.json();
      setVisualizations(data.visualizations || []);
    } catch (err) {
      setError('Visualization failed');
    }
    setLoading(false);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setSessionId('');
      setFileOverview('');
      setDataSample([]);
      setColumns([]);
      setSummary('');
      setQueryResult(null);
      setPythonCode('');
      setSqlCode('');
      setValidation(null);
      setVisualizations([]);
      setError('');
    }
  };

  // Download visualization as PNG (for Plotly)
  const handleDownloadViz = async (viz, idx) => {
    if (viz.type === 'plotly' && viz.spec) {
      // Use Plotly's toImage
      const Plotly = await import('plotly.js-dist-min');
      const dummyDiv = document.createElement('div');
      Plotly.newPlot(dummyDiv, viz.spec.data, viz.spec.layout);
      Plotly.toImage(dummyDiv, { format: 'png', width: 800, height: 600 }).then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `visualization_${idx + 1}.png`;
        a.click();
      });
    } else if (viz.image_base64) {
      // Download base64 image
      const a = document.createElement('a');
      a.href = `data:image/png;base64,${viz.image_base64}`;
      a.download = `visualization_${idx + 1}.png`;
      a.click();
    }
  };

  // Download data as CSV
  const handleDownloadCSV = () => {
    if (dataSample && columns.length > 0) {
      const csvRows = [columns.join(',')];
      dataSample.forEach(row => {
        csvRows.push(columns.map(col => JSON.stringify(row[col] ?? '')).join(','));
      });
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'data_sample.csv';
      a.click();
    }
  };

  // UI
  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: themeMode === 'dark' ? 'linear-gradient(to bottom, #2a033d, #003531)' : 'linear-gradient(to bottom, #f8feff, #b2dfdb)', fontFamily: 'Inter, Roboto, Arial, sans-serif', position: 'relative', maxWidth: '100vw', overflowX: 'hidden' }}>
        <AnimatedBackground />
        {/* Sidebar with drag-and-drop */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? sidebarOpen : true}
          onClose={() => setSidebarOpen(false)}
          sx={{
            width: isMobile ? '100vw' : isTablet ? 220 : 300,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: isMobile ? '100vw' : isTablet ? 220 : 300,
              boxSizing: 'border-box',
              background: themeMode === 'dark' ? '#18192a' : '#e0f2f1',
              color: themeMode === 'dark' ? 'white' : '#23243a',
              borderRight: '2px solid #4CAF50',
              ...customScrollbar,
              position: isMobile ? 'fixed' : 'relative',
              zIndex: 1200,
              top: 0,
              left: 0,
              height: 'auto',
              minHeight: '100vh',
              maxHeight: '100vh',
              p: isMobile ? 1 : isTablet ? 2 : 3,
            },
          }}
        >
          <Toolbar />
          <Box
            sx={{ overflow: 'auto', p: isMobile ? 1 : 3, ...customScrollbar, border: dragActive ? '2px dashed #00bcd4' : undefined, background: dragActive ? 'rgba(0,188,212,0.08)' : undefined }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            aria-label="Sidebar with drag-and-drop file upload"
            tabIndex={0}
          >
            {/* User Profile/Session Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar alt="User" src="https://api.dicebear.com/7.x/identicon/svg?seed=Agent" sx={{ width: 48, height: 48, mr: 2, border: '2px solid #4CAF50' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Agent User</Typography>
                {sessionId && <Typography variant="caption" sx={{ color: '#b2dfdb' }}>Session: {sessionId.slice(0, 8)}...</Typography>}
              </Box>
            </Box>
            <Tooltip title="Upload a CSV, Excel, or SQL file" arrow placement="right">
              <Typography variant="h6" gutterBottom>📂 Upload Data File</Typography>
            </Tooltip>
            <AccentButton
              variant="contained"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ mb: 2 }}
              fullWidth
              aria-label="Upload data file"
            >
              Upload
              <input type="file" hidden onChange={handleFileChange} accept=".csv,.xlsx,.sql" />
            </AccentButton>
            <Tooltip title="Type your analysis question here" arrow placement="right">
              <Typography variant="h6" gutterBottom>💬 Enter Your Query</Typography>
            </Tooltip>
            <AccentTextField
              multiline
              minRows={3}
              value={query}
              onChange={handleQueryChange}
              placeholder="Type your analysis query here..."
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{ style: { color: 'white' } }}
              aria-label="Analysis query input"
            />
            <AccentButton
              variant="contained"
              startIcon={<PlayArrowIcon />}
              fullWidth
              onClick={handleProcessData}
              disabled={loading}
              aria-label="Process data"
            >
              {loading ? <BarChartLoader /> : 'Process Data'}
            </AccentButton>
            {dragActive && (
              <Box sx={{ mt: 2, color: '#00bcd4', fontWeight: 600, textAlign: 'center' }}>
                Drop your file here to upload
              </Box>
            )}
          </Box>
        </Drawer>
        {/* Main Content */}
        <Box component="main" sx={{
          flexGrow: 1,
          p: isMobile ? 0.5 : isTablet ? 1.5 : isDesktop ? 2 : 3,
          color: 'white',
          zIndex: 1,
          maxWidth: '100vw',
          overflowX: 'auto',
          minHeight: '100vh',
        }}>
          <AppBar position="static" sx={{
            background: themeMode === 'dark' ? 'rgba(42,3,61,0.95)' : 'rgba(178,223,219,0.95)',
            borderRadius: 2,
            mb: 2,
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
            width: '100%',
            minWidth: 0,
          }}>
            <Toolbar>
              {isMobile && (
                <IconButton
                  sx={{ mr: 2, color: themeMode === 'dark' ? '#4CAF50' : '#23243a' }}
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar menu"
                >
                  <MenuIcon />
                </IconButton>
              )}
              <BarChartIcon sx={{ mr: 2 }} />
              {/* Online/active title as a link with green dot */}
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Typography variant="h5" component="span" sx={{ fontWeight: 700, letterSpacing: 1, mr: 1 }}>
                  Agentic Visualization System
                </Typography>
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 8px 2px #4CAF50', marginLeft: 4, animation: 'pulse 1.2s infinite alternate' }} />
                <style>{`@keyframes pulse { to { box-shadow: 0 0 16px 6px #4CAF50; } }`}</style>
              </a>
              {/* Theme toggle button */}
              <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton sx={{ ml: 1 }} onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')} color="inherit" aria-label="Toggle theme">
                  {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              {/* Help icon moved below theme toggle */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 1 }}>
              <Tooltip title="Help & Onboarding" placement="left">
                  <IconButton
                    sx={{ color: themeMode === 'dark' ? '#4CAF50' : '#23243a', mt: 0.5 }}
                    onClick={() => setHelpOpen(true)}
                    aria-label="Open help modal"
                  >
                    <InfoOutlinedIcon sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>
          <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </MuiAlert>
          </Snackbar>
          {error && <Alert severity="error" sx={{ mb: 2, fontWeight: 600, fontSize: 16, background: 'linear-gradient(90deg, #ff1744 0%, #ff8a65 100%)', color: 'white', borderRadius: 2 }}>{error}</Alert>}
          {/* Animated transitions for main cards */}
          <Fade in={!sessionId} timeout={700}>
            <div>
              {!sessionId && (
                <GradientCard sx={{ maxWidth: 700, mx: 'auto', mt: 6 }}>
                  <CardContent>
                    <Typography variant="h4" gutterBottom>👋 Welcome to the Agentic Visualization System</Typography>
                    <Typography variant="body1" gutterBottom>
                      This platform helps you analyze and visualize your data effortlessly:
                    </Typography>
                    <ul>
                      <li>📤 Upload your data file (CSV, Excel, or SQL)</li>
                      <li>🔍 Enter your analysis query (optional)</li>
                      <li>🚀 Click 'Process Data' to start</li>
                    </ul>
                    <Typography variant="body2" color="#b2dfdb">
                      The system will automatically:<br />
                      📊 Generate data summaries<br />
                      🔍 Process your queries<br />
                      �� Convert queries to Python & SQL<br />
                      📈 Create interactive visualizations<br />
                      ✅ Validate results
                    </Typography>
                  </CardContent>
                </GradientCard>
              )}
            </div>
          </Fade>
          <Collapse in={!!sessionId} timeout={700}>
            <div>
              {sessionId && (
                <>
                  {/* File Overview & Data Sample */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <GradientAccordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">🗂️ File Overview</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <ReactMarkdown components={{ code: ({node, inline, className, children, ...props}) => <span>{children}</span> }} children={fileOverview} />
                        </AccordionDetails>
                      </GradientAccordion>
                      <GradientAccordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">📄 View Data Sample</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer component={GradientPaper} sx={{ maxHeight: isMobile ? 120 : isTablet ? 180 : 300, ...customScrollbar, width: '100vw', minWidth: 0, overflowX: 'auto' }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  {columns.map((col) => (
                                    <Tooltip key={col} title={col} arrow placement="top">
                                      <TableCell align="center" sx={{ color: '#4CAF50', fontWeight: 700, background: '#23243a', borderBottom: '2px solid #00bcd4' }}>{col}</TableCell>
                                    </Tooltip>
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {dataSample.map((row, idx) => (
                                  <TableRow key={idx} sx={{ background: idx % 2 === 0 ? '#23243a' : '#2a033d', '&:hover': { background: '#00bcd4', color: '#23243a' } }}>
                                    {columns.map((col) => (
                                      <TableCell key={col} align="center" sx={{ color: '#fff', borderBottom: '1px solid #4CAF50' }}>{row[col]}</TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </GradientAccordion>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <GradientAccordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6">📌 Quick Summary</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <GradientCard sx={{ border: '2px solid #00bcd4', borderRadius: 2, background: 'linear-gradient(135deg, #eef1f5, #f8feff)', color: 'black', p: 2 }}>
                            <CardContent>
                              <ReactMarkdown components={{ code: ({node, inline, className, children, ...props}) => <span>{children}</span> }} children={summary} />
                            </CardContent>
                          </GradientCard>
                        </AccordionDetails>
                      </GradientAccordion>
                    </Grid>
                  </Grid>
                  {/* Query Results */}
                  {queryResult && (
                    <GradientAccordion defaultExpanded sx={{ mt: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">🔍 Query Results</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6">📊 Results</Typography>
                            {/* Display as table if result is a list of objects/records */}
                            {Array.isArray(queryResult.result) && queryResult.result.length > 0 && typeof queryResult.result[0] === 'object' ? (
                              <TableContainer component={GradientPaper} sx={{
                                maxHeight: 300,
                                ...customScrollbar,
                                border: '2px solid #00bcd4',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px 0 rgba(0,188,212,0.18)',
                                background: 'linear-gradient(135deg, #23243a 60%, #2a033d 100%)',
                                mt: 1
                              }}>
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      {Object.keys(queryResult.result[0]).map((col) => (
                                        <Tooltip key={col} title={col} arrow placement="top">
                                          <TableCell align="center" sx={{ color: '#4CAF50', fontWeight: 700, background: '#23243a', borderBottom: '2px solid #00bcd4', fontSize: 15 }}>{col}</TableCell>
                                        </Tooltip>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {queryResult.result.map((row, idx) => (
                                      <TableRow key={idx} sx={{ background: idx % 2 === 0 ? '#23243a' : '#2a033d', '&:hover': { background: '#00bcd4', color: '#23243a' } }}>
                                        {Object.keys(queryResult.result[0]).map((col) => (
                                          <TableCell key={col} align="center" sx={{ color: '#fff', borderBottom: '1px solid #4CAF50', fontSize: 14 }}>{row[col]}</TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            ) : (
                              typeof queryResult.result === 'string' && (() => {
                                const lines = queryResult.result.split('\n').filter(l => l.trim() && !l.trim().startsWith('...'));
                                if (lines.length < 2) {
                                  // Not enough lines for a table, show as plain text
                                  return (
                                    <GradientPaper sx={{ p: 2, minHeight: 80 }}>
                                      <pre style={{ margin: 0, color: '#00e676', fontWeight: 600 }}>{queryResult.result}</pre>
                                    </GradientPaper>
                                  );
                                }
                                // Try to parse header and rows
                                const header = lines[0].split(/\s{2,}/).map(h => h.trim());
                                const rows = lines.slice(1).map(line => line.split(/\s{2,}/));
                                // If header/row lengths don't match, fallback to plain text
                                if (!rows.every(row => row.length === header.length)) {
                                  return (
                                    <GradientPaper sx={{ p: 2, minHeight: 80 }}>
                                      <pre style={{ margin: 0, color: '#00e676', fontWeight: 600 }}>{queryResult.result}</pre>
                                    </GradientPaper>
                                  );
                                }
                                // Render as table
                                return (
                                  <TableContainer component={GradientPaper} sx={{
                                    maxHeight: 300,
                                    ...customScrollbar,
                                    border: '2px solid #00bcd4',
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px 0 rgba(0,188,212,0.18)',
                                    background: 'linear-gradient(135deg, #23243a 60%, #2a033d 100%)',
                                    mt: 1
                                  }}>
                                    <Table size="small" stickyHeader>
                                      <TableHead>
                                        <TableRow>
                                          {header.map((col, i) => (
                                            <Tooltip key={col + i} title={col} arrow placement="top">
                                              <TableCell align="center" sx={{ color: '#4CAF50', fontWeight: 700, background: '#23243a', borderBottom: '2px solid #00bcd4', fontSize: 15 }}>{col}</TableCell>
                                            </Tooltip>
                                          ))}
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {rows.map((row, idx) => (
                                          <TableRow key={idx} sx={{ background: idx % 2 === 0 ? '#23243a' : '#2a033d', '&:hover': { background: '#00bcd4', color: '#23243a' } }}>
                                            {row.map((cell, j) => (
                                              <TableCell key={j} align="center" sx={{ color: '#fff', borderBottom: '1px solid #4CAF50', fontSize: 14 }}>{cell}</TableCell>
                                            ))}
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                );
                              })()
                            )}
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6">📖 Explanation</Typography>
                            <GradientCard sx={{ border: '2px solid #00bcd4', borderRadius: 2, background: 'linear-gradient(135deg, #eef1f5, #f8feff)', color: 'black', p: 2 }}>
                              <CardContent>
                                <ReactMarkdown components={{ code: ({node, inline, className, children, ...props}) => <span>{children}</span> }} children={queryResult.justification} />
                              </CardContent>
                            </GradientCard>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </GradientAccordion>
                  )}
                  {/* Python & SQL Code */}
                  {pythonCode && (
                    <GradientAccordion defaultExpanded sx={{ mt: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6"><CodeIcon sx={{ mr: 1 }} />🐍 Python Code</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <GradientPaper sx={{ p: 2, fontFamily: 'monospace', fontSize: 15, color: '#00e676' }}>
                          <pre style={{ margin: 0 }}>{pythonCode}</pre>
                        </GradientPaper>
                      </AccordionDetails>
                    </GradientAccordion>
                  )}
                  {sqlCode && (
                    <GradientAccordion defaultExpanded sx={{ mt: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6"><CodeIcon sx={{ mr: 1 }} />🛢️ SQL Code</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <GradientPaper sx={{ p: 2, fontFamily: 'monospace', fontSize: 15, color: '#00bcd4' }}>
                          <pre style={{ margin: 0 }}>{sqlCode}</pre>
                        </GradientPaper>
                      </AccordionDetails>
                    </GradientAccordion>
                  )}
                  {/* Validation */}
                  {validation && (
                    <GradientAccordion defaultExpanded sx={{ mt: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6"><CheckCircleIcon sx={{ mr: 1 }} />✅ Validation Status</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" color="#00e676">{validation.validation_message}</Typography>
                        <ReactMarkdown components={{ code: ({node, inline, className, children, ...props}) => <span>{children}</span> }} children={validation.justification} />
                      </AccordionDetails>
                    </GradientAccordion>
                  )}
                  {/* Visualizations */}
                  {visualizations && visualizations.length > 0 && (
                    <GradientAccordion defaultExpanded sx={{ mt: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6"><BarChartIcon sx={{ mr: 1 }} />📈 Visualizations</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ overflowX: 'auto' }}>
                        <Grid container spacing={isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4} justifyContent="flex-start">
                          {visualizations.map((viz, idx) => (
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              lg={3}
                              xl={2}
                              key={idx}
                            >
                              <Fade in timeout={700}>
                                <GradientPaper
                                  sx={{
                                    p: isMobile ? 0.5 : isTablet ? 0.75 : 1,
                                    position: 'relative',
                                    width: '100%',
                                    minWidth: isMobile ? 320 : isTablet ? 400 : 650,
                                    maxWidth: '100%',
                                    minHeight: isMobile ? 220 : 400,
                                    height: isMobile ? 220 : 400,
                                  }}
                                >
                                  <Tooltip title="Download visualization as PNG" placement="top">
                                    <IconButton
                                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, background: 'rgba(0,188,212,0.12)' }}
                                      onClick={() => handleDownloadViz(viz, idx)}
                                      aria-label={`Download visualization ${idx + 1}`}
                                    >
                                      <DownloadIcon />
                                    </IconButton>
                                  </Tooltip>
                                  {viz.type === 'plotly' && viz.spec ? (
                                    <Plot
                                      data={viz.spec.data}
                                      layout={{
                                        ...viz.spec.layout,
                                        autosize: true,
                                        paper_bgcolor: 'white',
                                        plot_bgcolor: 'white',
                                        margin: { l: isMobile ? 20 : isTablet ? 30 : 40, r: 20, t: 30, b: 30 },
                                      }}
                                      style={{ width: '100%', minWidth: 0, height: isMobile ? 220 : 360 }}
                                      useResizeHandler={true}
                                      config={{ responsive: true }}
                                      aria-label={`Plotly visualization ${idx + 1}`}
                                    />
                                  ) : (
                                    <img
                                      src={`data:image/png;base64,${viz.image_base64}`}
                                      alt={`Visualization ${idx + 1}`}
                                      style={{ width: '100%', borderRadius: 8, border: '1.5px solid #00bcd4', boxShadow: '0 2px 8px 0 rgba(0,188,212,0.18)', minWidth: 0, height: isMobile ? 220 : 360 }}
                                      aria-label={`Image visualization ${idx + 1}`}
                                    />
                                  )}
                                </GradientPaper>
                              </Fade>
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </GradientAccordion>
                  )}
                </>
              )}
            </div>
          </Collapse>
          {/* Help Modal */}
          <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} aria-labelledby="help-dialog-title">
            <DialogTitle
              id="help-dialog-title"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: themeMode === 'dark' ? 'white' : '#23243a'
              }}
            >
              <span>Welcome to the Agentic Visualization System</span>
              <IconButton onClick={() => setHelpOpen(false)} aria-label="Close help modal"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>How to use:</Typography>
              <ol>
                <li>Upload your data file (CSV, Excel, or SQL) using the upload button or drag-and-drop.</li>
                <li>Enter your analysis query (optional) in the provided field.</li>
                <li>Click 'Process Data' to start the analysis.</li>
                <li>View data summaries, query results, code, validation, and visualizations.</li>
                <li>Download your data sample or visualizations as needed.</li>
              </ol>
              <Typography variant="body2" color="secondary">Tip: You can switch between light and dark mode using the sun/moon icon in the header.</Typography>
            </DialogContent>
            <DialogActions>
              <AccentButton onClick={() => setHelpOpen(false)} aria-label="Close help modal">Close</AccentButton>
            </DialogActions>
          </Dialog>
        </Box>
        <Footer>
          Agentic Visualization System &copy; {new Date().getFullYear()} &mdash; <a href="https://github.com/" style={{ color: '#4CAF50', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">GitHub</a>
        </Footer>
      </Box>
    </ThemeProvider>
  );
}

export default App; 