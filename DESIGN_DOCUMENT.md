# Agent-DVS: Design Document

**Project Name:** Agent-DVS (Agentic Data Visualization System)  
**Repository:** Jd1430/Agent-DVS  
**Status:** Active Development  
**Created:** 2025-06-17

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Backend Services](#backend-services)
7. [Frontend Components](#frontend-components)
8. [API Specifications](#api-specifications)
9. [Agent Workflows](#agent-workflows)
10. [Deployment Architecture](#deployment-architecture)
11. [Security Considerations](#security-considerations)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

**Agent-DVS** is an AI-powered data visualization system that enables users to upload data files (CSV, Excel, SQL) and interact with them through natural language queries. The system leverages LLM-based agents to process data, execute queries, validate results, and generate interactive visualizations.

### Key Features
- 📂 **Multi-format Data Upload:** Support for CSV, Excel, and SQL files
- 🔍 **Natural Language Querying:** Ask questions in plain English
- ✅ **AI-Driven Result Validation:** Automated verification of query results
- 📊 **Interactive Visualizations:** Auto-generated and recommended charts using Plotly
- 🤖 **Agentic Architecture:** LangChain-based agents for task automation

### Target Users
- Data analysts needing quick insights without SQL/Python expertise
- Business users exploring data interactively
- Educators demonstrating data analysis concepts

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  - File Upload Interface                                     │
│  - Query Input Panel                                         │
│  - Results & Visualization Display                           │
│  - Interactive Dashboard                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Layer (main.py)                      │   │
│  │  - /upload - File upload & processing                │   │
│  │  - /query - Query execution                          │   │
│  │  - /validate - Result validation                     │   │
│  │  - /visualize - Visualization generation            │   │
│  │  - /convert_code - SQL/Python conversion            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Agent Layer (./agents/)                      │   │
│  │  ├─ FileProcessor: Data ingestion & overview         │   │
│  │  ├─ QueryExecutor: Natural language → Pandas code   │   │
│  │  ├─ QueryToSQL: Natural language → SQL conversion   │   │
│  │  ├─ QueryToPython: Natural language → Python code   │   │
│  │  ├─ AnswerValidation: Result verification           │   │
│  │  ├─ Visualization: Chart recommendations & rendering│   │
│  │  └─ Dashboard: Structured data display              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         LLM Integration (LangChain + Groq)           │   │
│  │  - Model: llama3-70b-8192                            │   │
│  │  - Prompt Engineering & Chain of Thought            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Data Storage & Processing                     │   │
│  │  - In-Memory DataFrame Storage (Session-based)       │   │
│  │  - Pandas Operations & Analysis                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                       │
                       │
        ┌──────────────┴──────────────┐
        │                             │
    ┌───▼───┐                   ┌────▼────┐
    │ Groq  │                   │ Plotly  │
    │ API   │                   │ Render  │
    └───────┘                   └─────────┘
```

---

## Technology Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | FastAPI | REST API, async support, automatic documentation |
| **LLM** | LangChain + Groq (llama3-70b) | Natural language processing |
| **Data Processing** | Pandas, NumPy | Data manipulation & analysis |
| **Visualization** | Plotly, Matplotlib | Chart generation & export |
| **ML/Analysis** | Scikit-learn | Machine learning utilities |
| **Database** | SQLite (in-memory) | SQL file processing |
| **Deployment** | Uvicorn + Render | Server & hosting |

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19.1.0 | UI framework |
| **UI Components** | Material-UI (MUI) | Pre-built components & styling |
| **Visualization** | Plotly.js, react-plotly.js | Interactive charts |
| **Styling** | Emotion (CSS-in-JS) | Component styling |
| **HTTP Client** | Axios | API communication |
| **Markdown** | react-markdown | Rich text display |
| **Routing** | React Router v7.6.2 | Navigation |

### Language Composition
- **JavaScript:** 57%
- **Python:** 40.6%
- **CSS:** 2%
- **HTML:** 0.4%

---

## Core Components

### 1. Backend Structure

```
backend/
├── main.py                          # FastAPI application & routes
├── requirements.txt                 # Python dependencies
├── runtime.txt                      # Python version specification
├── .env                             # Environment variables (API keys)
└── agents/
    ├── file_processing.py           # File ingestion & metadata extraction
    ├── query_execution.py           # Natural language query execution
    ├── query_to_python.py           # NL to Python code generation
    ├── query_to_sql.py              # NL to SQL code generation
    ├── answer_validation.py         # Result verification & validation
    ├── visualization.py             # Chart recommendation & generation
    └── dashboard.py                 # Dashboard presentation layer
```

### 2. Frontend Structure

```
frontend/
├── public/                          # Static assets
├── src/
│   ├── App.js                       # Main application component
│   ├── App.css                      # Application styling
│   ├── api.js                       # API client utilities
│   ├── index.js                     # React entry point
│   ├── index.css                    # Global styles
│   └── components/                  # React components
├── package.json                     # Dependencies & scripts
└── build/                           # Production build output
```

---

## Data Flow

### File Upload & Processing Flow

```
User Upload (CSV/Excel/SQL)
       │
       ▼
┌─────────────────┐
│ Frontend Upload │
│  - File input   │
└────────┬────────┘
         │ FormData
         │
         ▼
┌─────────────────────────────────────┐
│  Backend: /upload Endpoint          │
│  1. Receive file bytes              │
│  2. Detect file type                │
│  3. Decode/Parse file               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  FileProcessor Agent                │
│  - Read CSV/Excel/SQL               │
│  - Convert to Pandas DataFrame      │
│  - Generate file overview (LLM)     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Session Management                 │
│  - Generate session_id              │
│  - Store DataFrame in DATA_STORAGE  │
│  - Return metadata to frontend      │
└────────┬────────────────────────────┘
         │
         ▼
Frontend Display:
- DataFrame head (first 5 rows)
- File overview (AI-generated summary)
- Column names & types
- Session ID (for future requests)
```

### Query Execution Flow

```
User Query (Natural Language)
       │
       ▼
┌─────────────────────────────┐
│  Frontend: Enter Query      │
│  "What is total sales?"     │
└────────┬────────────────────┘
         │ session_id + query
         │
         ▼
┌──────────────────────────────────────┐
│  Backend: /query Endpoint            │
│  1. Lookup DataFrame by session_id   │
│  2. Get DataFrame columns info       │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  QueryExecutor Agent                 │
│  1. Create LLM prompt with:          │
│     - Natural language query         │
│     - DataFrame columns              │
│     - Pandas best practices          │
│  2. LLM generates Python code:       │
│     result = df.groupby(...).sum()   │
│  3. Extract code from markdown       │
│  4. Validate code syntax             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Safe Code Execution                 │
│  1. Create isolated local_vars       │
│  2. Execute code: exec(code, ...)    │
│  3. Extract result variable          │
│  4. Handle exceptions gracefully     │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  JustificationAgent                  │
│  1. Create explanation prompt        │
│  2. Generate human-readable summary  │
│  3. Highlight key insights           │
└────────┬─────────────────────────────┘
         │
         ▼
Frontend Display:
- Query result (table/scalar/series)
- Executed Python code
- AI-generated justification
- Validation option
```

### Visualization Generation Flow

```
User Request Visualization
       │
       ▼
┌──────────────────────────────────────┐
│  Frontend: /visualize Endpoint       │
│  - session_id                        │
│  - query (optional)                  │
│  - result (optional)                 │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Visualization Agent: Step 1         │
│  Recommendation Selection            │
│                                      │
│  If query provided:                  │
│  - Use LLM to recommend charts       │
│    based on query context            │
│  - Return: [{"type": "bar", ...}]   │
│                                      │
│  If no query (auto-generate):        │
│  - Analyze DataFrame structure       │
│  - Detect numeric/categorical cols   │
│  - Create diverse recommendations    │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Visualization Agent: Step 2         │
│  Chart Generation                    │
│                                      │
│  For each recommendation:            │
│  - Extract chart type (bar, pie, etc)│
│  - Extract column mappings           │
│  - Use Plotly Express to render      │
│  - Convert to JSON spec              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Response Formatting                 │
│  - Base64 encode matplotlib images   │
│  - Return Plotly JSON specs          │
│  - Package as VisualizationResponse  │
└────────┬─────────────────────────────┘
         │
         ▼
Frontend Display:
- Multiple interactive charts
- Zoom, pan, hover details
- Download as PNG/SVG
```

---

## Backend Services

### 1. FastAPI Application (main.py)

**Responsibilities:**
- REST API route handling
- CORS middleware configuration
- Request validation (Pydantic models)
- Session management (in-memory)
- Agent orchestration

**Key Models:**
```python
FileOverviewResponse
├── dataframe_head: list
├── file_overview: str
├── columns: list
└── session_id: str

QueryRequest
├── session_id: str
└── query: str

QueryResponse
├── result: str
├── justification: str
└── executed_code: str

VisualizationRequest
├── session_id: str
├── query: str (optional)
└── result: str (optional)
```

### 2. FileProcessor Agent

**Purpose:** Handle data file uploads and generate AI-driven summaries

**Process:**
```python
1. Read file (CSV/Excel/SQL)
2. Parse into Pandas DataFrame
3. Generate data overview:
   - Data type classification
   - Important columns identification
   - Pattern/anomaly detection
   - Insight suggestions
4. Return metadata + processed data
```

**Key Methods:**
- `process_file(file_content, file_type)` → dict
- `generate_file_overview(df)` → str

**LLM Prompt:** High-level dataset summarization

### 3. QueryExecutor Agent

**Purpose:** Convert natural language queries into executable Pandas code

**Process:**
```python
1. Receive natural language query
2. Create LLM prompt with:
   - Query text
   - Available DataFrame columns
   - Pandas best practices
   - Example transformations
3. LLM generates Python code
4. Extract code from markdown blocks
5. Validate syntax (must start with "result =")
6. Execute in isolated environment
7. Generate explanation/justification
8. Return result + code + explanation
```

**Key Methods:**
- `execute_query(df, query)` → dict
- Error handling for invalid code
- Time-based operation support
- Multi-column selection validation

**Special Features:**
- Automatic datetime conversion
- Flexible date format handling
- Markdown code extraction
- Safe code execution environment

### 4. AnswerValidation Agent

**Purpose:** Verify correctness of query results

**Process:**
```python
1. Receive: DataFrame + Query + Code + Result
2. Create validation prompt
3. LLM analyzes:
   - Code logic correctness
   - Result plausibility
   - Data integrity
4. Generate validation message
5. Provide detailed justification
```

**Key Methods:**
- `validate_result(df, query, executed_code, result)` → dict

### 5. Visualization Agent

**Purpose:** Recommend and generate interactive charts

**Process:**
```
Step 1: Recommendation
- Analyze query context OR
- Auto-detect DataFrame structure
- Suggest chart types (bar, pie, scatter, etc.)
- Map data columns to chart axes

Step 2: Generation
- Create Plotly figures
- Convert to JSON specifications
- Handle errors gracefully
- Support multiple chart types

Step 3: Response
- Format for frontend consumption
- Include chart metadata
- Ensure serialization compatibility
```

**Supported Visualizations:**
| Type | Use Case |
|------|----------|
| bar | Categorical comparison |
| scatter | Correlation analysis |
| pie | Composition/proportion |
| histogram | Distribution |
| box | Outlier detection |
| violin | Distribution shape |
| kde | Kernel density estimation |
| area/line_area | Trends over time |
| treemap | Hierarchical composition |
| sunburst | Nested hierarchies |
| choropleth | Geographic distribution |
| polar | Angular relationships |
| scatter_3d | 3D correlation |

**Key Methods:**
- `recommend_visualization(df, query, result)` → dict
- `auto_generate_visualizations(df)` → dict
- `generate_visualization(df, recommendations)` → list

### 6. Code Conversion Agents

#### QueryToSQL
**Purpose:** Convert natural language to SQL queries
- Creates SQL SELECT statements
- No execution (safe)
- For reference/learning

#### QueryToPython
**Purpose:** Generate standalone Python code
- Pure Python with pandas
- No LLM dependency
- Portable and reusable

---

## Frontend Components

### Main Application (App.js)

**State Management:**
```javascript
- uploadedFile: File object
- session_id: string
- fileOverview: string
- dataframe_head: array of objects
- columns: array of strings
- query: string
- queryResult: object
- validation: object
- visualizations: array
- isLoading: boolean
- error: string
```

**Key Features:**
1. **File Upload Panel**
   - Drag-and-drop support
   - File type validation
   - Upload progress

2. **Data Explorer**
   - Preview first 5 rows
   - Column list display
   - AI-generated summary

3. **Query Interface**
   - Natural language input
   - Result display (table/scalar/series)
   - Code visibility
   - Executed code display

4. **Validation Panel**
   - AI verification results
   - Justification display

5. **Visualization Gallery**
   - Multiple chart display
   - Interactive Plotly charts
   - Chart customization

6. **Responsive Design**
   - Desktop/tablet/mobile layouts
   - Material-UI components
   - Touch-friendly interactions

### Material-UI Components Used
- `Container` - Layout wrapper
- `Paper` - Card surfaces
- `Button` - Actions
- `TextField` - Input fields
- `Table` - Data display
- `Card` - Content containers
- `Grid` - Responsive layout
- `CircularProgress` - Loading indicator
- `Alert` - Error/success messages
- `Tab` - Content organization

### API Client (api.js)
```javascript
axios instance configuration
- Base URL: API_URL environment variable
- Default headers
- Error interceptors
```

---

## API Specifications

### 1. File Upload

**Endpoint:** `POST /upload`

**Request:**
```
Content-Type: multipart/form-data
Body: file (binary)
```

**Response (200):**
```json
{
  "dataframe_head": [
    {"Column1": "value", "Column2": 123},
    ...
  ],
  "file_overview": "This dataset contains...",
  "columns": ["Column1", "Column2", "Column3"],
  "session_id": "a1b2c3d4e5f6g7h8"
}
```

**Error (400):**
```json
{"error": "Unsupported file type"}
```

---

### 2. Query Execution

**Endpoint:** `POST /query`

**Request:**
```json
{
  "session_id": "a1b2c3d4e5f6g7h8",
  "query": "What is the total sales by region?"
}
```

**Response (200):**
```json
{
  "result": "Region\n  East: 50000\n  West: 75000\n...",
  "justification": "The query grouped sales data by region and calculated totals...",
  "executed_code": "result = df.groupby('Region')['Sales'].sum()"
}
```

**Error (404):**
```json
{"error": "Session not found"}
```

**Error (400):**
```json
{"error": "Query execution failed: ..."}
```

---

### 3. Result Validation

**Endpoint:** `POST /validate`

**Request:**
```json
{
  "session_id": "a1b2c3d4e5f6g7h8",
  "query": "What is the total sales by region?"
}
```

**Response (200):**
```json
{
  "validation_message": "Result is valid",
  "justification": "The code correctly groups by Region..."
}
```

---

### 4. Code Conversion

**Endpoint:** `POST /convert_code`

**Request:**
```json
{
  "session_id": "a1b2c3d4e5f6g7h8",
  "query": "What is the total sales?"
}
```

**Response (200):**
```json
{
  "python_code": "result = df['Sales'].sum()",
  "sql_code": "SELECT SUM(Sales) FROM uploaded_data"
}
```

---

### 5. Visualization

**Endpoint:** `POST /visualize`

**Request:**
```json
{
  "session_id": "a1b2c3d4e5f6g7h8",
  "query": "Show sales by category"
}
```

**Response (200):**
```json
{
  "visualizations": [
    {
      "title": "Sales by Category",
      "data": [...],
      "layout": {...}
    },
    {
      "type": "plotly",
      "spec": {...}
    }
  ]
}
```

---

### 6. Root Endpoint

**Endpoint:** `GET /`

**Response:**
```json
{
  "message": "Welcome to the Agentic Visualization System API. See /docs for usage."
}
```

---

## Agent Workflows

### Workflow 1: Complete Data Analysis

```
1. User Uploads File
   ↓
2. FileProcessor generates overview
   ↓
3. User Enters Natural Language Query
   ↓
4. QueryExecutor converts to Pandas code
   ↓
5. Code executes safely
   ↓
6. JustificationAgent explains result
   ↓
7. AnswerValidation verifies correctness
   ↓
8. VisualizationAgent recommends charts
   ↓
9. Charts render in frontend
   ↓
10. User explores interactive visualizations
```

### Workflow 2: Auto-Visualization

```
1. File Upload Complete
   ↓
2. VisualizationAgent analyzes structure
   ↓
3. Auto-generates diverse chart recommendations:
   - If has time + numeric: line chart
   - If has category + numeric: bar chart
   - If has multiple numeric: scatter plot
   - Auto-generated distribution charts
   - 3D scatter if 3+ dimensions
   ↓
4. All charts render simultaneously
   ↓
5. User can customize or drill down
```

### Workflow 3: Code Learning

```
1. User asks query in natural language
   ↓
2. QueryExecutor generates Pandas code
   ↓
3. QueryToSQL generates SQL equivalent
   ↓
4. QueryToPython generates standalone code
   ↓
5. All three shown for comparison
   ↓
6. User learns equivalent implementations
```

---

## Deployment Architecture

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start  # runs on http://localhost:3000
```

### Production Deployment (Render.com)

**Backend Web Service:**
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Environment Variables: `GROQ_API_KEY`

**Frontend Static Site:**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Environment Variables: `REACT_APP_API_URL` (backend URL)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Groq LLM API key | Yes (Backend) |
| `REACT_APP_API_URL` | Backend API URL | Optional (Frontend) |

---

## Security Considerations

### 1. Code Execution Safety

**Risk:** Arbitrary Python code execution from LLM

**Mitigations:**
- Execute code in isolated `local_vars` environment
- No access to `__import__` or built-in functions
- Whitelist pandas/numpy operations
- Syntax validation before execution
- Error handling prevents crashes
- Consider sandbox alternatives (e.g., RestrictedPython)

### 2. Data Privacy

**Current State:**
- In-memory session storage
- No persistent database
- Data lost on server restart

**Production Recommendations:**
- Implement persistent session storage
- Database encryption
- User authentication/authorization
- Data retention policies
- GDPR compliance measures

### 3. LLM Prompt Injection

**Risk:** Malicious queries crafted to bypass system

**Mitigations:**
- Prompt constraints & validation
- Input sanitization
- Temperature=0 for deterministic responses
- Code validation before execution
- Monitoring & logging

### 4. API Security

**Recommendations:**
- Add authentication (JWT/OAuth)
- Rate limiting per session
- CORS restrictions
- HTTPS in production
- Input validation (file size limits)
- SQL injection prevention for SQL queries

### 5. File Upload Security

**Current:**
- File type validation by extension
- Memory-based processing

**Production:**
- Implement file size limits
- Virus scanning
- Malware detection
- Store in secure object storage
- Implement quota per user

---

## Future Enhancements

### 1. Database Integration
- Persistent session storage
- User accounts & authentication
- Query history tracking
- Saved visualization templates

### 2. Advanced Analytics
- Statistical tests & hypothesis testing
- Predictive modeling capabilities
- Time series forecasting
- Clustering & dimensionality reduction

### 3. Enhanced Visualizations
- Custom color schemes
- Advanced Plotly interactions
- Real-time streaming charts
- Dashboard builder
- Export to PDF/PowerPoint

### 4. Collaboration Features
- Share sessions with other users
- Collaborative annotations
- Comment threads
- Version history

### 5. Performance Optimization
- Caching frequently accessed results
- Pagination for large datasets
- Lazy loading of visualizations
- Query result compression

### 6. Extended File Support
- JSON/XML files
- Parquet files
- Database connections (PostgreSQL, MySQL)
- API data sources

### 7. LLM Enhancements
- Multiple LLM options (OpenAI, Claude, etc.)
- Fine-tuned models for better accuracy
- Multi-step reasoning (Chain of Thought)
- Few-shot learning examples

### 8. Advanced Validation
- Data quality checks
- Statistical validation
- Outlier detection
- Data freshness warnings

### 9. Audit & Compliance
- Query audit logging
- Data access tracking
- Compliance reports
- Data lineage tracking

### 10. Mobile App
- React Native mobile application
- Offline capabilities
- Push notifications
- Mobile-optimized UI

---

## Development Guidelines

### Code Organization
- `agents/` contains all AI agent logic
- `main.py` is the entry point
- Clean separation of concerns
- Each agent is a class with specific responsibilities

### Adding New Agents
1. Create new file in `backend/agents/`
2. Define class with `__init__(groq_api_key)`
3. Implement processing methods
4. Update `main.py` to initialize and use
5. Add corresponding API endpoint

### Adding New Visualizations
1. Update `visualization.py` recommend method
2. Add chart type to `generate_visualization` method
3. Use Plotly Express for consistency
4. Test with sample data
5. Handle errors gracefully

### Frontend Component Pattern
```javascript
// Functional component with hooks
const ComponentName = ({ props }) => {
  const [state, setState] = useState(initialValue);
  const handleAction = async () => { ... };
  
  return (
    <Container>
      {/* JSX */}
    </Container>
  );
};
export default ComponentName;
```

---

## Monitoring & Debugging

### Backend Logging
- Enable uvicorn logging
- Add application-level logging
- Monitor LLM API calls
- Track execution times

### Frontend Debugging
- React DevTools browser extension
- Network tab for API calls
- Console for errors/warnings
- Performance profiling

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Check CORSMiddleware configuration |
| LLM timeouts | Increase timeout, check API quota |
| Memory issues | Implement pagination/chunking |
| Invalid code generation | Refine LLM prompts, add examples |

---

## Conclusion

Agent-DVS demonstrates a sophisticated integration of:
- **Modern AI/LLM capabilities** through LangChain and Groq
- **Full-stack web development** with React and FastAPI
- **Interactive data visualization** using Plotly
- **Agentic architecture** for task decomposition and automation

The system provides an intuitive interface for non-technical users to explore data through natural language while maintaining code transparency and result validation. Future enhancements will focus on scalability, persistence, collaboration, and advanced analytics capabilities.

---

**Document Version:** 1.0  
**Last Updated:** 2025-06-17  
**Author:** Jd1430  
**Repository:** https://github.com/Jd1430/Agent-DVS
