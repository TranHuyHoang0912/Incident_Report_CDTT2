import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  // withCredentials: false, // Không cần nếu dùng Bearer token
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Đã gắn token vào header:", config.headers["Authorization"]);
    } else {
      console.log("Không tìm thấy token!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
