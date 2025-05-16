import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/v1",
  withCredentials: true,
});


// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/v1" : "/api",
//   withCredentials: true,
// });

