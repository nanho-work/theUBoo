import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventDetail, incrementEventViews } from '@/lib/firebase';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (eventId) {
      getEventDetail(eventId).then((data) => {
        setEvent(data);
      });
      incrementEventViews(eventId); // 조회수 증가
    }
  }, [eventId]);

  if (!event) return <p style={{ padding: 24 }}>불러오는 중...</p>;

  return (
    <div style={styles.wrapper}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>← 목록으로</button>

      <h2 style={styles.title}>{event.title}</h2>
      <p style={styles.date}>
        📅 {event.startDate} ~ {event.endDate} | 👁‍🗨 {event.views || 0}회 조회
      </p>

      {event.imageUrl && (
        <img src={event.imageUrl} alt="이벤트 이미지" style={styles.image} />
      )}

      <p style={styles.description}>{event.description}</p>
    </div>
  );
}

const styles = {
  wrapper: {
    maxWidth: 800,
    margin: '0 auto',
    padding: 24,
    fontFamily: '"Noto Sans KR", sans-serif',
  },
  backBtn: {
    marginBottom: 24,
    padding: '6px 12px',
    backgroundColor: '#ccc',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    maxHeight: 400,
    objectFit: 'cover',
    borderRadius: 8,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
  },
};