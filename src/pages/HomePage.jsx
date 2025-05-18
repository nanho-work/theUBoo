import { useEffect, useState } from 'react';
import { fetchSlideImages, fetchStoreInfo, fetchStoreImages } from '@/lib/firebase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function HomePage() {
    const [slides, setSlides] = useState({});
    const [storeInfo, setStoreInfo] = useState(null);
    const [storeImages, setStoreImages] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        fetchSlideImages().then(setSlides);
        fetchStoreInfo().then(setStoreInfo);
        fetchStoreImages().then(setStoreImages);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % Object.values(slides).length);
        }, 3000);
        return () => clearInterval(interval);
    }, [slides]);

    const slideValues = Object.values(slides);

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.title}>더 유부에 오신 것을 환영합니다!</h1>
            <p style={styles.subtitle}>정성껏 만든 유부 요리, 따뜻한 한 끼를 전해드립니다.</p>

            <div style={styles.carouselContainer}>
                {slideValues.length > 0 ? (
                    <img
                        src={slideValues[currentSlide]?.imageUrl}
                        alt={`slide-${currentSlide}`}
                        style={styles.carouselImage}
                    />
                ) : (
                    <p>슬라이드 이미지를 준비 중입니다.</p>
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
                                        <img src="/logo.png" alt="로고" style={{ width: 40, height: 40, marginBottom: 6 }} />
                                        <div>더 유부 매장 위치</div>
                                        <div style={{ fontSize: 13, color: '#555' }}>{storeInfo.address}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    <div style={styles.infoBox}>
                        <p><strong>주소:</strong> {storeInfo.address}</p>
                        <p style={styles.description}>{storeInfo.description}</p>
                    </div>
                </>
            )}

            <div style={styles.galleryBox}>
                <h3> 매장 사진</h3>
                <div style={styles.imageRow}>
                    {storeImages.map((url, idx) => (
                        <img key={idx} src={url} alt={`store-${idx}`} style={styles.thumb} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        padding: '2rem',
        maxWidth: 960,
        margin: '0 auto',
        boxSizing: 'border-box',
    },
    title: {
        fontSize: 'clamp(1.8rem, 4vw, 3rem)',
        fontWeight: 'bold',
        marginBottom: '1rem',
    },
    subtitle: {
        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
        color: '#555',
        marginBottom: '2rem',
        maxWidth: '600px',
    },
    carouselContainer: {
        width: '100%',
        height: 400,
        overflow: 'hidden',
        borderRadius: 12,
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'opacity 0.5s ease-in-out',
    },
    infoBox: {
        padding: 20,
        borderRadius: 8,
        marginBottom: 32,
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
        borderRadius: 8,
        border: '1px solid #ddd',
    },
};