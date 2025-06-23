import axios from 'axios';

const API = "http://localhost:8000"; // or your deployed backend URL

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API}/upload/`, formData);
};

export const processQuery = (query, fileData) => {
  return axios.post(`${API}/execute-query`, { query, data: fileData });
};
