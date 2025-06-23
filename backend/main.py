from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import io
import os
import base64
import numpy as np

# Import Agents
from agents.file_processing import FileProcessor
from agents.query_execution import QueryExecutor
from agents.answer_validation import AnswerValidation
from agents.visualization import Visualization
from agents.dashboard import Dashboard
from agents.query_to_python import QueryToPython
from agents.query_to_sql import QueryToSQL

# Add this import for Plotly
try:
    import plotly.io as pio
except ImportError:
    pio = None

app = FastAPI(title="Agentic Visualization System API")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
file_processor = FileProcessor(GROQ_API_KEY)
query_executor = QueryExecutor(GROQ_API_KEY)
validation_agent = AnswerValidation(GROQ_API_KEY)
visualization_agent = Visualization(GROQ_API_KEY)
dashboard_agent = Dashboard()
python_converter = QueryToPython(GROQ_API_KEY)
sql_converter = QueryToSQL(GROQ_API_KEY)

# In-memory storage for uploaded data (for demo; use DB in prod)
DATA_STORAGE = {}

class FileOverviewResponse(BaseModel):
    dataframe_head: list
    file_overview: str
    columns: list
    session_id: str

class QueryRequest(BaseModel):
    session_id: str
    query: str

class QueryResponse(BaseModel):
    result: str
    justification: str
    executed_code: str

class CodeConversionResponse(BaseModel):
    python_code: str
    sql_code: str

class ValidationResponse(BaseModel):
    validation_message: str
    justification: str

class VisualizationRequest(BaseModel):
    session_id: str
    query: str = None
    result: str = None

class VisualizationResponse(BaseModel):
    visualizations: list  # Each item: {"type": ..., "image_base64": ...}

def convert_ndarray_to_list(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_ndarray_to_list(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_ndarray_to_list(i) for i in obj]
    else:
        return obj

@app.post("/upload", response_model=FileOverviewResponse)
def upload_file(file: UploadFile = File(...)):
    file_bytes = file.file.read()
    file_type = file.filename.split(".")[-1].lower()
    file_data = file_bytes.decode("utf-8") if file_type == "csv" else file_bytes
    file_info = file_processor.process_file(file_data, file_type)
    if "error" in file_info:
        return JSONResponse(status_code=400, content={"error": file_info["error"]})
    df = file_info["dataframe"]
    session_id = os.urandom(8).hex()
    DATA_STORAGE[session_id] = df
    return FileOverviewResponse(
        dataframe_head=df.head().to_dict(orient="records"),
        file_overview=file_info["file_overview"],
        columns=list(df.columns),
        session_id=session_id
    )

@app.post("/query", response_model=QueryResponse)
def process_query(req: QueryRequest):
    df = DATA_STORAGE.get(req.session_id)
    if df is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})
    query_result = query_executor.execute_query(df, req.query)
    if "error" in query_result:
        return JSONResponse(status_code=400, content={"error": query_result["error"]})
    return QueryResponse(
        result=str(query_result["result"]),
        justification=query_result["justification"],
        executed_code=query_result.get("executed_code", "")
    )

@app.post("/convert_code", response_model=CodeConversionResponse)
def convert_code(req: QueryRequest):
    df = DATA_STORAGE.get(req.session_id)
    if df is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})
    python_code = python_converter.convert(df, req.query)["python_code"]
    sql_code = sql_converter.convert(req.query, table_name="uploaded_data")["sql_code"]
    return CodeConversionResponse(python_code=python_code, sql_code=sql_code)

@app.post("/validate", response_model=ValidationResponse)
def validate(req: QueryRequest):
    df = DATA_STORAGE.get(req.session_id)
    if df is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})
    # For validation, need executed_code and result; here, we assume frontend provides them or you can extend the model
    query_result = query_executor.execute_query(df, req.query)
    validation_result = validation_agent.validate_result(
        df, req.query, query_result.get("executed_code", ""), query_result["result"]
    )
    return ValidationResponse(
        validation_message=validation_result["validation_message"],
        justification=validation_result["justification"]
    )

@app.post("/visualize", response_model=VisualizationResponse)
def visualize(req: VisualizationRequest):
    df = DATA_STORAGE.get(req.session_id)
    if df is None:
        return JSONResponse(status_code=404, content={"error": "Session not found"})
    if req.query:
        viz_recommendations = visualization_agent.recommend_visualization(df, req.query, req.result)
    else:
        viz_recommendations = visualization_agent.auto_generate_visualizations(df)
    visualizations = visualization_agent.generate_visualization(df, viz_recommendations)
    viz_list = []
    for viz in visualizations:
        # Matplotlib Figure
        if hasattr(viz, "savefig"):
            buf = io.BytesIO()
            viz.savefig(buf, format="png")
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode("utf-8")
            viz_list.append({"type": str(type(viz)), "image_base64": img_base64})
        # Plotly Figure
        elif pio and hasattr(viz, "to_image"):
            img_bytes = viz.to_image(format="png")
            img_base64 = base64.b64encode(img_bytes).decode("utf-8")
            viz_list.append({"type": str(type(viz)), "image_base64": img_base64})
        # Dict with base64 image
        elif isinstance(viz, dict) and "image_base64" in viz:
            viz_list.append(viz)
        # Dict with Plotly spec
        elif isinstance(viz, dict) and ("data" in viz and "layout" in viz):
            safe_spec = convert_ndarray_to_list(viz)
            viz_list.append({"type": "plotly", "spec": safe_spec})
        else:
            continue
    return VisualizationResponse(visualizations=viz_list)

@app.get("/")
def root():
    return {"message": "Welcome to the Agentic Visualization System API. See /docs for usage."}
