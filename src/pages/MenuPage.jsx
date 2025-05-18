import { useEffect, useState } from 'react';
import { fetchMenus } from '@/lib/firebase';

const CATEGORIES = ['전체', '식사류', '유부', '하절기메뉴', '사이드&음료'];

export default function UserMenu() {
  const [menus, setMenus] = useState({});
  const [activeCategory, setActiveCategory] = useState('전체');

  useEffect(() => {
    fetchMenus().then(setMenus);
  }, []);

  const filteredMenus = Object.entries(menus).filter(([_, menu]) => {
    return activeCategory === '전체' || menu.category === activeCategory;
  });

  return (
    <div style={{ display: 'flex', padding: 24 }}>
      {/* 왼쪽: 카테고리 탭 */}
      <aside style={{ width: 200, marginRight: 24 }}>
        <h3>🍽️ 카테고리</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {CATEGORIES.map((cat) => (
            <li key={cat} style={{ marginBottom: 12 }}>
              <button
                onClick={() => setActiveCategory(cat)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: cat === activeCategory ? '#3498db' : '#f0f0f0',
                  color: cat === activeCategory ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 오른쪽: 메뉴 카드 */}
      <main style={{ flex: 1 }}>
        <h2>{activeCategory} 메뉴</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          {filteredMenus.map(([id, menu]) => (
            <div
              key={id}
              style={{
                position: 'relative',
                border: '1px solid #eee',
                borderRadius: 10,
                backgroundColor: '#fff',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              {/* 뱃지 표시 */}
              {menu.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: '#ff5e57',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {menu.badge}
                </div>
              )}

              {/* 이미지 */}
              <img
                src={menu.imageUrl}
                alt={menu.name}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
              />

              <div style={{ padding: '12px' }}>
                <h4 style={{ margin: '4px 0', fontSize: 16 }}>{menu.name}</h4>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>{menu.description}</p>
                <strong style={{ fontSize: 15 }}>{menu.price.toLocaleString()}원</strong>

                {/* 태그 표시 */}
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(menu.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        backgroundColor: '#fce4ec',
                        color: '#c2185b',
                        borderRadius: 4,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}