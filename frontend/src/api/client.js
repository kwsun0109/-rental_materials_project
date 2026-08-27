import axios from "axios";

const client = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// 에러 응답 공통 처리
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || "서버 오류가 발생했습니다.";
        console.error("API Error:", message);
        return Promise.reject(new Error(message));
    }
);

export default client;