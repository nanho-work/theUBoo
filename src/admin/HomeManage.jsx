import { useState, useEffect, useRef } from 'react';
import { uploadSlideImage, deleteSlideImage, saveStoreInfo, fetchStoreInfo, uploadStoreImage, fetchStoreImages, deleteStoreImage } from '@/lib/firebase';
import { get, ref as dbRef } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function HomeManage() {
  const [slides, setSlides] = useState({});
  const [previews, setPreviews] = useState([null, null, null, null]); // ✅ 로컬 미리보기
  const fileInputRefs = useRef([null, null, null, null]);

  // 🔄 Storage 이미지 로드
  const loadSlides = async () => {
    const snapshot = await get(dbRef(db, 'introSlides'));
    if (snapshot.exists()) setSlides(snapshot.val());
    else setSlides({});
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const handleUpload = async (file, slot) => {
    try {
      const imageUrl = await uploadSlideImage(file, slot);
      alert('업로드 완료!');

      setPreviews((prev) => {
        const updated = [...prev];
        updated[slot] = null; // 업로드 후 미리보기 초기화
        return updated;
      });

      // 🟢 슬라이드 상태 즉시 반영 (선택사항이지만 UX 향상됨)
      setSlides((prev) => ({
        ...prev,
        [slot]: { imageUrl },
      }));
      fileInputRefs.current[slot].value = "";
    } catch (err) {
      console.error(err);
      alert('업로드 실패');
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await deleteSlideImage(slot);
      setPreviews((prev) => {
        const updated = [...prev];
        updated[slot] = null;
        return updated;
      });
      alert('삭제 완료!');
      loadSlides();
    } catch (err) {
      console.error(err);
      alert('삭제 실패');
    }
  };

  const handleFileChange = (slot, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => {
        const updated = [...prev];
        updated[slot] = previewUrl;
        return updated;
      });
    }
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();
    if (slides[slot]?.imageUrl) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const previewUrl = URL.createObjectURL(droppedFile);
      setPreviews((prev) => {
        const updated = [...prev];
        updated[slot] = previewUrl;
        return updated;
      });
      handleUpload(droppedFile, slot);
    }
  };

  const handleUploadClick = (slot) => {
    if (slides[slot]?.imageUrl) return;
    fileInputRefs.current[slot]?.click();
  };

  // 매장 정보 
  const [storeForm, setStoreForm] = useState({
    zipcode: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
  });


  const [storeMessage, setStoreMessage] = useState('');

  useEffect(() => {
    fetchStoreInfo().then((data) => {
      if (data) {
        setStoreForm(data);
      }
    });
  }, []);


  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreSave = async () => {
    try {
      await saveStoreInfo(storeForm);
      setStoreMessage('✅ 저장 완료!');

      // 🔁 입력폼 초기화
      setStoreForm({
        zipcode: '',
        address: '',
        latitude: '',
        longitude: '',
        description: '',
      });
    } catch (err) {
      console.error(err);
      setStoreMessage('❌ 저장 실패');
    }
  };

  // 매장이미지 
  const [storeImages, setStoreImages] = useState([]); // 여러 이미지 저장
  const [selectedStoreImage, setSelectedStoreImage] = useState(null);
  const handleStoreFileChange = (e) => {
  const file = e.target.files[0];
  if (file) setSelectedStoreImage(file);
};

  useEffect(() => {
  fetchStoreImages()
    .then((urls) => setStoreImages(urls))
    .catch((err) => {
      console.error(err);
      alert("이미지를 불러오는 데 실패했습니다.");
    });
}, []);

  // 매장 이미지 등록
  const handleUploadStoreImage = async () => {
  if (!selectedStoreImage) {
    alert("파일을 선택해주세요.");
    return;
  }

  try {
    const url = await uploadStoreImage(selectedStoreImage);
    setStoreImages((prev) => [...prev, url]);
    setSelectedStoreImage(null);
    alert("✅ 업로드 완료!");
  } catch (err) {
    console.error(err);
    alert("❌ 업로드 실패");
  }
};

  // 매장 이미지 삭제 
  const handleDeleteStoreImage = async (url) => {
    if (!window.confirm("이미지를 삭제하시겠습니까?")) return;

    await deleteStoreImage(url);
    setStoreImages((prev) => prev.filter((img) => img !== url));
  };
  

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>홈화면 슬라이드 이미지 관리</h2>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map((slot) => (
          <div
            key={slot}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, slot)}
            onClick={() => handleUploadClick(slot)}
            style={{
              width: 240,
              height: 240,
              border: '2px dashed #ccc',
              borderRadius: 8,
              padding: 12,
              textAlign: 'center',
              background: '#f9f9f9',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {(previews[slot] || slides[slot]?.imageUrl) ? (
              <img
                src={previews[slot] || slides[slot]?.imageUrl}
                alt={`슬라이드 ${slot + 1}`}
                style={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#aaa',
                }}
              >
                드래그 또는 클릭으로 업로드
              </div>
            )}

            <div style={{ width: '100%', marginTop: 12 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const file = fileInputRefs.current[slot]?.files?.[0];
                  if (file) {
                    handleUpload(file, slot);
                  } else {
                    alert("이미지를 먼저 선택해주세요.");
                  }
                }}
                disabled={!!slides[slot]?.imageUrl} // ✅ 이미지가 이미 등록돼 있으면 비활성화
                style={{
                  width: '100%',
                  padding: 6,
                  marginBottom: 6,
                  background: slides[slot]?.imageUrl ? '#ccc' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: slides[slot]?.imageUrl ? 'not-allowed' : 'pointer',
                }}
              >
                등록
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(slot);
                }}
                disabled={!slides[slot]?.imageUrl}
                style={{
                  width: '100%',
                  padding: 6,
                  background: slides[slot]?.imageUrl ? '#e74c3c' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: slides[slot]?.imageUrl ? 'pointer' : 'not-allowed',
                }}
              >
                삭제
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={(el) => (fileInputRefs.current[slot] = el)}
              onChange={(e) => handleFileChange(slot, e)}
            />
          </div>
        ))}
      </div>
      {/* ───── 오시는 길/매장 소개 입력 폼 ───── */}
      <div style={{ marginTop: 48 }}>
        <h2>🧭 오시는 길 / 매장 소개</h2>

        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          <input
            type="text"
            name="zipcode"
            value={storeForm.zipcode}
            placeholder="우편번호"
            onChange={handleStoreChange}
            style={{ flex: 1, padding: 8 }}
          />
          <input
            type="text"
            name="address"
            value={storeForm.address}
            placeholder="도로명 주소"
            onChange={handleStoreChange}
            style={{ flex: 3, padding: 8 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          <input
            type="text"
            name="latitude"
            value={storeForm.latitude}
            placeholder="위도"
            onChange={handleStoreChange}
            style={{ flex: 1, padding: 8 }}
          />
          <input
            type="text"
            name="longitude"
            value={storeForm.longitude}
            placeholder="경도"
            onChange={handleStoreChange}
            style={{ flex: 1, padding: 8 }}
          />
        </div>

        <textarea
          name="description"
          value={storeForm.description}
          placeholder="매장 소개글"
          onChange={handleStoreChange}
          rows={4}
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
        />

        <button
          onClick={handleStoreSave}
          style={{
            padding: '10px 16px',
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          저장
        </button>

        {storeMessage && (
          <p style={{ marginTop: 12, color: storeMessage.startsWith('✅') ? '#2ecc71' : '#e74c3c' }}>
            {storeMessage}
          </p>
        )}
      </div>
      <div style={{ marginTop: 32 }}>
        <h3>🏪 매장 대표 사진</h3>

        {storeImages.length < 5 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="file" accept="image/*" onChange={handleStoreFileChange} />
            <button
              onClick={handleUploadStoreImage}
              disabled={!selectedStoreImage || storeImages.length >= 5}
              style={{
                padding: '6px 12px',
                background: selectedStoreImage ? '#3498db' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: selectedStoreImage ? 'pointer' : 'not-allowed',
              }}
            >
              등록
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          {storeImages.map((url, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img src={url} alt={`store-${idx}`} style={{ width: 220, height: 220, borderRadius: 8, objectFit: 'cover' }} />
              <button
                onClick={() => handleDeleteStoreImage(url)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 'bold',
                  fontSize: 16,
                  lineHeight: '24px',         // ✅ 수직 가운데
                  textAlign: 'center',        // ✅ 수평 가운데
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}