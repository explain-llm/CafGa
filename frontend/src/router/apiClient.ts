import axios from 'axios';

export const BASE_URL =
    process.env.NODE_ENV === 'production'
        ? `https://backend.${window.location.hostname}`
        : 'http://localhost:8000';


export const axiosClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});