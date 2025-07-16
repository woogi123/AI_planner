import axios from 'axios';

// 🚨 백엔드 API의 기본 URL을 여기에 설정해주세요! (필요하다면)
// 이 서비스 파일에서는 현재 직접적인 백엔드 호출이 없으므로 필요 없을 수 있습니다.
// 하지만 향후 여행 계획 생성 또는 저장 API가 추가될 경우를 대비하여 넣어둡니다.
const API_BASE_URL = 'http://localhost:8080';

const PlanningService = {
  // 역지오코딩을 통해 위경도에서 주소 가져오기
  getRegionFromCoordinates: async (lat, lng) => {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    try {
      const response = await fetch(nominatimUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      let address = "주소를 찾을 수 없습니다.";
      if (data && data.address) {
        const addr = data.address;
        address = [
          addr.country,
          addr.province,
          addr.city || addr.town || addr.village,
          addr.road,
          addr.house_number
        ].filter(Boolean).join(' ').trim();

        if (!address) {
          address = data.display_name;
        }
      }
      return { success: true, address: address };
    } catch (error) {
      console.error("PlanningService: 역지오코딩 오류:", error);
      return { success: false, message: "주소를 가져오는 데 실패했습니다. 다시 시도해주세요." };
    }
  },

  // 모든 키워드 옵션 제공 (프론트엔드에서 고정값으로 관리)
  getAllKeywordOptions: () => {
    return [
      '문화시설',
      '축제공연행사',
      '여행코스',
      '레포츠',
      '숙박',
      '쇼핑',
      '음식점',
    ];
  },

  // 렌더링에 사용할 랜덤 키워드 8개 선택
  getRandomKeywords: () => {
    const allOptions = PlanningService.getAllKeywordOptions();
    const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  },

  // (선택 사항) 만약 백엔드에 여행 계획을 저장하는 API가 있다면 여기에 추가
  // createTravelPlan: async (planData, token) => {
  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/plans`, planData, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     return { success: false, message: error.message };
  //   }
  // }
};

export default PlanningService;