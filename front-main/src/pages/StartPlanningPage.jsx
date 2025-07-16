import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RegionModal from '../components/RegionModal';
import calendarIcon from '../assets/calendar.png';
import Logo from "../components/Logo";
import Calendar from '../components/Calendar';
import './StartPlanningPage.css';
import { MapPin } from 'lucide-react';
import moment from 'moment';
import CustomAlert from "../components/CustomAlert";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import customMarkerIconUrl from '../assets/logo_2.png';

import AuthService from '../services/AuthService';
import PlanningService from '../services/PlanningService';

const CustomMarkerIcon = L.icon({
  iconUrl: customMarkerIconUrl,
  iconRetinaUrl: customMarkerIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [32, 32],
  shadowAnchor: [16, 32]
});

L.Marker.prototype.options.icon = CustomMarkerIcon;

// 지도 클릭 이벤트 핸들러 컴포넌트
const MapClickHandler = ({ onSelectRegion, onCloseMap, onError }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);

      const result = await PlanningService.getRegionFromCoordinates(lat, lng);
      if (result.success) {
        onSelectRegion(result.address);
        onCloseMap();
      } else {
        onCloseMap();
        onError(result.message); // ❗ 부모에게 전달
      }
    },
  });
  return markerPosition ? <Marker position={markerPosition} /> : null;
};

const StartPlanningPage = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [people, setPeople] = useState('');
  const [transport, setTransport] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showFullCalendarModal, setShowFullCalendarModal] = useState(false);

  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [keywordOptions, setKeywordOptions] = useState([]);

  const [alertMessage, setAlertMessage] = useState(''); // ✅ 알림창 상태
  const [redirectPath, setRedirectPath] = useState(null); // ✅ 알림 후 이동 경로

  useEffect(() => {
    setKeywordOptions(PlanningService.getRandomKeywords());

    const checkLoginStatus = async () => {
      const result = await AuthService.checkLoginStatus();
      setIsLoggedInUser(result.isLoggedIn);
      setIsGuestUser(result.isGuest);
    };
    checkLoginStatus();
  }, []);

  const toggleKeyword = (word) => {
    setKeywords(prev =>
      prev.includes(word) ? prev.filter(k => k !== word) : [...prev, word]
    );
  };

  const handleSearch = () => {
    const formatDate = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

    const question = `${formatDate(startDate)}부터 ${formatDate(endDate)}까지 ${people || '여러'}명이 ${selectedRegion || '어딘가'}로 ${transport || '알맞은 교통수단으로'} 여행을 가려고 해. ${keywords.length > 0 ? `${keywords.join(', ')} 같은 키워드에 맞는 장소` : '좋은 여행지'}를 추천해줄래?`;
    navigate('/ai-chat', {
      state: { 
        question,
        startDate,
        endDate,
        selectedRegion,
       }
    });
  };

  const handleAuthClick = async () => {
    const result = await AuthService.logout();
    if (result.success) {
      setIsLoggedInUser(false);
      setIsGuestUser(false);
      setAlertMessage(result.message);
      setRedirectPath('/');
    } else {
      setAlertMessage(result.message);
    }
  };

  const handleCalendarDateSelect = (dateString) => {
    const clickedDate = moment(dateString).toDate();
    if (!startDate || clickedDate < startDate || (startDate && endDate)) {
      setStartDate(clickedDate);
      setEndDate(clickedDate);
    } else if (clickedDate >= startDate && clickedDate > endDate) {
      setEndDate(clickedDate);
    } else if (clickedDate >= startDate && clickedDate < endDate) {
      setStartDate(clickedDate);
      setEndDate(clickedDate);
    }
    setShowFullCalendarModal(false);
  };

  return (
    <div className="planning-wrapper">
      <div className="fixed-app-header">
        <div className="calendar-icon-wrapper" onClick={() => setShowFullCalendarModal(true)}>
          <img src={calendarIcon} alt="캘린더" className="calendar-icon" />
        </div>
        <Logo className="planning-logo" />
        <button className="login-button" onClick={handleAuthClick}>
          {isLoggedInUser || !isGuestUser ? '로그아웃' : '로그인'}
        </button>
      </div>

      <div className="form-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ marginBottom: '0' }}>지역</label>
          <MapPin size={20} className="map-pin-icon" onClick={() => setShowMap(true)} style={{ cursor: 'pointer' }} />
        </div>

        <button onClick={() => setShowRegionModal(true)} className="input-btn">
          {selectedRegion || '지역 선택하기'}
        </button>

        <label>일자</label>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              if (date > endDate) setEndDate(date);
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
          />
          ~
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
          />
        </div>

        <label>교통수단</label>
        <select value={transport} onChange={(e) => setTransport(e.target.value)} className="input-select">
          <option value="">선택</option>
          <option value="도보">도보</option>
          <option value="자동차">자동차</option>
          <option value="기차">기차</option>
          <option value="비행기">비행기</option>
        </select>

        <label>인원</label>
        <input
          type="number"
          min="1"
          step="1"
          value={people}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') return setPeople('');
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed >= 1) {
              setPeople(parsed.toString());
            }
          }}
          className="input-field"
          placeholder="1명"
        />

        <label>키워드</label>
        <div className="keyword-input">
          <input
            value={keywords.join(', ')}
            readOnly
            className="input-field"
            placeholder="선택한 키워드 표시"
          />
        </div>

        <div className="keyword-title">인기 키워드 ⭐</div>

        <div className="keyword-list">
          {keywordOptions.map((word) => (
            <button
              key={word}
              onClick={() => toggleKeyword(word)}
              className={`keyword-btn ${keywords.includes(word) ? 'selected' : ''}`}
            >
              {word}
            </button>
          ))}
        </div>

        <button className="shuffle-button" onClick={() => setKeywordOptions(PlanningService.getRandomKeywords())}>
          🔄 다른 키워드 보기
        </button>

        <button onClick={handleSearch} className="search-button">🔍검색</button>
      </div>

      {showMap && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <button className="map-modal-close-btn" onClick={() => setShowMap(false)}>X</button>
            <MapContainer center={[37.5665, 126.9780]} zoom={13} scrollWheelZoom={true} className="leaflet-map-container">
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler
                onSelectRegion={setSelectedRegion}
                onCloseMap={() => setShowMap(false)}
                onError={(msg) => setAlertMessage(msg)} // ✅ alert → CustomAlert
              />
            </MapContainer>
            <p className="map-instruction">지도에서 원하는 위치를 클릭하여 지역을 선택하세요.</p>
          </div>
        </div>
      )}

      {showRegionModal && (
        <RegionModal onClose={() => setShowRegionModal(false)} onSelect={(region) => {
          setSelectedRegion(region);
          setShowRegionModal(false);
        }} />
      )}

      {showFullCalendarModal && (
        <div className="full-calendar-modal-overlay">
          <div className="full-calendar-modal-content">
            <button className="full-calendar-modal-close-btn" onClick={() => setShowFullCalendarModal(false)}>X</button>
            <h2 className="full-calendar-modal-title">날짜 선택</h2>
            <div className="full-calendar-display-wrapper">
              <Calendar onDateSelect={(dateRange) => {
                setStartDate(dateRange.start);
                setEndDate(dateRange.end);
                setShowFullCalendarModal(false);
              }} />
            </div>
          </div>
        </div>
      )}

      {/* 💡 커스텀 알림창 */}
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

export default StartPlanningPage;
