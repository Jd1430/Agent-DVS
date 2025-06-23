import React, { useState } from 'react';
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

const API_URL = 'http://localhost:8000';

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
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleProcessData = async () => {
    if (!file) {
      setError('Please upload a file.');
      return;
    }
    setLoading(true);
    setError('');
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

  // UI
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(to bottom, #2a033d, #003531)' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 300,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 300, boxSizing: 'border-box', background: '#1a1a2e', color: 'white' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 3 }}>
          <Typography variant="h6" gutterBottom>📂 Upload Data File</Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mb: 2, background: '#4CAF50', color: 'white', borderRadius: 2 }}
            fullWidth
          >
            Upload
            <input type="file" hidden onChange={handleFileChange} accept=".csv,.xlsx,.sql" />
          </Button>
          <Typography variant="h6" gutterBottom>💬 Enter Your Query</Typography>
          <TextField
            multiline
            minRows={3}
            value={query}
            onChange={handleQueryChange}
            placeholder="Type your analysis query here..."
            variant="outlined"
            fullWidth
            sx={{ mb: 2, background: 'white', borderRadius: 2 }}
            InputProps={{ style: { color: 'black' } }}
          />
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{ background: '#4CAF50', color: 'white', borderRadius: 2 }}
            fullWidth
            onClick={handleProcessData}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Process Data'}
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, color: 'white' }}>
        <AppBar position="static" sx={{ background: 'rgba(42,3,61,0.95)', borderRadius: 2, mb: 3 }}>
          <Toolbar>
            <BarChartIcon sx={{ mr: 2 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              Agentic Visualization System
            </Typography>
          </Toolbar>
        </AppBar>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!sessionId && (
          <Card sx={{ maxWidth: 700, mx: 'auto', mt: 6, background: 'rgba(255,255,255,0.1)', color: 'white' }}>
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
                🐍 Convert queries to Python & SQL<br />
                📈 Create interactive visualizations<br />
                ✅ Validate results
              </Typography>
            </CardContent>
          </Card>
        )}

        {sessionId && (
          <>
            {/* File Overview & Data Sample */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">🗂️ File Overview</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ color: 'black' }}>{fileOverview}</Typography>
                  </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">📄 View Data Sample</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {columns.map((col) => (
                              <TableCell key={col} align="center">{col}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dataSample.map((row, idx) => (
                            <TableRow key={idx}>
                              {columns.map((col) => (
                                <TableCell key={col} align="center">{row[col]}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={6}>
                <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">📌 Quick Summary</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Card sx={{ border: '2px solid #005f99', borderRadius: 2, background: 'linear-gradient(135deg, #eef1f5, #f8feff)', color: 'black', p: 2 }}>
                      <CardContent>
                        <Typography variant="body1">{summary}</Typography>
                      </CardContent>
                    </Card>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>

            {/* Query Results */}
            {queryResult && (
              <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black', mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">🔍 Query Results</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">📊 Results</Typography>
                      <Paper sx={{ p: 2, background: 'white', color: 'black', minHeight: 80 }}>
                        <pre style={{ margin: 0 }}>{queryResult.result}</pre>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6">📖 Explanation</Typography>
                      <Card sx={{ border: '2px solid #005f99', borderRadius: 2, background: 'linear-gradient(135deg, #eef1f5, #f8feff)', color: 'black', p: 2 }}>
                        <CardContent>
                          <Typography variant="body2">{queryResult.justification}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Python & SQL Code */}
            {pythonCode && (
              <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black', mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6"><CodeIcon sx={{ mr: 1 }} />🐍 Python Code</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, background: '#23272f', color: '#00e676', fontFamily: 'monospace', fontSize: 15 }}>
                    <pre style={{ margin: 0 }}>{pythonCode}</pre>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}
            {sqlCode && (
              <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black', mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6"><CodeIcon sx={{ mr: 1 }} />🛢️ SQL Code</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper sx={{ p: 2, background: '#23272f', color: '#00bcd4', fontFamily: 'monospace', fontSize: 15 }}>
                    <pre style={{ margin: 0 }}>{sqlCode}</pre>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Validation */}
            {validation && (
              <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black', mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6"><CheckCircleIcon sx={{ mr: 1 }} />✅ Validation Status</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" color="green">{validation.validation_message}</Typography>
                  <Typography variant="body2" color="black">{validation.justification}</Typography>
                </AccordionDetails>
              </Accordion>
            )}

           {/* Visualizations */}
{visualizations && visualizations.length > 0 && (
  <Accordion defaultExpanded sx={{ background: 'rgba(255,255,255,0.15)', color: 'black', mt: 3 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6"><BarChartIcon sx={{ mr: 1 }} />📈 Visualizations</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        {visualizations.map((viz, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Paper sx={{ p: 2, background: 'white', borderRadius: 2 }}>
              {viz.type === 'plotly' && viz.spec ? (
                <Plot
                  data={viz.spec.data}
                  layout={{
                    ...viz.spec.layout,
                    autosize: true,
                    paper_bgcolor: 'white',
                    plot_bgcolor: 'white',
                  }}
                  style={{ width: '100%', height: 400 }}
                  useResizeHandler={true}
                  config={{ responsive: true }}
                />
              ) : (
                <img
                  src={`data:image/png;base64,${viz.image_base64}`}
                  alt={`Visualization ${idx + 1}`}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #005f99' }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </AccordionDetails>
  </Accordion>
)}
          </>
        )}
      </Box>
    </Box>
  );
}

export default App; 