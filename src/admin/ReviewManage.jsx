import { useEffect, useState } from 'react';
import { fetchAllReviews, hideReview, unhideReview } from '@/lib/firebase';

export default function ReviewManage() {
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    fetchAllReviews().then(setReviews);
  }, []);

  const reload = () => fetchAllReviews().then(setReviews);

  const handleHide = async (id) => {
    if (window.confirm('정말 숨기시겠습니까?')) {
      await hideReview(id);
      reload();
    }
  };

  const handleUnhide = async (id) => {
    if (window.confirm('이 후기를 다시 공개할까요?')) {
      await unhideReview(id);
      reload();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>👨‍💻 방문 후기 관리</h2>
      {Object.entries(reviews).map(([id, r]) => (
        <div
          key={id}
          style={{
            borderBottom: '1px solid #ddd',
            padding: 16,
            marginBottom: 24,
            background: r.isVisible ? '#fff' : '#f8f8f8',
          }}
        >
          <div><strong>{r.nickname}</strong> / 비밀번호: {r.password}</div>
          <div style={{ margin: '12px 0' }}>{r.content}</div>

          {/* 이미지 여러 장 */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {r.images?.map((url, idx) => (
              <img key={idx} src={url} alt="리뷰 이미지" style={{ width: 120, borderRadius: 6 }} />
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            {r.isVisible ? (
              <button
                onClick={() => handleHide(id)}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                숨기기
              </button>
            ) : (
              <button
                onClick={() => handleUnhide(id)}
                style={{
                  background: '#2ecc71',
                  color: 'white',
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                다시 공개
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}