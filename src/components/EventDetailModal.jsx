import { useState } from 'react';
import { updateEvent } from '@/lib/firebase';

export default function EventDetailModal({ event, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event?.title || '');
  const [editedImageUrl, setEditedImageUrl] = useState(event?.imageUrl || '');
  const [editedStartDate, setEditedStartDate] = useState(event?.startDate || '');
  const [editedEndDate, setEditedEndDate] = useState(event?.endDate || '');
  const [editedDescription, setEditedDescription] = useState(event?.description || '');
  const [previewImageUrl, setPreviewImageUrl] = useState(event?.imageUrl || '');

  if (!event) return null;

  const handleSave = async () => {
    const updatedEvent = {
      ...event,
      title: editedTitle,
      imageUrl: previewImageUrl,
      startDate: editedStartDate,
      endDate: editedEndDate,
      description: editedDescription,
    };

    try {
      await updateEvent(updatedEvent.id, updatedEvent);
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("이벤트 업데이트 실패:", error);
      alert("이벤트 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {isEditing ? (
          <>
            <label style={{ fontWeight: 'bold', marginBottom: 4 }}>제목</label>
            <input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} style={{ width: '100%', marginBottom: 8, fontSize: 20 }} />
            <label style={{ fontWeight: 'bold', marginBottom: 4 }}>게시 기간</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="date" value={editedStartDate} onChange={(e) => setEditedStartDate(e.target.value)} />
              <text> ~ </text>
              <input type="date" value={editedEndDate} onChange={(e) => setEditedEndDate(e.target.value)} />
            </div>
            <label style={{ fontWeight: 'bold', marginBottom: 4 }}>이미지</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setPreviewImageUrl(e.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{
                border: '2px dashed #ccc',
                borderRadius: 6,
                padding: 16,
                textAlign: 'center',
                marginBottom: 16,
                cursor: 'pointer',
                backgroundColor: '#f9f9f9',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setPreviewImageUrl(e.target.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input" style={{ cursor: 'pointer', display: 'block', fontSize: 14, fontWeight: '500', color: '#333', padding: '12px 0' }}>
                이 곳을 클릭하거나 이미지를 드래그하여 업로드하세요 (최대 1장)
              </label>
              {previewImageUrl && (
                <img src={previewImageUrl} alt="preview" style={{ marginTop: 12, width: '100%', height: 240, objectFit: 'cover', borderRadius: 6 }} />
              )}
            </div>
          </>
        ) : (
          <>
            <h2 style={styles.title}>{event.title}</h2>
            <p style={styles.date}>
              📅 {event.startDate} ~ {event.endDate} | 👁‍🗨 {event.views || 0}회 조회
            </p>
          </>
        )}
        {event.imageUrl && !isEditing && (
          <img src={event.imageUrl} alt="event" style={styles.image} />
        )}

        {isEditing ? (
          <>
            <label style={{ fontWeight: 'bold', marginBottom: 4 }}>내용</label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              style={{ width: '100%', height: 150, marginBottom: 12 }}
            />
            <button onClick={handleSave} style={{ ...styles.closeBtn, backgroundColor: '#4CAF50', color: '#fff' }}>
              저장
            </button>
          </>
        ) : (
          <p style={styles.description}>{event.description}</p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{ ...styles.closeBtn, backgroundColor: '#3498db', color: '#fff' }}
            >
              수정
            </button>
          )}
          <button onClick={onClose} style={{ ...styles.closeBtn, backgroundColor: '#888' }}>닫기</button>
        </div>
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
    maxHeight: '16em',
    overflowY: 'auto',
  },
  closeBtn: {
    marginTop: 24,
    padding: '10px 16px',
    backgroundColor: '#888',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    width: '100%',
  }
};
