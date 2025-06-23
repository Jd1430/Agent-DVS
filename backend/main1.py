# File: backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import pandas as pd
import os
from dotenv import load_dotenv
import plotly.io as pio


# Load env variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Import agents
from agents.file_processing import FileProcessor
from agents.query_execution import QueryExecutor
from agents.answer_validation import AnswerValidation
from agents.visualization import Visualization
from agents.query_to_python import QueryToPython
from agents.query_to_sql import QueryToSQL

# Initialize agents
file_processor = FileProcessor(GROQ_API_KEY)
query_executor = QueryExecutor(GROQ_API_KEY)
validation_agent = AnswerValidation(GROQ_API_KEY)
visualization_agent = Visualization(GROQ_API_KEY)
python_converter = QueryToPython(GROQ_API_KEY)
sql_converter = QueryToSQL(GROQ_API_KEY)

# App setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory data storage
session_data = {}

class QueryRequest(BaseModel):
    query: str
    data: dict  # Serialized DataFrame from frontend

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        file_type = file.filename.split(".")[-1].lower()
        file_data = content.decode("utf-8")

        result = file_processor.process_file(file_data, file_type)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        df = result["dataframe"]
        sample = df.head().to_dict(orient="records")
        session_data['df'] = df  # Save for session

        return {"sample": sample, "summary": result["file_overview"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def process_query(request: QueryRequest):
    try:
        df = session_data.get('df')
        if df is None:
            raise HTTPException(status_code=400, detail="No file uploaded.")

        query_result = query_executor.execute_query(df, request.query)
        if "error" in query_result:
            raise HTTPException(status_code=400, detail=query_result["error"])

        python_code = python_converter.convert(df, request.query)["python_code"]
        sql_code = sql_converter.convert(request.query, table_name="uploaded_data")["sql_code"]

        validation_result = validation_agent.validate_result(
            df, request.query, query_result["executed_code"], query_result["result"]
        )

        viz_recommendations = visualization_agent.recommend_visualization(df, request.query, query_result["result"])
        images = visualization_agent.generate_visualization(df, viz_recommendations)

        return {
            "result": query_result["result"],
            "justification": query_result["justification"],
            "python_code": python_code,
            "sql_code": sql_code,
            "validation": validation_result,
            "visualizations": images
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/visualize")
async def auto_visualize():
    try:
        df = session_data.get('df')
        if df is None:
            raise HTTPException(status_code=400, detail="No file uploaded.")

        viz_recommendations = visualization_agent.auto_generate_visualizations(df)
        images = visualization_agent.generate_visualization(df, viz_recommendations)
        serialized_figs = [pio.to_json(fig) for fig in images]
        return {"charts": serialized_figs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
