import axios from "axios";
const BASE_URL = import.meta.env.VITE_LIBRARY_API_URL;
// export const fetchLibraries = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}`);
//     console.log("도서관 정보 데이터", response.data);
//     return response.data; // 응답 데이터 반환
//   } catch (error) {
//     console.error("Failed to fetch librariesAPI:", error);
//     throw error; // 에러를 호출자에게 전달
//   }
// };
export const fetchLibraries = async () => {
  try {
    const response = await fetch(`${BASE_URL}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("인기도서대출 데이터:", data);
    return data;
  } catch (error) {
    console.log("Failed to fetch PopularBooks:", error);
  }
};
