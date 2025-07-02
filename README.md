
---

## 🚀 Features

- **Upload** CSV, Excel, or SQL data files
- **Ask questions** in natural language
- **Automatic data summaries**
- **Query results** with explanations
- **Python & SQL code generation**
- **Result validation**
- **Interactive visualizations** (Plotly, etc.)
- **Responsive UI** for desktop, tablet, and mobile

---

## 🛠️ Getting Started (Local Development)

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- The API will be available at `http://localhost:8000`

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
```

- The app will run at `http://localhost:3000` and proxy API requests to the backend.

---

## 🌐 Deployment (Render.com Example)

### Backend

- Create a new **Web Service** on Render.
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port 8000`
- Set any required environment variables (e.g., `GROQ_API_KEY`).

### Frontend

- Create a new **Static Site** on Render.
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Set `REACT_APP_API_URL` to your backend URL if needed.

---

## 📦 Environment Variables

- `GROQ_API_KEY` (for LLM/agent features)
- `REACT_APP_API_URL` (frontend, if backend is not on localhost)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

MIT License

---

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Plotly](https://plotly.com/)
- [LangChain](https://www.langchain.com/)
- [Render.com](https://render.com/)

---
