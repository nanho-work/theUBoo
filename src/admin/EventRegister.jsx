// src/admin/EventRegister.jsx
import { useState } from 'react';
import { addEvent } from '@/lib/firebase';

export default function EventRegister({ onRegistered }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      setForm((prev) => ({ ...prev, file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.startDate || !form.endDate || !form.file) {
      setMessage('⚠️ 모든 항목을 입력해주세요.');
      return;
    }

    try {
      await addEvent(form); // Firebase 저장 메서드
      setMessage('✅ 이벤트가 등록되었습니다!');
      setForm({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        file: null,
      });
      setPreviewUrl(null);
      if (onRegistered) onRegistered();
    } catch (err) {
      console.error(err);
      setMessage('❌ 등록 실패');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>📝 이벤트 등록</h3>

      <input
        type="text"
        name="title"
        placeholder="제목"
        value={form.title}
        onChange={handleChange}
        style={styles.input}
      />
      <textarea
        name="description"
        placeholder="내용"
        value={form.description}
        onChange={handleChange}
        rows={12}
        style={styles.input}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <input
        type="file"
        accept="image/*"
        name="file"
        onChange={handleChange}
        style={{ marginTop: 12, marginBottom: 12 }}
      />
      {previewUrl && (
        <img
          src={previewUrl}
          alt="미리보기"
          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
        />
      )}

      <button type="submit" style={styles.button}>등록</button>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </form>
  );
}

const styles = {
  input: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    border: '1px solid #ccc',
    borderRadius: 6,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
};