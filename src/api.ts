import axios from 'axios'

const api = axios.create({
    baseURL: "http://101.34.84.77/api"
});

export default api;