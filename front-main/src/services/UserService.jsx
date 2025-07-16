import axios from 'axios';

// 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요! 실제 url로 변경
const API_BASE_URL = 'http://localhost:8080';

const UserService = {
  // 사용자 프로필 정보 조회
  fetchUserProfile: async (token) => {
    try {
      console.log('UserService: 사용자 프로필 정보 조회 API 호출 시도');
      // 백엔드 logincheck API가 사용자 정보(username, email)를 반환한다고 가정합니다.
      // 만약 그렇지 않다면, 별도의 /users/profile 같은 API가 필요합니다.
      const response = await axios.get(`${API_BASE_URL}/users/logincheck`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'users' && response.data.code === 200 && response.data.login === true) {
        // 백엔드 응답 구조에 따라 userData를 추출해야 합니다.
        // 현재 명세에는 username, email 필드가 logincheck 응답에 명시되어 있지 않아 임시로 가정을 추가합니다.
        // 예를 들어, 응답이 { status: 'users', code: 200, login: true, data: { username: '...', email: '...' } } 형태라면
        // const userData = response.data.data; 로 변경해야 합니다.
        const userData = response.data.user || { username: '불러오기 실패', email: '불러오기 실패' }; // 임시 가정
        console.log('UserService: 사용자 프로필 정보 로딩 성공', userData);
        return { success: true, user: userData };
      } else {
        console.error('UserService: 사용자 프로필 로딩 실패 응답:', response.data);
        return { success: false, message: response.data.message || '사용자 정보를 불러올 수 없습니다.' };
      }
    } catch (error) {
      console.error('UserService: 사용자 프로필 조회 API 호출 오류:', error);
      if (error.response) {
        return { success: false, message: error.response.data.message || '서버 오류로 사용자 정보를 불러오지 못했습니다.' };
      } else if (error.request) {
        return { success: false, message: '네트워크 오류로 사용자 정보를 불러오지 못했습니다.' };
      } else {
        return { success: false, message: '사용자 정보를 불러오는 중 예상치 못한 오류가 발생했습니다.' };
      }
    }
  },

  // 사용자 프로필 정보 업데이트
  updateUserProfile: async (token, username, email, password) => {
    try {
      const updatePayload = {
        username: username,
        email: email,
      };
      if (password) { // 비밀번호 필드가 비어있지 않은 경우에만 추가
        updatePayload.password = password;
      }

      console.log('UserService: 사용자 정보 업데이트 API 호출 시도:', `${API_BASE_URL}/users/edit_info`, updatePayload);
      const response = await axios.put(`${API_BASE_URL}/users/edit_info`, updatePayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success' && response.data.code === 200) {
        return { success: true, message: '회원 정보가 성공적으로 업데이트되었습니다!' };
      } else {
        console.error('UserService: 회원 정보 업데이트 실패 응답:', response.data);
        return { success: false, message: response.data.message || '알 수 없는 오류' };
      }
    } catch (error) {
      console.error('UserService: 프로필 업데이트 실패:', error);
      if (error.response) {
        return { success: false, message: error.response.data.message || '서버 오류가 발생했습니다.' };
      } else if (error.request) {
        return { success: false, message: '네트워크 오류가 발생했습니다.' };
      } else {
        return { success: false, message: '요청을 보내는 중 오류가 발생했습니다.' };
      }
    }
  }
};

export default UserService;