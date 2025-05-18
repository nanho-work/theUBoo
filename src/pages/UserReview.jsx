// UserReview.jsx
import { useEffect, useState } from 'react';
import { fetchVisibleReviews } from '@/lib/firebase';
import ReviewModal from '@/components/ReviewModal';
import ImageCarousel from '@/components/ImageCarousel';

export default function UserReview() {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const PER_PAGE = 10;

    useEffect(() => {
        fetchVisibleReviews().then(setReviews);
    }, []);

    const sorted = [...reviews].sort((a, b) => b[1].createdAt - a[1].createdAt);
    const totalPages = Math.ceil(sorted.length / PER_PAGE);
    const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const chunked = Array.from({ length: Math.ceil(paginated.length / 2) }, (_, i) =>
        paginated.slice(i * 2, i * 2 + 2)
    );



    return (
        <div style={styles.wrapper}>
            <div style={styles.header}>
                <h3 style={styles.title}>📢 방문 후기</h3>
                <button onClick={() => setShowModal(true)} style={styles.button}>후기 등록</button>
            </div>

            {chunked.map((pair, idx) => (
                <div key={idx} style={styles.row}>
                    {pair.map(([id, r]) => (
                        <div key={id} style={styles.card}>
                            <p style={styles.nickname}>🧑 {r.nickname} | {new Date(r.createdAt).toLocaleDateString()}</p>
                            <p style={styles.content}>{r.content}</p>
                            <ImageCarousel images={r.images} />
                        </div>
                    ))}
                </div>
            ))}

            {totalPages > 1 && (
                <div style={styles.pagination}>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            style={{
                                ...styles.pageBtn,
                                background: page === i + 1 ? '#3498db' : '#fff',
                                color: page === i + 1 ? '#fff' : '#333',
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {showModal && (
                <ReviewModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        fetchVisibleReviews().then(setReviews); // ✅ 등록 후 목록 새로고침
                        setShowModal(false);                   // ✅ 모달 닫기
                    }}
                />
            )}
        </div>
    );
}

const styles = {
    wrapper: {
        maxWidth: 960,
        margin: '0 auto',
        padding: '2rem',
        fontFamily: '"Noto Sans KR", sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#3498db',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 6,
        fontSize: 16,
        cursor: 'pointer',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',   // 2등분 고정
        gap: 20,
        marginBottom: 32,
        alignItems: 'stretch',            // 높이 자동 맞춤
    },

    card: {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  border: '1px solid #ddd',
  borderRadius: 10,
  padding: 16,
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  height: '100%',
  boxSizing: 'border-box',

  // ✨ 추가
  maxHeight: '420px',
  overflow: 'auto',
},

    nickname: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    nickname: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    content: {
        marginBottom: 12,
        lineHeight: 1.6,
        color: '#555',
        whiteSpace: 'pre-line',
    },
    image: {
        width: '100%',
        borderRadius: 8,
        marginBottom: 8,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginTop: 40,
    },
    pageBtn: {
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '6px 12px',
        fontSize: 14,
        cursor: 'pointer',
        minWidth: 32,
    },
    
};