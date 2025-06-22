// src/admin/EventManage.jsx
import { useEffect, useState } from 'react';
import { fetchEvents, getEventDetail, deleteEvent } from '@/lib/firebase';
import EventRegister from './EventRegister';
import EventDetailModal from '@/components/EventDetailModal';

export default function EventManage() {
    const [events, setEvents] = useState([]);
    const [viewId, setViewId] = useState(null); // 상세보기 ID
    const [detail, setDetail] = useState(null); // 상세 데이터
    const [showRegister, setShowRegister] = useState(false); // 등록 모달

    useEffect(() => {
        fetchEvents().then(setEvents);
    }, []);

    const handleRegistered = async () => {
        setShowRegister(false); // 등록 모달 닫기
        const updated = await fetchEvents();
        setEvents(updated);
    };

    const handleView = async (id) => {
        const data = await getEventDetail(id);
        setDetail(data);
        setViewId(id);
    };

    const handleCloseDetail = () => {
        setDetail(null);
        setViewId(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        await deleteEvent(id);
        const updated = await fetchEvents();
        setEvents(updated);
    };

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 16 }}>📌 이벤트 관리</h2>

            <div style={{ textAlign: 'right', marginBottom: 12 }}>
                <button onClick={() => setShowRegister(true)} style={styles.writeBtn}>글쓰기</button>
            </div>

            <h3 style={{ marginBottom: 12 }}>📋 이벤트 목록</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>순번</th>
                        <th style={styles.th}>제목</th>
                        <th style={styles.th}>등록자</th>
                        <th style={styles.th}>등록일</th>
                        <th style={styles.th}>조회수</th>
                        <th style={styles.th}>상세</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map(([id, ev], i) => (
                        <tr key={id}>
                            <td style={styles.td}>{events.length - i}</td>
                            <td style={styles.td}>{ev.title}</td>
                            <td style={styles.td}>관리자</td>
                            <td style={styles.td}>{new Date(ev.createdAt).toLocaleDateString()}</td>
                            <td style={styles.td}>{ev.views || 0}</td>
                            <td style={styles.td}>
                                <button onClick={() => handleView(id)} style={styles.viewBtn}>보기</button>
                                <button onClick={() => handleDelete(id)} style={styles.deleteBtn}>삭제</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 등록 모달 */}
            {showRegister && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <EventRegister onRegistered={handleRegistered} />
                        <button onClick={() => setShowRegister(false)} style={styles.closeBtn}>닫기</button>
                    </div>
                </div>
            )}

            {/* 상세 모달 */}
            {viewId && detail && (
                <EventDetailModal event={detail} onClose={handleCloseDetail} />
            )}
        </div>
    );
}

const styles = {
    writeBtn: {
        backgroundColor: '#3498db',
        color: '#fff',
        padding: '6px 12px',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: '"Noto Sans KR", sans-serif',
    },
    viewBtn: {
        background: '#3498db',
        color: '#fff',
        padding: '4px 8px',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
    },
    deleteBtn: {
        background: '#e74c3c',
        color: '#fff',
        padding: '4px 8px',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        marginLeft: 8,
    },
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 9999,
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        width: '100%',
        maxWidth: 560,
        position: 'relative',
    },
    closeBtn: {
        marginTop: 16,
        backgroundColor: '#888',
        border: 'none',
        borderRadius: 6,
        padding: 10,
        cursor: 'pointer',
        width: '100%',
    },

    th: {
        textAlign: 'left',
        padding: '8px 12px',
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        verticalAlign: 'middle',
    },
};