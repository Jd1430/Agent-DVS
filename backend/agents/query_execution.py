import pandas as pd
import re
import json
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

class QueryExecutor:
    """Executes natural language queries on data using an AI agent."""

    def __init__(self, groq_api_key):
        self.llm = ChatGroq(model="llama3-70b-8192", temperature=0, groq_api_key=groq_api_key)

    def execute_query(self, df: pd.DataFrame, query: str):
        """Converts a user query into a Pandas command, executes it safely, and provides a justification."""

        # **🔹 Improved Prompt for Query Execution**
        prompt = PromptTemplate.from_template(
            """You are a Python data expert. Convert the following natural language query into a valid Pandas command.
            
            - Use the dataframe variable `df` (already provided).
            - Ensure the output is stored in a variable called `result`.
            - Only return executable Python code, **no explanations, markdown, or extra text**.

            - If time-based operations are required, **first convert the column to datetime** using `pd.to_datetime()`.  
            - Ensure that **time-based queries use datetime columns** correctly.  
            - If time data **doesn't match the format ("%m/%d/%Y")**, try converting using `dayfirst=True` or infer the format automatically.  
            - If conversion fails, **return the date in its original format ("%d/%m/%Y")** instead of raising an error.  

            - Your task is to **combine these queries into a single meaningful question** that captures their intent.
            - If only one query is provided, return it as is.
            - Ensure the new query remains concise but logically complete.

            - When selecting multiple columns, always use a **list** (`df[['col1', 'col2']]`) instead of a tuple (`df[('col1', 'col2')]`).

            Query: {query}
            DataFrame Columns: {columns}

            Example Transformations:
            - ["What is the total sales?", "What is the highest profit?"] → "What is the total sales and highest profit?"
            - ["Show monthly revenue trends.", "Display yearly revenue trends."] → "How has revenue changed over months and years?"
            - ["Who are the top customers?", "Which products sell the most?"] → "Who are the top customers and best-selling products?"

            Ensure the response is a **single, well-structured question**.

            Example Output:
            ```python
            result = df.groupby('Category')['Sales'].sum()
            ```
            """
        )

        query_message = prompt.format_prompt(query=query, columns=", ".join(df.columns))
        query_response = self.llm.invoke([HumanMessage(content=query_message.to_string())])
        query_code = query_response.content.strip()

        # **🔹 Extract only Python code (Removes markdown formatting)**
        match = re.search(r"```python(.*?)```", query_code, re.DOTALL)
        if match:
            query_code = match.group(1).strip()

        # **🔹 Ensure the code is correctly formatted**
        if not query_code.startswith("result ="):
            return {"error": "Invalid Pandas command generated by LLM", "query_code": query_code}

        # **🔹 Execute the query safely**
        local_vars = {"df": df, "pd": pd}
        try:
            exec(query_code, globals(), local_vars)
            result = local_vars.get("result")
        except Exception as e:
            return {"error": f"Query execution failed: {str(e)}", "query_code": query_code}

        
        # **🔹 Generate a Justification for the Query Result**
        justification_prompt = PromptTemplate.from_template(
            """Explain in a short and concise manner how the following query result was derived.
            
            - Use simple language to summarize the logic behind the query.
            - Use simple language to highlight key insights from the result.
            - Mention specific values, trends, or categories where applicable.
            - Keep it under 300 words.
            - Do not include Python code, just the explanation.

            Query: {query}
            Executed Code:
            ```python
            {executed_code}
            ```

            
            Ensure the justification is **relevant to the result type** and **references the key data points from the result**.
            """
        )

        justification_message = justification_prompt.format_prompt(query=query, executed_code=query_code)
        justification_response = self.llm.invoke([HumanMessage(content=justification_message.to_string())])
        justification = justification_response.content.strip()

        return {"result": result, "executed_code": query_code, "justification": justification}
