// 백엔드 API의 기본 URL을 여기에 설정해주세요!
// 이 변수는 이제 직접적인 API 호출에 사용되지 않고, 프록시 설정의 가이드라인으로만 남겨둡니다.
// 실제 요청은 Vite 프록시를 통해 상대 경로로 이루어집니다.
let cachedChatId = null;

const AIService = {
  // 초기 AI 응답을 제공하는 함수 (제거됨)
  // 이 함수는 AIChatPage에서 초기 UI를 구성할 때 사용될 수 있는 모의 응답을 반환합니다.
  // 실제 백엔드 AI 응답은 sendMessageToAI를 통해 처리됩니다.
  // getInitialAIResponse: (question) => {
  //   if (question.includes('여행') || question.includes('계획')) {
  //     return "안녕하세요! 어떤 여행을 계획하고 계신가요? 가고 싶은 장소나 테마를 알려주시면 추천해 드릴게요.";
  //   } else if (question.includes('날씨')) {
  //     return "어느 지역의 날씨가 궁금하신가요? 지역을 알려주시면 날씨 정보를 찾아드릴게요.";
  //   } else {
  //     return "궁금한 점을 자세히 알려주세요. 제가 도와드릴 수 있는지 확인해볼게요!";
  //   }
  // },

  // AI 응답 텍스트에서 장소를 추출하는 함수 (현재는 모의 데이터)
  extractPlaces: (aiResponseText) => {
    // 실제 AI 응답에서 장소를 파싱하는 복잡한 로직이 필요합니다.
    // 여기서는 간단한 예시를 위해 특정 키워드를 포함하는 경우에만 장소를 반환합니다.
    if (aiResponseText.includes('추천해 드릴게요')) {
      return ['제주도', '부산', '강릉', '서울'];
    }
    return [];
  },

  // 💡 새로운 채팅 세션을 생성하는 함수 추가
  createChatSession: async () => {
    if (cachedChatId) return cachedChatId;
    const token = localStorage.getItem('userToken');

    if (!token) {
      console.error('인증 토큰이 없습니다. 로그인 후 이용해주세요.');
      throw new Error('인증 토큰이 없습니다. 로그인 후 이용해주세요.');
    }

    try {
      const response = await fetch('/chat/createchat', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('채팅 세션 생성 API 호출 실패:', response.status, errorData);
        throw new Error("채팅 세션 생성에 문제가 생겼습니다: " + (errorData.message || response.statusText));
      }

      const data = await response.json();
      console.log('새 채팅 세션 생성 응답:', data);
      return data.chat_id; // 백엔드 응답에서 chat_id를 반환한다고 가정
    } catch (error) {
      console.error('채팅 세션 생성 중 네트워크 오류:', error);
      throw error; // 에러를 다시 던져 AIChatPage에서 처리할 수 있도록 합니다.
    }
  },

  // 선택된 장소에 대한 AI 경로 추천을 받는 함수 (POST /chat/suggest)
  // serverChat 함수 구조를 참고하여 chat_uid 및 toolList 파라미터 추가
  getRouteFromAI: async (selectedPlaces, chat_uid = null) => {
    const query = `선택된 장소: ${selectedPlaces.join(', ')}에 대한 여행 경로를 추천해줘.`;
    const token = localStorage.getItem('userToken'); // 로컬 스토리지에서 토큰 가져오기

    if (!token) {
      console.error('인증 토큰이 없습니다. 로그인 후 이용해주세요.');
      return '로그인 후 이용 가능한 기능입니다. 먼저 로그인해주세요.';
    }

    try {
      const response = await fetch('/chat/suggest', { // 백엔드 엔드포인트
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // API 명세에 따른 Authorization 헤더
        },
        body: JSON.stringify({
          query: query, // serverChat의 'q' 파라미터와 일치
          chat_id: chat_uid, // chat_uid 추가
        })
      });

      if (!response.ok) {
        // HTTP 상태 코드가 2xx 범위가 아닐 경우 에러 처리
        const errorData = await response.json();
        console.error('경로 추천 API 호출 실패:', response.status, errorData);
        throw new Error("경로 추천 통신에 문제가 생겼습니다: " + (errorData.message || response.statusText));
      }
      
      const data = await response.json(); 
      console.log(data)
      // 백엔드 응답 형식에 따라 적절히 파싱하여 반환합니다.
      // 예시: 백엔드가 { "response": "추천 경로입니다..." } 형태로 준다고 가정
      return data.response || "경로 추천을 받아왔지만 내용이 없습니다.";

    } catch (error) {
      console.error('경로 추천 API 호출 중 네트워크 오류:', error);
      return '경로 추천 중 네트워크 오류가 발생했습니다. 다시 시도해주세요.';
    }
  },

  // 일반적인 사용자 메시지를 AI에 보내고 응답을 받는 함수 (serverChat 함수 구조 반영)
  // onUpdateCallback: AI 응답의 새 청크가 도착할 때마다 호출될 콜백 함수
  sendMessageToAI: async (userMessage, chat_uid, onUpdateCallback) => { 
    const token = localStorage.getItem('userToken');

    console.log(token);
    console.log(chat_uid);

    if (!token) {
      console.error('인증 토큰이 없습니다. 로그인 후 이용해주세요.');
      return '로그인 후 이용 가능한 기능입니다. 먼저 로그인해주세요.';
    }

    try {
      const response = await fetch('/chat/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: userMessage,
          chat_id: chat_uid,
        }),
      });

      console.log(userMessage, chat_uid);

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`서버 응답 오류: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // 스트리밍된 내용 출력 (이 부분은 디버깅용으로 유지)
          console.log('🔹 Chunk:', chunk); 
          
          // 청크를 라인별로 분리하여 처리
          chunk.split('\n').forEach(line => {
            const trimmedLine = line.trim(); // 각 라인의 앞뒤 공백 제거

            // [DONE] 메시지 처리
            if (trimmedLine === 'data: [DONE]') { // 정확히 'data: [DONE]'인 경우
              done = true;
              return; // 이 라인 처리를 중단하고 다음 라인으로 넘어감
            }

            let contentToProcess = '';
            if (trimmedLine.startsWith('data: ')) {
              // 'data:' 접두사가 있는 경우 제거
              contentToProcess = trimmedLine.substring('data: '.length);
            } else {
              // 'data:' 접두사가 없는 경우, 라인 전체를 내용으로 간주
              contentToProcess = trimmedLine;
            }

            // 내용이 비어있지 않으면 처리
            if (contentToProcess) {
              result += contentToProcess;
              // 여기서 실시간으로 UI에 추가하기 위해 onUpdateCallback을 호출합니다.
              if (onUpdateCallback) {
                onUpdateCallback(contentToProcess);
              }
            }
          });
        }
      }

      return result; // 최종 완성된 응답 반환

    } catch (error) {
      console.error('AI 응답 생성 중 오류:', error);
      return 'AI 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
    }
  },

  savePlan: async (title, aiChatContent, startDate, endDate, chat_id = null, guestKey = null) => {
    try {
      const token = localStorage.getItem('userToken');
      const url = guestKey ? `/plans/save?guestKey=${guestKey}` : `/plans/save`;

      const payload = {
        title,
        aiChatContent,
        start: `${startDate}T00:00:00`,
        end: `${endDate}T23:59:59`,
        chatId: chat_id
      };

      console.log('📤 저장 요청 payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('일정 저장 실패:', data);
        throw new Error(data.message || '일정 저장 중 오류 발생!');
      }

      console.log('🟢 일정 저장 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 일정 저장 오류:', error);
      throw error;
    }
  },

  getChatHistory: async (chatId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`/chat/get_chat/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`채팅 히스토리 불러오기 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 불러온 채팅 히스토리:', data);
      return data; // [{ role: 'user', content: '...' }, { role: 'ai', content: '...' }]
    } catch (error) {
      console.error('❌ 채팅 히스토리 불러오기 오류:', error);
      throw error;
    }
  }
};

export default AIService;