import { Link } from "react-router-dom";
import logo from "../assets/logo_2.png"; // 로고 이미지 경로는 실제 경로에 맞게 수정해줘!

const Logo = () => {
  return (
    <Link to="/">
      <img
        src={logo}
        alt="로고"
        style={{
          height: "40px", // 높이 조절
          cursor: "pointer"
          , // 손모양 커서
        }}
      />
    </Link>
  );
};

export default Logo;
