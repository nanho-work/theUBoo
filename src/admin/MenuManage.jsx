import { useEffect, useRef, useState } from 'react';
import { addMenu, fetchMenus, deleteMenu } from '../lib/firebase';
import { deleteObject } from "firebase/storage";

export default function MenuManage() {
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        category: '',
        name: '',
        description: '',
        price: '',
        tags: '',
        file: null,

    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [menus, setMenus] = useState({});
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        const data = await fetchMenus();
        setMenus(data);
    };

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
        if (!form.name || !form.price || !form.file) {
            setMessage('메뉴명, 가격, 이미지를 모두 입력해주세요.');
            return;
        }

        setUploading(true);
        try {
            await addMenu({
                name: form.name,
                description: form.description,
                price: parseInt(form.price, 10),
                category: form.category,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), // ← 중요
                file: form.file,
            });
            setMessage('✅ 메뉴가 등록되었습니다!');
            setForm({ name: '', description: '', price: '', category: '', file: null });
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            loadMenus();
        } catch (err) {
            console.error(err);
            setMessage('❌ 오류 발생: 메뉴 등록 실패');
        }
        setUploading(false);
    };

    const handleDelete = async (menuId, imageUrl) => {
        if (!window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) return;
        try {
            await deleteMenu(menuId, imageUrl);
            setMessage('🗑️ 메뉴 삭제 완료');
            loadMenus();
        } catch (err) {
            console.error(err);
            setMessage('❌ 메뉴 삭제 중 오류 발생');
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                padding: '1.5rem',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: `'Segoe UI', 'Noto Sans KR', sans-serif`,
            }}
        >
            {/* 왼쪽: 메뉴 카드 리스트 */}
            <div style={{ flex: 4, minWidth: '800px' }}>
                <h2>📋 메뉴 목록</h2>

                {['식사류', '유부', '하절기메뉴', '사이드&음료'].map((category) => {
                    const filteredMenus = Object.entries(menus).filter(([_, menu]) => menu.category === category);
                    if (filteredMenus.length === 0) return null;

                    return (
                        <div key={category} style={{ marginBottom: 32 }}>
                            <h3 style={{ marginBottom: 12 }}>{category}</h3>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: 16,
                                }}
                            >
                                {filteredMenus.map(([id, menu]) => (
                                    <div
                                        key={id}
                                        style={{
                                            border: '1px solid #ddd',
                                            borderRadius: 10,
                                            padding: 12,
                                            backgroundColor: '#f9f9f9',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                        }}
                                    >
                                        <img
                                            src={menu.imageUrl}
                                            alt={menu.name}
                                            style={{
                                                width: '100%',
                                                height: 160,
                                                objectFit: 'cover',
                                                borderRadius: 6,
                                            }}
                                        />
                                        <h4 style={{ margin: '8px 0 4px' }}>{menu.name}</h4>
                                        <p style={{ margin: 0 }}>{menu.description}</p>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <strong>{menu.price.toLocaleString()}원</strong>
                                            <button
                                                onClick={() => handleDelete(id, menu.imageUrl)}
                                                style={{
                                                    background: '#e74c3c',
                                                    color: 'white',
                                                    padding: '6px 12px',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 오른쪽: 등록 폼 */}
            <div style={{ flex: 1 }}>
                <h2>🍱 메뉴 등록</h2>
                <form onSubmit={handleSubmit}>
                    {/* 메뉴명 */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 'bold' }}>메뉴명</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                fontSize: 16,
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                boxSizing: 'border-box',
                                height: 48,
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 'bold' }}>카테고리</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                fontSize: 16,
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                boxSizing: 'border-box',
                                height: 48,
                            }}
                        >
                            <option value="">선택해주세요</option>
                            <option value="식사류">식사류</option>
                            <option value="유부">유부</option>
                            <option value="하절기메뉴">하절기메뉴</option>
                            <option value="사이드&음료">사이드&음료</option>
                        </select>
                    </div>

                    {/* 설명 */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 'bold' }}>설명</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                fontSize: 16,
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                boxSizing: 'border-box',
                                height: 120,
                            }}
                        />
                    </div>

                    {/* 가격 */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 'bold' }}>가격</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: 12,
                                fontSize: 16,
                                border: '1px solid #ccc',
                                borderRadius: 6,
                                boxSizing: 'border-box',
                                height: 48,
                            }}
                        />
                    </div>
                    {/* 태그 */}
                    <div style={{ marginBottom: 12 }}>
                    <label style={{ fontWeight: 'bold' }}>태그 (쉼표로 구분)</label>
                    <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        placeholder="예: 유부초밥, 단백질"
                        style={{
                        width: '100%',
                        padding: 12,
                        fontSize: 16,
                        border: '1px solid #ccc',
                        borderRadius: 6,
                        boxSizing: 'border-box',
                        height: 48,
                        }}
                    />
                    </div>

                    {/* 사진 드래그/업로드 */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
                            사진
                        </label>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const droppedFile = e.dataTransfer.files[0];
                                if (droppedFile) {
                                    setForm((prev) => ({ ...prev, file: droppedFile }));
                                    setPreviewUrl(URL.createObjectURL(droppedFile));
                                    if (fileInputRef.current) fileInputRef.current.files = e.dataTransfer.files;
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                height: 180,
                                padding: '20px',
                                border: '2px dashed #ccc',
                                textAlign: 'center',
                                borderRadius: 8,
                                background: '#f9f9f9',
                                color: '#666',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="미리보기"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 6,
                                    }}
                                />
                            ) : (
                                <span>
                                    화면을 클릭하여 파일을 선택하거나<br />
                                    드래그 후 업로드
                                </span>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="file"
                            accept="image/*"
                            onChange={handleChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* 등록 버튼 */}
                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="submit"
                            disabled={uploading}
                            style={{
                                background: '#3498db',
                                color: 'white',
                                padding: '10px 16px',
                                fontSize: '16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}
                        >
                            {uploading ? '등록 중...' : '메뉴 등록'}
                        </button>
                    </div>
                </form>

                {/* 메시지 출력 */}
                {message && (
                    <p
                        style={{
                            marginTop: 16,
                            padding: 8,
                            backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
                            color: message.startsWith('✅') ? '#155724' : '#721c24',
                            borderRadius: 6,
                        }}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}