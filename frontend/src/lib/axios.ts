import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://172.18.8.97:5001/api",
  withCredentials: true,
});
