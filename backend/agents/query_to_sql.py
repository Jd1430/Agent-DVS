import re
import json
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

class QueryToSQL:
    """Converts natural language queries into executable SQL code."""

    def __init__(self, groq_api_key):
        self.llm = ChatGroq(model="llama3-70b-8192", temperature=0, groq_api_key=groq_api_key)

    def convert(self, queries, table_name):
        """Generates SQL code for the given queries."""
        
        prompt = PromptTemplate.from_template(
            """Convert the following natural language queries into SQL queries.

            - Assume the data is stored in a SQL table named `{table_name}`.
            - Write a valid SQL SELECT query.
            - Do NOT include explanations or markdown formatting.

            Queries: {queries}

            Example Output:
            ```sql
            SELECT Category, SUM(Sales) FROM {table_name} GROUP BY Category;
            ```
            """
        )

        query_message = prompt.format_prompt(queries=json.dumps(queries), table_name=table_name)
        query_response = self.llm.invoke([HumanMessage(content=query_message.to_string())])
        sql_code = query_response.content.strip()

        # Extract only the SQL code
        match = re.search(r"```sql(.*?)```", sql_code, re.DOTALL)
        if match:
            sql_code = match.group(1).strip()

        return {"sql_code": sql_code}
