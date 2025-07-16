import axios from 'axios';

// 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요!
// 백엔드 Spring Boot 애플리케이션이 실행되는 포트(8099)로 변경했습니다.

// 임시 로그인 토큰 (개발용)
const TEMP_LOGIN_TOKEN = 'YOUR_TEMPORARY_JWT_TOKEN_HERE_FOR_DEVELOPMENT_ONLY';
// 게스트 임시 키를 상수로 정의
const GUEST_PLANNING_KEY = 'guest-planning-key-12345'; // <-- 이 키를 사용합니다.

const AuthService = {
  // 사용자 로그인
  login: async (username, password) => {
    try {
      // API_BASE_URL 대신 상대 경로 '/api/users/login' 사용
      const response = await axios.post(`/api/users/login`, { username, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      // 백엔드 LoginFilter에서 Authorization 헤더로 토큰을 반환하므로, 이를 저장합니다.
      console.log(response.config.url)
      const token = response.headers.authorization; 
      if (token) {
        localStorage.setItem('userToken', token.replace('Bearer ', '')); // "Bearer " 접두사 제거 후 저장
        console.log('로그인 성공, 토큰 저장:', token);
        // 성공 시 구조화된 객체 반환
        return { success: true, message: response.data, token: token.replace('Bearer ', '') };
      } else {
        // 토큰이 없는 경우 (백엔드 로직에 따라 다름)
        return { success: false, message: "로그인 성공했으나 토큰을 받지 못했습니다." };
      }
    } catch (error) {
      console.error('로그인 실패:', error.response?.data || error.message);
      // 실패 시 구조화된 객체 반환
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // 사용자 등록 (회원가입)
  register: async (username, email, password) => {
    try {
      // API_BASE_URL 대신 상대 경로 '/api/users/register' 사용
      const response = await axios.post(`/api/users/register`, { username, email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      // 성공 시 구조화된 객체 반환
      return { success: true, message: response.data }; // "register OK" 또는 다른 성공 메시지
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data || error.message);
      // 실패 시 구조화된 객체 반환
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // 로그인 상태 확인
  checkLoginStatus: async () => {
    const token = localStorage.getItem('userToken');

    // 임시 로그인 토큰인 경우
    if (token && token === TEMP_LOGIN_TOKEN) {
      console.log('로그인 상태 확인: 임시 토큰으로 로그인됨 (개발용)');
      return { isLoggedIn: true, isGuest: false, message: '임시 토큰' };
    }

    // 게스트 키인 경우
    if (token && token === GUEST_PLANNING_KEY) { // <-- GUEST_PLANNING_KEY 사용
      console.log('로그인 상태 확인: 게스트 모드');
      return { isLoggedIn: false, isGuest: true, message: '게스트 모드' };
    }

    // 실제 JWT 토큰이 있는 경우
    if (token) {
      try {
        // API_BASE_URL 대신 상대 경로 '/api/users/logincheck' 사용
        console.log('로그인 상태 확인 API 호출 시도:', `/api/users/logincheck`);
        const response = await axios.get(`/api/users/logincheck`, {
          headers: {
            'Authorization': `Bearer ${token}`, // JWT 토큰 포함
            'Content-Type': 'application/json'
          }
        });
        console.log(response.data)
        if (response.data.status === 'users' ) {
          console.log('로그인 상태 확인: 사용자 로그인됨 (실제 토큰)');
          return { isLoggedIn: true, isGuest: false, message: '로그인됨' };
        } else {
          console.log('로그인 상태 확인: 유효하지 않은 토큰 응답');
          localStorage.removeItem('userToken'); // 유효하지 않은 토큰 제거
          return { isLoggedIn: false, isGuest: false, message: '유효하지 않은 토큰' };
        }
      } catch (error) {
        console.error('로그인 상태 확인 API 호출 오류 (AuthService):', error);
        localStorage.removeItem('userToken'); // 오류 발생 시 토큰 유효성 검사 실패로 간주하고 제거
        return { isLoggedIn: false, isGuest: false, message: 'API 호출 오류' };
      }
    }

    // 토큰이 없는 경우
    console.log('로그인 상태 확인: 토큰 없음');
    return { isLoggedIn: false, isGuest: false, message: '토큰 없음' };
  },

  // 로그아웃 요청
  logout: async () => {
    const token = localStorage.getItem('userToken');

    if (!token) {
      console.log('이미 로그아웃 상태');
      return { success: true, message: '이미 로그아웃 상태입니다.' };
    }

    // 임시 토큰 또는 게스트 키인 경우 실제 API 호출 없이 로컬 스토리지에서만 제거
    if (token === TEMP_LOGIN_TOKEN || token === GUEST_PLANNING_KEY) { // <-- GUEST_PLANNING_KEY 추가
      localStorage.removeItem('userToken');
      console.log('임시 토큰 또는 게스트 키 로그아웃 처리');
      return { success: true, message: '로그아웃 되었습니다.' };
    }

    try {
      console.log('로그아웃 API 호출 시도...');
      // API_BASE_URL 대신 상대 경로 '/logout' 사용 (vite.config.js에 프록시 설정 필요)
      const response = await axios.get(`/api/users/logout`, { // POST 요청으로 변경, 빈 본문 추가
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(response)
      if (response.status === 200 && response.data.status === 'success') {
        localStorage.removeItem('userToken');
        return { success: true, message: '로그아웃 되었습니다.' };
      } else {
        console.error('로그아웃 API 실패 응답:', response.data);
        return { success: false, message: response.data.message || '로그아웃에 실패했습니다. 다시 시도해주세요.' };
      }
    } catch (error) {
      console.error('로그아웃 API 호출 오류 (AuthService):', error, error.response);
      localStorage.removeItem('userToken');
      return { success: false, message: '로그아웃 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.' };
    }
  },

  // 게스트 임시 키 발급 함수 추가
  issueGuestKey: () => {
    localStorage.setItem('userToken', GUEST_PLANNING_KEY); // 게스트 키 저장
    console.log('게스트 임시 키 발급 완료:', GUEST_PLANNING_KEY);
    return GUEST_PLANNING_KEY;
  }
};

export default AuthService;
