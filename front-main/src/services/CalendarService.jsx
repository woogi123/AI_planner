// src/services/CalendarService.js

const CalendarService = {
  getPlans: async () => {
    const token = localStorage.getItem("userToken");
    const response = await fetch("/plans/get_plans", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('계획 불러오기 API 호출 실패:', response.status, errorText);
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        console.warn('getPlans 응답이 JSON 형식이 아닙니다. 원본 텍스트:', errorText);
      }
      throw new Error(`계획 불러오기 통신에 문제가 생겼습니다: ${errorData.message || errorText || response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (response.status === 204 || (contentLength === '0' && contentType === null)) {
      console.warn('getPlans: 서버가 204 No Content 또는 빈 응답을 반환했습니다.');
      return []; // 빈 배열 반환
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        console.error('getPlans 응답 JSON 파싱 오류:', jsonError);
        console.warn('getPlans 응답 본문 (파싱 실패):', await response.text());
        throw new Error('서버 응답이 유효한 JSON 형식이 아닙니다.');
      }
    } else {
      const textData = await response.text();
      console.warn('getPlans 응답이 JSON이 아니지만 성공했습니다:', textData);
      return []; // 빈 배열 또는 적절한 기본값 반환
    }
  },
  
  getPlanDetails: async (id) => {
    const token = localStorage.getItem("userToken");

    const response = await fetch(`/plans/get_detail_plans?plandetails=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('세부 계획 불러오기 API 호출 실패:', response.status, errorText);
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        console.warn('getPlanDetails 응답이 JSON 형식이 아닙니다. 원본 텍스트:', errorText);
      }
      throw new Error(`세부 계획 불러오기 통신에 문제가 생겼습니다: ${errorData.message || errorText || response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    if (response.status === 204 || (contentLength === '0' && contentType === null)) {
      console.warn('getPlanDetails: 서버가 204 No Content 또는 빈 응답을 반환했습니다.');
      return {}; // 빈 객체 반환
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.json();
        console.log("service data:", data);
        return data;
      } catch (jsonError) {
        console.error('getPlanDetails 응답 JSON 파싱 오류:', jsonError);
        console.warn('getPlanDetails 응답 본문 (파싱 실패):', await response.text());
        throw new Error('서버 응답이 유효한 JSON 형식이 아닙니다.');
      }
    } else {
      const textData = await response.text();
      console.warn('getPlanDetails 응답이 JSON이 아니지만 성공했습니다:', textData);
      return {}; // 빈 객체 또는 적절한 기본값 반환
    }
  },

  deletePlan: async (planId) => {
    const token = localStorage.getItem('userToken');

    const id = Number(planId);

    const response = await fetch(`/plans/delete/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(text || '삭제 실패!');
    }

    return text ? JSON.parse(text) : { status: 'success' };
  },
};

export default CalendarService;