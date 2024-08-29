import axios from "axios";
//대출하기 인증
export const PostLoan = async (navigate) => {
  try {
    const response = await axios.post("teenbook-api/borrow_info");
    if (response.status === 200) {
      alert("대출인증이 완료되었습니다.");
      navigate(-1);
      console.log("대출 인증 성공");
    }
    if (response.status === 400) {
      console.log("대출 인증 실패");
    }
  } catch (error) {
    console.log("Faild to bookmark", error);
    throw error;
  }
};
