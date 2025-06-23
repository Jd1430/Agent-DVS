# 📊 Agentic Visualization System

This **Streamlit-based web application** leverages AI agents to process data, execute queries, validate results, and generate interactive visualizations.

## 🚀 Features
- 📂 **Upload CSV, Excel, or SQL files for processing**
- 🔍 **Query data using natural language**
- ✅ **Validate results with AI-driven verification**
- 📊 **Auto-generate meaningful visualizations**
- 📉 **Interactive dashboard for data exploration**

## 🛠️ Installation

Clone the repository and navigate into the project folder:


### Install Dependencies

Ensure you have **Python 13.1+** installed, then run:

```bash
pip install -r requirements.txt
```

## ▶️ Running the App

Launch the Streamlit app with:

```bash
streamlit run app.py
```

## 📂 File Structure

```
📂 agentic-visualization-system
│── app.py                 # Main Streamlit application
│── requirements.txt        # Dependencies
│── agents/                 # AI agents for processing, querying, validation, etc.
│   ├── file_processing.py  # Handles file uploads and data processing
│   ├── query_execution.py  # Executes queries on data
│   ├── answer_validation.py # Validates AI-generated answers
│   ├── visualization.py    # Generates interactive charts and graphs
│   ├── dashboard.py        # Displays a structured data dashboard
```

## 🖼️ Usage

### 1️⃣ Upload Data File
- Upload a **CSV, Excel, or SQL** file.
- The system will **process the data** and generate an overview.

### 2️⃣ Enter Query (Optional)
- Input a **query** to analyze the data.
- The system will **execute the query** and provide **results with justification**.

### 3️⃣ AI Validation & Visualization
- The AI **validates results** for accuracy.
- **Interactive visualizations** are generated based on data insights.

## 📌 Dependencies
- `pandas`
- `streamlit`
- `openai`
- `matplotlib`
- `seaborn`
- `sqlalchemy`
- `plotly`


