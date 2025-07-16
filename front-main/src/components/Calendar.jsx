import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calendar.css";
import CalendarService from "../services/CalendarService";
import CustomAlert from "../components/CustomAlert";
import { addDays, format } from "date-fns";
import * as dateFnsTz from "date-fns-tz";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import { useNavigate } from 'react-router-dom';

const Calendar = ({ onNavigateToAIChat, isLoggedIn }) => {
  const { utcToZonedTime } = dateFnsTz;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [chatContent, setChatContent] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState([]);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          setAlertMessage("로그인이 필요합니다.");
          return;
        }
        const data = await CalendarService.getPlans(token);
        console.log("불러온 원본 계획 데이터:", data);
        console.log("계획 개수:", data.length);

        // FullCalendar 이벤트를 생성합니다.
        const formattedEvents = data.map((plan) => {
          // 백엔드에서 받은 날짜 문자열을 직접 사용
          // start: "2025-07-14T00:00:00" -> "2025-07-14"
          // end: "2025-07-21T23:59:59" -> "2025-07-22" (FullCalendar는 exclusive end)

          const startDateStr = plan.start.split("T")[0]; // "2025-07-14"
          const endDateStr = plan.end.split("T")[0]; // "2025-07-21"

          // 종료일에 하루 더하기 (FullCalendar의 exclusive end 때문)
          const endDate = new Date(endDateStr + "T00:00:00");
          endDate.setDate(endDate.getDate() + 1);

          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          const exclusiveEndStr = formatDate(endDate);

          console.log(
            `Plan ${plan.id}: ${startDateStr} ~ ${endDateStr} (FullCalendar: ${startDateStr} ~ ${exclusiveEndStr})`
          );

          return {
            id: plan.id,
            title: plan.title,
            start: startDateStr,
            end: exclusiveEndStr,
            allDay: true,
            extendedProps: {
              description: plan.message || "",
              originalStart: plan.start,
              originalEnd: plan.end,
            },
          };
        });

        setPlans(formattedEvents);
        console.log("FullCalendar에 전달될 형식화된 이벤트:", formattedEvents);
      } catch (error) {
        console.error("여행 계획을 불러오는 데 실패했습니다:", error);
        setAlertMessage("여행 계획을 불러오는 데 실패했습니다.");
      }
    };

    fetchPlans();
  }, []);

  const handleSaveAsPDF = () => {
    const element = document.querySelector(".modal-content");
    if (element) {
      html2pdf()
        .from(element)
        .set({
          margin: 1,
          filename: `일정_${selectedDate}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save();
    }
  };

  const fetchPlanDetails = async (planId) => {
    try {
      const data = await CalendarService.getPlanDetails(planId);
      setSelectedPlan({
        id: data.id,
        title: data.title,
        start: data.start,
        end: data.end,
        chatId: data.chatId,
        extendedProps: {
          description: data.message,
          originalStart: data.start,
          originalEnd: data.end,
        },
      });
      console.log("data:", data);
      setPlanDetails(data.aiChatContent || []);
    } catch (err) {
      console.error("세부 일정 로딩 실패:", err);
      setSelectedPlan(null);
    }
  };

  const handleDateClick = async (info) => {
    setSelectedDate(info.dateStr);
    const aiChat = await fetchAIChatContent(info.dateStr);
    setChatContent(aiChat);

    // 클릭된 날짜에 해당하는 계획을 찾습니다.
    const clickedDateStr = info.dateStr; // "2025-07-14" 형식
    const plansOnDate = plans.filter((plan) => {
      // plan.start: "2025-07-14", plan.end: "2025-07-22" (exclusive)
      const startDateStr = plan.start;
      const endDateStr = plan.end;

      // 문자열 비교로 간단하게 처리
      // 클릭된 날짜가 시작일 이상이고 종료일 미만인지 확인
      return clickedDateStr >= startDateStr && clickedDateStr < endDateStr;
    });

    if (plansOnDate.length > 0) {
      fetchPlanDetails(plansOnDate[0].id);
    } else {
      setSelectedPlan(null);
      setPlanDetails([]);
      if (aiChat === "선택된 날짜에 AI 채팅 기록이 없습니다.") {
        setChatContent(
          `선택된 날짜 (${info.dateStr})에 새로운 여행 계획을 추가하시겠습니까?`
        );
      }
    }
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    const clickedPlanId = info.event.id;
    if (clickedPlanId) {
      setSelectedDate(info.event.startStr);
      fetchPlanDetails(clickedPlanId);
    }
    setIsModalOpen(true);
  };

  const handleChatHistoryClick = (chatId) => {
    if (!chatId) {
      setAlertMessage("저장된 채팅이 없어요! 💬");
      return;
    }

    navigate('/ai-chat', {
      state: { chatId }, // ✅ ChatHistoryPage로 이동!
    });
  };

  const fetchAIChatContent = async (date) => {
    const mockChatData = {
      "2025-07-09": "2025년 7월 9일에는 중요한 미팅이 있었습니다...",
      "2025-07-15": "2025년 7월 15일은 친구와 영화 본 날이에요!",
      "2025-07-20": "2025년 7월 20일은 기타 강습을 시작한 날이에요~",
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockChatData[date] || "선택된 날짜에 AI 채팅 기록이 없습니다.");
      }, 300);
    });
  };

  const handleSaveAsJPG = async () => {
    const element = document.querySelector(".modal-content");
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `일정_${selectedDate}.jpg`;
      link.href = canvas.toDataURL("image/jpeg");
      link.click();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate("");
    setChatContent("");
    setSelectedPlan(null);
    setPlanDetails([]);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      setTimeout(() => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          menuRef.current &&
          !menuRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false); // ✅ 진짜 바깥 클릭만 감지
        }
      }, 100); // 약간의 딜레이를 줘야 제대로 인식돼!
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleDeletePlan = async (id) => {
    try {
      const originalPlanIdToDelete = selectedPlan?.id;
      if (!originalPlanIdToDelete) {
        setAlertMessage("삭제할 일정을 찾을 수 없습니다.");
        return;
      }

      const result = await CalendarService.deletePlan(originalPlanIdToDelete);
      if (result.status === "success") {
        setAlertMessage("삭제 완료!");
        closeModal();

        // 삭제 후 계획 목록 다시 로드
        const token = localStorage.getItem("userToken");
        const data = await CalendarService.getPlans(token);

        const formattedEvents = data.map((plan) => {
          const startDateStr = plan.start.split("T")[0];
          const endDateStr = plan.end.split("T")[0];

          const endDate = new Date(endDateStr + "T00:00:00");
          endDate.setDate(endDate.getDate() + 1);

          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          return {
            id: plan.id,
            title: plan.title,
            start: startDateStr,
            end: formatDate(endDate),
            allDay: true,
            extendedProps: {
              description: plan.message || "",
              originalStart: plan.start,
              originalEnd: plan.end,
            },
          };
        });

        setPlans(formattedEvents);
      } else {
        setAlertMessage("삭제 실패: " + result.message);
      }
    } catch (err) {
      console.error("삭제 중 에러:", err);
      setAlertMessage("삭제 중 오류가 발생했어요 😥");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const formatDateTimeWithTimezone = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const zonedDate = utcToZonedTime(date, "Asia/Seoul");
      return format(zonedDate, "yyyy-MM-dd HH:mm", { timeZone: "Asia/Seoul" });
    } catch (e) {
      console.error("날짜/시간 포맷팅 오류:", e);
      return dateStr.split("T")[0];
    }
  };

  return (
    <div className="full-calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        editable={true}
        selectable={true}
        locale="ko"
        height="auto"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        events={plans}
        displayEventTime={false}
        eventDisplay="block"
        dayMaxEvents={false}
        eventClassNames="custom-event"
        eventDidMount={(info) => {
          console.log(
            "Event mounted:",
            info.event.title,
            info.event.start,
            info.event.end
          );
        }}
      />

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedPlan ? selectedPlan.title : "새로운 여행 계획"}</h2>
            {selectedDate && (
              <p className="modal-date-display">{formatDate(selectedDate)}</p>
            )}

            <div className="modal-chat-content-area">
              {selectedPlan ? (
                <>
                  <p>
                    기간:{" "}
                    {formatDate(selectedPlan.extendedProps?.originalStart)} ~{" "}
                    {formatDate(selectedPlan.extendedProps?.originalEnd)}
                  </p>
                  <p>
                    설명:{" "}
                    {selectedPlan.extendedProps?.description ||
                      "설명이 없습니다."}
                  </p>
                  <h3>세부 일정</h3>
                  {planDetails.length > 0 ? (
                    <p>{planDetails}</p>
                  ) : (
                    <p>등록된 세부 일정이 없습니다.</p>
                  )}
                </>
              ) : (
                <p>{chatContent}</p>
              )}
            </div>

            <div className="action-dropdown-container" ref={dropdownRef}>
              <button
                className="action-dropdown-button"
                onClick={toggleDropdown}
              >
                더보기
              </button>
              {isDropdownOpen && (
                <ul className="action-dropdown-menu show-dropdown" ref={menuRef}>
                  <li onClick={() => handleChatHistoryClick(selectedPlan.chatId)}>
                    <span className="bullet-point"></span> 채팅 내역 보기
                  </li>
                  <li onClick={handleSaveAsJPG}>
                    <span className="bullet-point"></span> JPG 저장하기
                  </li>
                  <li onClick={handleSaveAsPDF}>
                    <span className="bullet-point"></span> PDF 저장하기
                  </li>
                  <li
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmAlert(true);
                    }}
                    style={{ color: "red", fontWeight: "bold" }}
                  >
                    <span className="bullet-point"></span> 일정 삭제하기
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmAlert && (
        <CustomAlert
          message="정말 이 일정을 삭제할까요? 🗑️"
          onClose={() => {
            handleDeletePlan(selectedPlan?.id);
            setShowConfirmAlert(false);
          }}
          onCancel={() => setShowConfirmAlert(false)}
        />
      )}

      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      )}
    </div>
  );
};

export default Calendar;