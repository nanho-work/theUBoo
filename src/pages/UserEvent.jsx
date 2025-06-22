import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchEvents, incrementEventViews } from '@/lib/firebase';

export default function UserEvent() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents().then((data) => {
      const today = new Date();
      const filtered = data.filter(([_, e]) => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return start <= today && today <= end;
      });
      setEvents(filtered);
    });
  }, []);

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>🎉 진행 중인 이벤트</h2>

      {events.length === 0 ? (
        <p>현재 진행 중인 이벤트가 없습니다.</p>
      ) : (
        <div style={styles.grid}>
          {events.map(([id, e]) => (
            <div key={id} style={styles.card} onClick={async () => {
              await incrementEventViews(id);
              setSelectedEvent(e);
            }}>
              <img src={e.imageUrl} alt={e.title} style={styles.image} />
              <h3>{e.title}</h3>
              <p style={styles.desc}>{e.description}</p>
              <p style={styles.date}>
                {new Date(e.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selectedEvent}
        onRequestClose={() => setSelectedEvent(null)}
        contentLabel="Event Detail"
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000 },
          content: {
            maxWidth: 500,
            maxHeight: 500,
            margin: 'auto',
            padding: 20,
            borderRadius: 12,
          },
        }}
      >
        {selectedEvent && (
          <div style={{ maxHeight: 540, overflowY: 'auto' }}>
            <img src={selectedEvent.imageUrl} alt={selectedEvent.title} style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
            <h2>{selectedEvent.title}</h2>
            <p style={{ color: '#444', lineHeight: 1.5 }}>{selectedEvent.description}</p>
            <p style={{ fontSize: 12, color: '#999', marginTop: 12 }}>
              {new Date(selectedEvent.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: 16,
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
    borderRadius: 6,
    marginBottom: 12,
  },
  desc: {
    color: '#444',
    lineHeight: 1.5,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
};