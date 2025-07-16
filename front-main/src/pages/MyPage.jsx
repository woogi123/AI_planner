import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import AuthService from '../services/AuthService';
import UserService from '../services/UserService';
import CustomAlert from '../components/CustomAlert'; // ✅ 커스텀 알림창 임포트

const MyPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [emailError, setEmailError] = useState('');

  // ✅ 커스텀 알림 상태 추가
  const [alertMessage, setAlertMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('userToken');

      if (!token || token === 'guest-planning-key-12345') {
        setAlertMessage('마이페이지는 로그인한 사용자만 이용할 수 있습니다.');
        setRedirectPath('/login');
        return;
      }

      const result = await UserService.fetchUserProfile(token);

      if (result.success) {
        setName(result.user.username);
        setEmail(result.user.email);
        setOriginalEmail(result.user.email);
        setIsLoading(false);
      } else {
        setAlertMessage(result.message || '사용자 정보를 불러오는 데 실패했습니다.');
        localStorage.removeItem('userToken');
        setRedirectPath('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setAlertMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (email !== originalEmail) {
      const emailCheckResult = await AuthService.checkEmailDuplicate(email);
      if (!emailCheckResult.success) {
        setEmailError(emailCheckResult.message);
        setAlertMessage(emailCheckResult.message);
        return;
      }
      setEmailError('');
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      setAlertMessage('로그인이 필요합니다.');
      setRedirectPath('/login');
      return;
    }

    const updateResult = await UserService.updateUserProfile(token, name, email, password);

    if (updateResult.success) {
      setAlertMessage(updateResult.message);
      setOriginalEmail(email);
      setPassword('');
      setConfirmPassword('');
    } else {
      setAlertMessage('회원 정보 업데이트에 실패했습니다: ' + updateResult.message);
    }
  };

  const handleGoToMain = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="mypage-container">
        <div className="top-right-buttons-container">
          <button type="button" onClick={handleGoToMain} className="top-bar-button">
            메인 페이지
          </button>
        </div>
        <div className="mypage-content-wrapper">
          <p>사용자 정보를 불러오는 중입니다...</p>
        </div>

        {/* ✅ 알림창 표시 */}
        {alertMessage && (
          <CustomAlert
            message={alertMessage}
            onClose={() => {
              setAlertMessage('');
              if (redirectPath) {
                navigate(redirectPath);
                setRedirectPath(null);
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="top-right-buttons-container">
        <button type="button" onClick={handleGoToMain} className="top-bar-button">
          메인 페이지
        </button>
      </div>

      <div className="mypage-content-wrapper">
        <h1 className="mypage-title">회원 정보 수정</h1>
        <form onSubmit={handleUpdateProfile} className="profile-edit-form">
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="password">새 비밀번호 (변경 시 입력)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>
          <button type="submit" className="update-button">
            정보 수정
          </button>
        </form>
      </div>

      {/* ✅ 알림창 표시 */}
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => {
            setAlertMessage('');
            if (redirectPath) {
              navigate(redirectPath);
              setRedirectPath(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default MyPage;
