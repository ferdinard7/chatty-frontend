import axios from "axios";

// http://localhost:3000/v1

export const axiosInstance = axios.create({
  baseURL: "https://api-gateway-xlrr.onrender.com/v1",
  withCredentials: true,
});


// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/v1" : "/api",
//   withCredentials: true,
// });

