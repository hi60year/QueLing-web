import axios from 'axios'

const api = axios.create({
    baseURL: "https://localhost:49153/api"
});

export default api;