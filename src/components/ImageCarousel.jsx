// src/components/ImageCarousel.jsx
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function ImageCarousel({ images }) {
  if (!images?.length) return null;

    const settings = {
    dots: true,
    infinite: images.length > 1, // 1장이면 반복 안 함
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: images.length > 1,      // ✅ 자동넘김 설정
    autoplaySpeed: 2000,              // ✅ 넘김 간격 (3초)
    };

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', marginTop: 12 }}>
      <Slider {...settings}>
        {images.map((url, idx) => (
          <div key={idx}>
            <img
              src={url}
              alt={`slide-${idx}`}
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}