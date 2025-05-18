// ⛳️ src/admin/components/EventDetailModal.jsx

export default function EventDetailModal({ event, onClose }) {
  if (!event) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{event.title}</h2>
        <p style={styles.date}>
          📅 {event.startDate} ~ {event.endDate} | 👁‍🗨 {event.views || 0}회 조회
        </p>
        {event.imageUrl && (
          <img src={event.imageUrl} alt="event" style={styles.image} />
        )}
        <p style={styles.description}>{event.description}</p>

        <button onClick={onClose} style={styles.closeBtn}>닫기</button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#fff', padding: 24, borderRadius: 8,
    width: '100%', maxWidth: 520,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 240,
    objectFit: 'cover',
    borderRadius: 6,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
  },
  closeBtn: {
    marginTop: 24,
    padding: '10px 16px',
    backgroundColor: '#ccc',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    width: '100%',
  }
};
