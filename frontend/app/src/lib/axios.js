import axios from "axios"

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials:true //browser will send cookies for each req
})

export default axiosInstance;

//we use axios to call for API for frontend
