import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // React Router 임포트
import AuthPage from './pages/AuthPage'; 
import MainPage from './pages/MainPage'; 
import StartPlanningPage from './pages/StartPlanningPage'; 
import AIChatPage from './pages/AIChatPage';
import MyPage from './pages/MyPage'; // MyPage 컴포넌트 임포트

function App() {
  return (
    <Router> {/* BrowserRouter로 전체 앱을 감싸야 합니다! */}
      <Routes> {/* 모든 라우트 정의는 Routes 안에 있어야 합니다. */}
        {/* '/main' 경로는 MainPage */}
        <Route path="/" element={<MainPage />} />
        {/* 루트 경로 '/'는 AuthPage */}
        <Route path="/api/users/login" element={<AuthPage />} /> 
        {/* '/start-planning-page' 경로는 StartPlanningPage */}
        <Route path="/start-planning" element={<StartPlanningPage />} />
        {/* '/ai-chat' 경로는 AIChatPage */}
        <Route path="/ai-chat" element={<AIChatPage />} />
        {/* '/mypage' 경로는 MyPage 추가 */}
        <Route path="/mypage" element={<MyPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
