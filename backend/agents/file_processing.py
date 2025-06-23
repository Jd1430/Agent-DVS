import pandas as pd
import sqlite3
from io import StringIO
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

class FileProcessor:
    """Handles file uploads and extracts metadata."""

    def __init__(self, groq_api_key):
        self.llm = ChatGroq(model="llama3-70b-8192", temperature=0, groq_api_key=groq_api_key)

    def process_file(self, file_content: str, file_type: str):
        """Reads and processes file content based on type."""
        try:
            if file_type == "csv":
                df = pd.read_csv(StringIO(file_content))
            elif file_type == "xlsx":
                df = pd.read_excel(StringIO(file_content))
            elif file_type == "sql":
                conn = sqlite3.connect(':memory:')
                conn.executescript(file_content)
                df = pd.read_sql("SELECT * FROM sqlite_master WHERE type='table'", conn)
            else:
                return {"error": "Unsupported file type"}

            # Generate file overview using the LLM agent
            file_overview = self.generate_file_overview(df)

            return {"dataframe": df, "file_overview": file_overview}
        
        except Exception as e:
            return {"error": str(e)}

    def generate_file_overview(self, df: pd.DataFrame) -> str:
        """Uses an agentic approach to summarize the dataset."""
        
        # Prepare data preview for LLM
        sample_data = df.head(5).to_string()

        # Create an LLM prompt
        overview_prompt = PromptTemplate.from_template(
            """You are a data analysis assistant. Provide a **high-level summary** of the uploaded dataset.
            
            Here is a preview of the dataset:
            ```
            {sample_data}
            ```
            
            Based on the data:
            - Describe the **type of data** (e.g., financial, sales, customer data).
            - Identify **important columns** and their significance.
            - Highlight **patterns, missing values, and anomalies**.
            - Suggest what kind of **insights can be derived** from this dataset.
            
            Provide a **concise** summary without unnecessary details.
            """
        )

        # Generate summary from LLM
        overview_message = overview_prompt.format_prompt(sample_data=sample_data)
        overview_response = self.llm.invoke([HumanMessage(content=overview_message.to_string())])
        
        return overview_response.content.strip()
