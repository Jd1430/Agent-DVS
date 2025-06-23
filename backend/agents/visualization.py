# backend/agents/visualization.py

import re
import json
import pandas as pd
import plotly.express as px
import plotly.figure_factory as ff
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from typing import Dict, List

class Visualization:
    """Generates suitable visualizations based on query results."""

    def __init__(self, groq_api_key):
        self.llm = ChatGroq(model="llama3-70b-8192", temperature=0, groq_api_key=groq_api_key)

    def recommend_visualization(self, df: pd.DataFrame, query: str, result) -> Dict:
        """Suggests best visualization types based on query and result."""

        viz_prompt = PromptTemplate.from_template(
            """You are a data visualization expert. Based on the given query and result, suggest the best visualization types.

            Query: {query}
            Data Sample:
            {sample}

            Use the following visualization types when applicable:
            - "bar", "scatter", "pie", "histogram", "box", "violin", "density_heatmap"
            - "kde", "area", "line_area", "geo", "sunburst", "treemap", "polar", "scatter_3d", "choropleth"

            Response must be JSON with "recommendations" list:
            ```json
            {{
                "recommendations": [
                    {{"type": "bar", "data_columns": ["Category", "Sales"], "title": "Sales by Category"}}
                ]
            }}
            Only use column names from this list:
            {columns}
            """
        )

        sample_str = df.head(4).to_string()
        viz_message = viz_prompt.format_prompt(query=query, sample=sample_str, columns=list(df.columns))
        viz_response = self.llm.invoke([HumanMessage(content=viz_message.to_string())])
        viz_content = viz_response.content.strip()

        match = re.search(r"```json(.*?)```", viz_content, re.DOTALL)
        if match:
            viz_content = match.group(1).strip()

        try:
            recommendations = json.loads(viz_content)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON response from LLM", "raw_output": viz_content}

        return recommendations

    def auto_generate_visualizations(self, df: pd.DataFrame) -> Dict:
        """Auto-generates visualizations based on dataset structure."""
        recommendations = {"recommendations": []}
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        datetime_cols = df.select_dtypes(include=["datetime"]).columns.tolist()

        if datetime_cols and numeric_cols:
            recommendations["recommendations"].append({
                "type": "line_area", "data_columns": [datetime_cols[0], numeric_cols[0]],
                "title": f"Trend of {numeric_cols[0]} Over Time"
            })

        if categorical_cols and numeric_cols:
            recommendations["recommendations"].append({
                "type": "bar", "data_columns": [categorical_cols[0], numeric_cols[0]],
                "title": f"{numeric_cols[0]} by {categorical_cols[0]}"
            })

        if numeric_cols:
            recommendations["recommendations"].extend([
                {"type": "histogram", "data_columns": [numeric_cols[0]], "title": f"Histogram of {numeric_cols[0]}"},
                {"type": "kde", "data_columns": [numeric_cols[0]], "title": f"KDE of {numeric_cols[0]}"},
                {"type": "box", "data_columns": [numeric_cols[0]], "title": f"Boxplot of {numeric_cols[0]}"},
                {"type": "violin", "data_columns": [numeric_cols[0]], "title": f"Violin Plot of {numeric_cols[0]}"}
            ])

        if len(numeric_cols) >= 2:
            recommendations["recommendations"].append({
                "type": "scatter", "data_columns": numeric_cols[:2],
                "title": f"Scatter Plot: {numeric_cols[0]} vs {numeric_cols[1]}"
            })

        if len(categorical_cols) >= 2 and numeric_cols:
            recommendations["recommendations"].extend([
                {"type": "treemap", "data_columns": categorical_cols[:2] + [numeric_cols[0]], "title": "Treemap of Categories"},
                {"type": "sunburst", "data_columns": categorical_cols[:2] + [numeric_cols[0]], "title": "Sunburst of Categories"}
            ])

        if "country" in df.columns and numeric_cols:
            recommendations["recommendations"].append({
                "type": "choropleth",
                "data_columns": ["country", numeric_cols[0]],
                "title": f"Choropleth Map of {numeric_cols[0]} by Country"
            })

        if len(numeric_cols) >= 2:
            recommendations["recommendations"].append({
                "type": "polar", "data_columns": numeric_cols[:2],
                "title": f"Polar Chart: {numeric_cols[0]} and {numeric_cols[1]}"
            })

        if len(numeric_cols) >= 3:
            recommendations["recommendations"].append({
                "type": "scatter_3d", "data_columns": numeric_cols[:3],
                "title": "3D Scatter Plot"
            })

        # Fallback: if no recommendations, just plot the first two columns as a scatter (if possible)
        if not recommendations["recommendations"] and len(df.columns) >= 2:
            recommendations["recommendations"].append({
                "type": "scatter",
                "data_columns": list(df.columns)[:2],
                "title": f"Scatter Plot: {df.columns[0]} vs {df.columns[1]}"
            })
        print("[auto_generate_visualizations] recommendations:", recommendations)
        return recommendations

    def generate_visualization(self, df: pd.DataFrame, recommendations: List[Dict]) -> List[Dict]:
        """Generates Plotly figure JSONs from recommendations."""
        visualizations = []

        for rec in recommendations.get("recommendations", []):
            viz_type = rec.get("type", "").lower()
            cols = rec.get("data_columns", [])
            title = rec.get("title", "Generated Visualization")

            try:
                if viz_type == "bar":
                    fig = px.bar(df, x=cols[0], y=cols[1], title=title, color=cols[0])
                elif viz_type == "scatter":
                    fig = px.scatter(df, x=cols[0], y=cols[1], title=title, color=cols[0])
                elif viz_type == "pie":
                    fig = px.pie(df, names=cols[0], title=title)
                elif viz_type == "box":
                    fig = px.box(df, y=cols[0], title=title)
                elif viz_type == "violin":
                    fig = px.violin(df, y=cols[0], title=title, box=True, points="all")
                elif viz_type == "density_heatmap":
                    fig = px.density_heatmap(df, x=cols[0], y=cols[1], title=title)
                elif viz_type == "kde":
                    fig = ff.create_distplot([df[cols[0]].dropna()], group_labels=[cols[0]], show_hist=False)
                elif viz_type == "area":
                    fig = px.area(df, x=cols[0], y=cols[1], title=title)
                elif viz_type == "line_area":
                    fig = px.area(df, x=cols[0], y=cols[1], title=title)
                elif viz_type == "treemap":
                    fig = px.treemap(df, path=cols[:-1], values=cols[-1], title=title)
                elif viz_type == "sunburst":
                    fig = px.sunburst(df, path=cols[:-1], values=cols[-1], title=title)
                elif viz_type == "choropleth":
                    fig = px.choropleth(df, locations=cols[0], locationmode="country names", color=cols[1], title=title)
                elif viz_type == "polar":
                    fig = px.line_polar(df, r=cols[0], theta=cols[1], title=title)
                elif viz_type == "scatter_3d":
                    fig = px.scatter_3d(df, x=cols[0], y=cols[1], z=cols[2], title=title)
                else:
                    continue

                visualizations.append({
                    "title": title,
                    "data": fig.to_dict().get("data", []),
                    "layout": fig.to_dict().get("layout", {})
                })

            except Exception as e:
                print(f"⚠️ Error generating {viz_type}: {e}")

        print("[generate_visualization] visualizations:", visualizations)
        return visualizations
