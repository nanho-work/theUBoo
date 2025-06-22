import { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { fetchSlideImages, fetchStoreInfo, fetchStoreImages } from '@/lib/firebase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import logo from '@/assets/logo.png';

// Leaflet default icon fix for Vite/React environments
import L from 'leaflet';
import markerIcon2x from '@/assets/leaflet/marker-icon-2x.png';
import markerIcon from '@/assets/leaflet/marker-icon.png';
import markerShadow from '@/assets/leaflet/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function HomePage() {
    const [slides, setSlides] = useState({});
    const [storeInfo, setStoreInfo] = useState(null);
    const [storeImages, setStoreImages] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');

    const openModal = (imageUrl) => {
        setModalImage(imageUrl);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    useEffect(() => {
        fetchSlideImages().then(setSlides);
        fetchStoreInfo().then(setStoreInfo);
        fetchStoreImages().then(setStoreImages);
    }, []);

    const slideTimer = useRef(null);
    const slideValues = Object.values(slides);

    const handleSlideChange = (newIndex) => {
        setCurrentSlide(newIndex);
        if (slideTimer.current) clearTimeout(slideTimer.current);
        slideTimer.current = setTimeout(() => {
            setCurrentSlide((prev) => (prev + 1) % slideValues.length);
        }, 5000);
    };

    // 초기 자동 슬라이드 타이머 설정
    useEffect(() => {
        if (slideValues.length > 0) {
            slideTimer.current = setTimeout(() => {
                setCurrentSlide((prev) => (prev + 1) % slideValues.length);
            }, 5000);
            return () => clearTimeout(slideTimer.current);
        }
    }, [slideValues]);

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.title}>더 유부에 오신 것을 환영합니다!</h1>
            <p style={styles.subtitle}>정성껏 만든 유부 요리, 따뜻한 한 끼를 전해드립니다.</p>

            <div style={styles.carouselContainer}>
                {slideValues.length > 0 ? (
                    <div style={{ position: 'relative', height: '100%' }}>
                        <img
                            src={slideValues[currentSlide]?.imageUrl}
                            alt={`slide-${currentSlide}`}
                            style={styles.carouselImage}
                        />
                        {/* 좌우 화살표 */}
                        <button onClick={() => handleSlideChange((currentSlide - 1 + slideValues.length) % slideValues.length)} style={styles.arrowLeft}>&lt;</button>
                        <button onClick={() => handleSlideChange((currentSlide + 1) % slideValues.length)} style={styles.arrowRight}>&gt;</button>
                        {/* Pager */}
                        <div style={styles.pager}>
                            {slideValues.map((_, index) => (
                                <span
                                    key={index}
                                    style={{
                                        ...styles.dot,
                                        backgroundColor: currentSlide === index ? '#333' : '#bbb',
                                        cursor: 'default',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#888',
                        fontSize: '1.2rem'
                    }}>
                        슬라이드 이미지를 불러오는 중입니다...
                    </div>
                )}
            </div>

            {storeInfo && (
                <>

                    <div style={{ height: '360px', width: '100%', margin: '2rem 0' }}>
                        <h3 style={{ fontSize: 18, marginBottom: 12 }}>매장 위치</h3>
                        <MapContainer
                            center={[parseFloat(storeInfo.latitude), parseFloat(storeInfo.longitude)]}
                            zoom={17}
                            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[parseFloat(storeInfo.latitude), parseFloat(storeInfo.longitude)]}>
                                <Popup>
                                    <div style={{ textAlign: 'center' }}>
                                        <img src={logo} alt="로고" style={{ width: 40, height: 40, marginBottom: 6 }} />
                                        <div>더 유부 매장 위치</div>
                                        <div style={{ fontSize: 13, color: '#555' }}>{storeInfo.address}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    <div style={styles.infoBox}>
                        <p><strong>주소:</strong> {storeInfo.address}</p>
                        <p style={styles.description}>
                            {storeInfo.description}
                        </p>
                    </div>
                </>
            )}

            <div style={styles.galleryBox}>
                <h3> 매장 사진</h3>
                <div style={styles.imageRow}>
                    {storeImages.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`store-${idx}`}
                            style={styles.thumb}
                            onClick={() => openModal(url)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        />
                    ))}
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Store Image Modal"
                style={{
                    overlay: {
                        zIndex: 1000,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                    },
                    content: {
                        maxWidth: '70%',
                        maxHeight: '70%',
                        margin: 'auto',
                        padding: 0,
                        overflow: 'hidden',
                        borderRadius: '12px',
                    },
                }}
            >
                <img src={modalImage} alt="확대 이미지" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Modal>
        </div>
    );
}

const styles = {
    wrapper: {
        padding: '2rem',
        maxWidth: 960,
        margin: '2rem auto',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
    },
    title: {
        fontSize: 'clamp(2rem, 5vw, 3.2rem)',
        fontWeight: 700,
        marginBottom: '1rem',
        color: '#2c3e50',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
        color: '#666',
        marginBottom: '2.5rem',
        textAlign: 'center',
        maxWidth: '640px',
        marginInline: 'auto',
    },
    carouselContainer: {
        width: '100%',
        height: 400,
        overflow: 'hidden',
        borderRadius: 16,
        marginBottom: '2.5rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 16,
        transition: 'opacity 0.5s ease-in-out',
    },
    arrowLeft: {
        position: 'absolute',
        top: '50%',
        left: 10,
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.7)',
        border: 'none',
        borderRadius: '50%',
        padding: '0.5rem 0.7rem',
        cursor: 'pointer',
    },
    arrowRight: {
        position: 'absolute',
        top: '50%',
        right: 10,
        transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.7)',
        border: 'none',
        borderRadius: '50%',
        padding: '0.5rem 0.7rem',
        cursor: 'pointer',
    },
    pager: {
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: '#bbb',
    },
    infoBox: {
        padding: '1.5rem',
        borderRadius: 10,
        marginBottom: '2rem',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    description: {
        marginTop: 8,
        whiteSpace: 'pre-line',
        lineHeight: 1.5,
    },
    galleryBox: {
        marginTop: 24,
    },
    imageRow: {
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
    },
    thumb: {
        width: 140,
        height: 140,
        objectFit: 'cover',
        borderRadius: 10,
        border: '1px solid #ccc',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
    },
};