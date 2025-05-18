import { useState } from 'react';
import { addReview } from '@/lib/firebase';
import imageCompression from 'browser-image-compression';

export default function ReviewModal({ onClose }) {
  const [form, setForm] = useState({
    nickname: '',
    password: '',
    content: '',
    files: [],
  });
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
  const selected = Array.from(e.target.files);

  if (selected.length > 5) {
    alert('이미지는 최대 5장까지만 등록할 수 있습니다.');
    e.target.value = ''; // 👉 선택 취소
    setForm((prev) => ({ ...prev, files: [] }));
    setPreviews([]);
    return;
  }

  setForm((prev) => ({ ...prev, files: selected }));
  setPreviews(selected.map((file) => URL.createObjectURL(file)));
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nickname || !form.password || !form.content) {
      setMessage('⚠️ 모든 항목을 입력해주세요.');
      return;
    }

    try {
      await addReview(form);
      setMessage('✅ 등록이 완료되었습니다!');
      setTimeout(() => {
        onSuccess(); // 🔹 부모에게 새로고침 요청
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage('❌ 등록에 실패했습니다.');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.heading}>📝 방문 후기 작성</h2>

        {/* 닉네임 + 비밀번호 */}
        <div style={styles.row}>
          <input
            name="nickname"
            placeholder="닉네임"
            value={form.nickname}
            onChange={handleChange}
            style={{ ...styles.input, flex: 1 }}
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호 (4자리)"
            maxLength={4}
            value={form.password}
            onChange={handleChange}
            style={{ ...styles.input, flex: 1 }}
          />
        </div>

        {/* 내용 */}
        <textarea
          name="content"
          placeholder="내용을 입력해주세요"
          value={form.content}
          onChange={handleChange}
          style={{ ...styles.input, height: 120, resize: 'vertical' }}
        />

        {/* 파일 */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={styles.input}
        />

        {/* 미리보기 */}
        <div style={styles.previewRow}>
          {previews.map((src, idx) => (
            <img key={idx} src={src} alt={`preview-${idx}`} style={styles.previewImg} />
          ))}
        </div>

        <button onClick={handleSubmit} style={styles.button}>등록</button>
        <button onClick={onClose} style={styles.cancelBtn}>닫기</button>
        {message && <p style={styles.message}>{message}</p>}
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
    backgroundColor: '#fff', padding: 24, borderRadius: 10,
    width: '100%', maxWidth: 480,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: '"Noto Sans KR", sans-serif',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderRadius: 6,
    border: '1px solid #ccc',
    marginBottom: 12,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: 16,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    marginBottom: 8,
  },
  cancelBtn: {
    width: '100%',
    padding: 12,
    backgroundColor: '#ccc',
    color: '#fff',
    fontSize: 16,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  previewRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  previewImg: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #ddd',
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
    color: '#2c3e50',
  }
};