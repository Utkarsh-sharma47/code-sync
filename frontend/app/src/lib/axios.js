import axios from "axios"

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials:true //browser will send cookies for each req
})

export default axiosInstance;

//we use axios to call for API for frontend
