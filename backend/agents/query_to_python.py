import re
import json
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

class QueryToPython:
    """Converts natural language queries into executable Pandas (Python) code."""

    def __init__(self, groq_api_key):
        self.llm = ChatGroq(model="llama3-70b-8192", temperature=0, groq_api_key=groq_api_key)

    def convert(self, df, queries):
        """Generates Python (Pandas) code for the given queries."""
        
        prompt = PromptTemplate.from_template(
            """Convert the following natural language queries into valid Pandas code.

            - Use the dataframe variable `df` (already provided).
            - Store the output in a variable called `result`.
            - Do NOT include explanations or markdown formatting.

            Queries: {queries}
            DataFrame Columns: {columns}

            Example Output:
            ```python
            result = df.groupby('Category')['Sales'].sum()
            ```
            """
        )

        query_message = prompt.format_prompt(queries=json.dumps(queries), columns=", ".join(df.columns))
        query_response = self.llm.invoke([HumanMessage(content=query_message.to_string())])
        python_code = query_response.content.strip()

        # Extract only the Python code
        match = re.search(r"```python(.*?)```", python_code, re.DOTALL)
        if match:
            python_code = match.group(1).strip()

        return {"python_code": python_code}
