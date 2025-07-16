import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './AuthPage.css';
import logo from '../assets/logo.png'; // 로고 이미지 경로 확인
import AuthService from '../services/AuthService'; // AuthService 경로 확인
import CustomAlert from '../components/CustomAlert'; // CustomAlert 경로 확인

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', // 회원가입 시 사용될 사용자 이름 (백엔드 UserDTO의 username에 매핑)
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [emailError, setEmailError] = useState(''); // 이메일 형식 오류 상태
  const [alertMessage, setAlertMessage] = useState('');

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'name') {
      setEmailError(''); // 이메일 입력 시 오류 메시지 초기화
    }
  };

  // 이메일 형식 유효성 검사만 수행하는 함수 (중복 확인 로직 제거)
  const validateEmailFormat = (email) => {
    if (!email.includes('@') || !email.includes('.')) {
      return '유효한 이메일 형식이 아닙니다.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // AuthService.login은 { success: true, message: '...', token: '...' } 또는 { success: false, message: '...' } 반환
      // 백엔드 LoginFilter는 'username' 필드를 기대하므로, 이메일을 username으로 전달합니다.
      const result = await AuthService.login(formData.name, formData.password); 

      if (result.success) {
        // 토큰 저장은 AuthService.login 내부에서 이미 처리됩니다.
        setAlertMessage('로그인 성공! 메인 페이지로 이동합니다.');
        setTimeout(() => navigate('/'), 1000);
      } else {
        setAlertMessage('로그인 실패: ' + result.message);
        console.error('로그인 실패 (AuthPage):', result.message);
      }
    } else { // 회원가입 로직
      const { name, email, password, confirmPassword } = formData;

      if (password !== confirmPassword) {
        setAlertMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }

      // 이메일 형식 유효성 검사만 수행 (중복 확인은 백엔드에서 처리)
      const emailFormatValidationMessage = validateEmailFormat(formData.name);
      if (emailFormatValidationMessage) {
        setEmailError(emailFormatValidationMessage);
        return;
      }
      
      // AuthService.register는 { success: true, message: '...' } 또는 { success: false, message: '...' } 반환
      // formData.name을 백엔드 UserDTO의 username 필드에 매핑하여 전달
      const registerResult = await AuthService.register(name, email, password); 

      if (registerResult.success) {
        setAlertMessage('회원가입이 성공적으로 완료되었습니다! 이제 로그인할 수 있습니다.');
        setIsLogin(true); // 회원가입 성공 후 로그인 폼으로 전환
        setFormData({ name: '', email: '', password: '', confirmPassword: '' }); // 폼 초기화
      } else {
        setAlertMessage('회원가입 실패: ' + registerResult.message);
        console.error('회원가입 실패 (AuthPage):', registerResult.message);
      }
    }
  };

  // 임시 로그인 버튼 관련 함수 제거 (handleTempLogin)
  // const handleTempLogin = () => {
  //   const tempToken = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';
  //   localStorage.setItem('userToken', tempToken);
  //   setAlertMessage('임시 로그인 성공! 메인 페이지로 이동합니다.');
  //   setTimeout(() => navigate('/'), 1000);
  // };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setEmailError(''); // 모드 전환 시 이메일 오류 초기화
    setAlertMessage(''); // 모드 전환 시 알림 메시지 초기화
  };

  return (
    <div className="auth-page">
      <div className="catchphrase-section">
        <h2 className="catchphrase-title">"여행이 쉬워진다, AI와 함께라면."</h2>
        <p className="catchphrase-subtitle">당신만의 맞춤 일정과 최고의 경로, 단 한 번의 클릭으로.</p>
      </div>
      <div className="auth-form-container">
        <div className="logo-section">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="애플리케이션 로고" />
            </Link>
          </div>
          <h1 className="welcome-title">
            {isLogin ? '안녕하세요!' : '회원 가입'}
          </h1>
          <p className="subtitle">
            {isLogin ? '로그인 정보를 입력해주세요.' : '새로운 여행의 시작을 함께해요'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {!isLogin && (
            <div className="input-group">
              <label>성함 (사용자 이름)</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>이메일</label> {/* 레이블 변경 */}
            <input
              type="email"
              name="name" // 백엔드 UserDTO의 username에 매핑
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          {/* 이메일 형식 오류 메시지 표시 */}
          {!isLogin && emailError && (
            <p className="error-message">{emailError}</p>
          )}
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* 임시 로그인 버튼 제거 */}
        {/* {isLogin && (
          <button type="button" onClick={handleTempLogin} className="temp-login-btn">
            임시 로그인 (개발용)
          </button>
        )} */}

        <div className="toggle-section">
          <p>
            {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? '회원 가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>

      {/* 💡 커스텀 알림창 */}
      {alertMessage && (
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage('')} />
      )}
    </div>
  );
}

export default AuthPage;