// src/components/AdminHeader.jsx
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

export default function AdminHeader({ tab, setTab }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(getAuth());
        localStorage.removeItem('adminToken');
        navigate('/admin-login');
    };

    const tabStyle = (active) => ({
        background: active ? '#3498db' : 'transparent',
        color: active ? '#fff' : '#ecf0f1',
        border: 'none',
        padding: '8px 16px',
        margin: '0 6px',
        fontSize: '15px',
        borderRadius: 6,
        cursor: 'pointer',
    });

    return (
        <header style={{
            backgroundColor: '#2c3e50',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="로고" style={{ height: 28 }} />
                <strong style={{ fontSize: '18px', color: 'white' }}>TheUboo Admin</strong>
            </div>
            <nav>
                <button onClick={() => setTab('home')} style={tabStyle(tab === 'home')}>홈화면 관리</button>
                <button onClick={() => setTab('menu')} style={tabStyle(tab === 'menu')}>메뉴 관리</button>
                <button onClick={() => setTab('review')} style={tabStyle(tab === 'review')}>리뷰 관리</button>
                <button onClick={() => setTab('event')} style={tabStyle(tab === 'event')}>이벤트 관리</button>
            </nav>
            <button
                onClick={handleLogout}
                style={{
                    background: '#e74c3c',
                    color: 'white',
                    padding: '8px 14px',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                }}
            >
                로그아웃
            </button>
        </header>
    );
}