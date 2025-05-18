import { useState } from 'react';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase'; // 이미 초기화된 auth 사용

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('adminToken', 'true');
            navigate('/admin', { replace: true });
        } catch (err) {
            setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#f4f4f4',
            fontFamily: 'Noto Sans KR'
        }}>
            <div style={{
                width: 360,
                padding: 32,
                border: '1px solid #ccc',
                borderRadius: 8,
                backgroundColor: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
                <h2 style={{ marginBottom: 24 }}>🔐 관리자 로그인</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            boxSizing: 'border-box',
                            marginBottom: 12,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                        }}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            boxSizing: 'border-box',
                            marginBottom: 12,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            boxSizing: 'border-box',
                            background: '#3498db',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
}