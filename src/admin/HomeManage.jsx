import { useState, useEffect, useRef } from 'react';
import { uploadSlideImage, deleteSlideImage, saveStoreInfo, fetchStoreInfo, uploadStoreImage, fetchStoreImages, deleteStoreImage } from '@/lib/firebase';
import { get, ref as dbRef } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function HomeManage() {
  const [slides, setSlides] = useState({});
  const [previews, setPreviews] = useState([...Array(10).fill(null)]); // ✅ 로컬 미리보기
  const fileInputRefs = useRef([...Array(10).fill(null)]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlotIndex, setNewSlotIndex] = useState(null);
  // State to temporarily store the selected slide image before upload
  const [selectedSlideImage, setSelectedSlideImage] = useState(null);

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
      if (fileInputRefs.current[slot]) fileInputRefs.current[slot].value = "";
      setIsModalOpen(false);
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
      // Do not show preview before confirmation
      // Store the file in state, don't upload yet
      setSelectedSlideImage(file);
    }
  };

  const handleDrop = (e, slot) => {
    e.preventDefault();
    if (slides[slot]?.imageUrl) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Do not show preview before confirmation
      // Set file input value for UX purposes
      if (fileInputRefs.current[slot]) {
        const dt = new DataTransfer();
        dt.items.add(droppedFile);
        fileInputRefs.current[slot].files = dt.files;
      }
      // Store the file in state, don't upload yet
      setSelectedSlideImage(droppedFile);
    }
  };

  const handleUploadClick = (slot) => {
    if (slides[slot]?.imageUrl) return;
    fileInputRefs.current[slot]?.click();
  };

  const handleUploadAll = () => {
    fileInputRefs.current.forEach((inputRef, index) => {
      const file = inputRef?.files?.[0];
      if (file) {
        handleUpload(file, index);
      }
    });
  };

  // 매장 정보 
  const [storeForm, setStoreForm] = useState({
    address: '',
    latitude: '',
    longitude: '',
    description: '',
  });



  const [storeMessage, setStoreMessage] = useState('');

  useEffect(() => {
    fetchStoreInfo().then((data) => {
      if (data) {
        setStoreForm({
          address: data.address || '',
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          description: data.description || '',
        });
      }
    });
  }, []);

  useEffect(() => {
    console.log("📥 postMessage 리스너 등록됨");
    const handleMessage = (event) => {
      // Check origin and source, and ensure data shape
      if (
        event.origin === window.location.origin &&
        (event.source === window || event.source === window.opener) &&
        event.data &&
        typeof event.data === 'object' &&
        'roadAddr' in event.data
      ) {
        console.log("✅ 주소 수신됨:", event.data);
        setStoreForm((prev) => ({
          ...prev,
          address: event.data.roadAddr
        }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function fetchGeoInfo(address) {
    // 예시: Kakao 로컬 API 사용 (실제 API 키와 엔드포인트 필요)
    // 여기서는 fetch 사용 예시만 작성
    const apiKey = 'YOUR_KAKAO_API_KEY';
    const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`, {
      headers: { Authorization: `KakaoAK ${apiKey}` }
    });
    const data = await res.json();
    if (data.documents && data.documents.length > 0) {
      const doc = data.documents[0];
      const lat = doc.address.y || '';
      const lng = doc.address.x || '';
      return { lat, lng };
    }
    return { lat: '', lng: '' };
  }

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreSave = async () => {
    try {
      // Only include the relevant fields (no zipCode)
      const updatedForm = {
        address: storeForm.address,
        latitude: storeForm.latitude,
        longitude: storeForm.longitude,
        description: storeForm.description,
      };
      await saveStoreInfo(updatedForm);
      alert('✅ 저장 완료!');
      setStoreMessage('');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>홈화면 슬라이드 이미지 관리</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            const firstEmptyIndex = previews.findIndex((v, i) => !previews[i] && !slides[i]?.imageUrl);
            setNewSlotIndex(firstEmptyIndex);
          }}
          disabled={Object.keys(slides).length >= 10}
          style={{
            padding: '8px 16px',
            background: Object.keys(slides).length >= 10 ? '#ccc' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: Object.keys(slides).length >= 10 ? 'not-allowed' : 'pointer',
          }}
        >
          이미지 추가
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
        {[...Array(10).keys()].map((slot) => (
          (previews[slot] || slides[slot]?.imageUrl) && (
            <div key={slot} style={{ position: 'relative' }}>
              <img
                src={previews[slot] || slides[slot]?.imageUrl}
                alt={`slide-${slot}`}
                style={{ width: 220, height: 220, borderRadius: 8, objectFit: 'cover' }}
              />
              <button
                onClick={() => handleDelete(slot)}
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
                  lineHeight: '24px',
                  textAlign: 'center',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          )
        ))}
      </div>
      {/* ───── 오시는 길/매장 소개 입력 폼 ───── */}
      <div style={{ marginTop: 48 }}>
        <h2>🧭 오시는 길 / 매장 소개</h2>
        {/* 주소 입력 */}
        <div style={{ marginBottom: 8, display: 'flex', gap: 12 }}>
          <input
            type="text"
            name="address"
            value={storeForm.address}
            placeholder="도로명 주소"
            onChange={handleStoreChange}
            style={{ flex: 1, padding: 8 }}
          />
          <input
            type="text"
            placeholder="위도, 경도 (쉼표로 구분)"
            value={`${storeForm.latitude}, ${storeForm.longitude}`}
            onChange={(e) => {
              const [lat, lng] = e.target.value.split(',').map(str => str.trim());
              setStoreForm(prev => ({
                ...prev,
                latitude: lat || '',
                longitude: lng || '',
              }));
            }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>🏪 매장 대표 사진</h2>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setNewSlotIndex(null); // null means store image modal
            }}
            disabled={storeImages.length >= 10}
            style={{
              padding: '8px 16px',
              background: storeImages.length >= 10 ? '#ccc' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: storeImages.length >= 10 ? 'not-allowed' : 'pointer',
              marginLeft: 12,
            }}
          >
            이미지 추가
          </button>
        </div>
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
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: 400, margin: '10% auto', padding: 24, borderRadius: 8, position: 'relative' }}>
            {newSlotIndex === null ? (
              <>
                <h3>매장 이미지 등록</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleStoreFileChange(e);
                  }}
                />
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setSelectedStoreImage(file);
                    }
                  }}
                  style={{
                    border: '2px dashed #ccc',
                    padding: 20,
                    marginTop: 16,
                    textAlign: 'center',
                    borderRadius: 8,
                  }}
                >
                  또는 이곳에 드래그하여 업로드
                </div>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    onClick={async () => {
                      // Guard: 최대 10개 제한
                      if (storeImages.length >= 10) {
                        alert("이미지는 최대 10개까지만 등록할 수 있습니다.");
                        return;
                      }
                      if (selectedStoreImage) {
                        try {
                          const url = await uploadStoreImage(selectedStoreImage);
                          setStoreImages((prev) => [...prev, url]);
                        } catch (err) {
                          alert("❌ 업로드 실패");
                        }
                        setSelectedStoreImage(null);
                        setIsModalOpen(false);
                      }
                    }}
                    disabled={!selectedStoreImage}
                    style={{
                      padding: '10px 16px',
                      fontSize: 14,
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
              </>
            ) : (
              <>
                <h3>이미지 추가</h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(newSlotIndex, e)}
                  ref={(el) => (fileInputRefs.current[newSlotIndex] = el)}
                />
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      // Do not show preview before confirmation
                      if (fileInputRefs.current[newSlotIndex]) {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        fileInputRefs.current[newSlotIndex].files = dt.files;
                      }
                      setSelectedSlideImage(file);
                    }
                  }}
                  style={{
                    border: '2px dashed #ccc',
                    padding: 20,
                    marginTop: 16,
                    textAlign: 'center',
                    borderRadius: 8,
                  }}
                >
                  또는 이곳에 드래그하여 업로드
                </div>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    onClick={async () => {
                      if (selectedSlideImage) {
                        await handleUpload(selectedSlideImage, newSlotIndex);
                        setSelectedSlideImage(null);
                      }
                    }}
                    disabled={!selectedSlideImage}
                    style={{
                      padding: '10px 16px',
                      fontSize: 14,
                      background: selectedSlideImage ? '#3498db' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: selectedSlideImage ? 'pointer' : 'not-allowed',
                    }}
                  >
                    등록
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSlideImage(null);
                setSelectedStoreImage(null);
                if (newSlotIndex !== null) {
                  // Also clear preview for that slot if user cancels before 등록
                  setPreviews((prev) => {
                    const updated = [...prev];
                    updated[newSlotIndex] = null;
                    return updated;
                  });
                }
              }}
              style={{ position: 'absolute', top: 8, right: 8 }}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}