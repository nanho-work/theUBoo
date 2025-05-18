// ✅ 외부 라이브러리
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './App.css';

// ✅ 관리자 관련
import AdminPage from './pages/AdminPage';
import AdminLogin from './admin/AdminLogin';
import ProtectedAdminRoute from './admin/ProtectedAdminRoute';

// ✅ 공통 레이아웃
import UserLayout from './components/UserLayout';

// ✅ 사용자 페이지
import Home from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import UserReview from './pages/UserReview';
import UserEvent from './pages/UserEvent';
import EventDetail from './components/EventDetail';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 사용자용 루트 페이지 */}
        <Route path="/" element={<UserLayout><Home /></UserLayout>} />
        <Route path="/menu" element={<UserLayout><MenuPage /></UserLayout>} />
        <Route path="/review" element={<UserLayout><UserReview /></UserLayout>} />
        <Route path="/event" element={<UserLayout><UserEvent /></UserLayout>} />
        <Route path="/event/:eventId" element={<UserLayout><EventDetail /></UserLayout>} />
        
        {/* 관리자 로그인 */}
        <Route path="/admin-login" element={<AdminLogin />} />


        {/* 관리자 전용 라우팅 */}
        <Route path="/admin/*" element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;