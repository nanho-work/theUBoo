import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { fetchMenus } from '@/lib/firebase';

const CATEGORIES = ['전체', '식사류', '유부', '하절기메뉴', '사이드&음료'];

export default function UserMenu() {
  const [menus, setMenus] = useState({});
  const [activeCategory, setActiveCategory] = useState('전체');
  const [selectedMenu, setSelectedMenu] = useState(null);

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
                onClick={() => setSelectedMenu(menu)}
                style={{ width: '100%', height: 220, objectFit: 'cover', borderTopLeftRadius: 6, borderTopRightRadius: 6, cursor: 'pointer' }}
              />

              <div style={{ padding: '12px' }}>
                <h4 style={{ margin: '4px 0', fontSize: 16 }}>{menu.name}</h4>
                <p
                  style={{
                    margin: '4px 0',
                    fontSize: 13,
                    color: '#555',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {menu.description}
                </p>

                {/* 태그 표시 */}
                <div style={{ margin: '4px 0', minHeight: 18 }}>
                  {(menu.tags || []).length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {menu.tags.map((tag, i) => (
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
                  ) : (
                    <div style={{ height: 18 }} />
                  )}
                </div>

                <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
                  <strong style={{ fontSize: 15 }}>{menu.price.toLocaleString()}원</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    {/* 메뉴 상세 모달 */}
    <Modal
      isOpen={!!selectedMenu}
      onRequestClose={() => setSelectedMenu(null)}
      contentLabel="Menu Detail Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
        content: {
          maxWidth: 480,
          maxHeight: '100vh',
          top: '20%',
          left: '40%',
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
        },
      }}
    >
      {selectedMenu && (
        <div>
          <img
            src={selectedMenu.imageUrl}
            alt={selectedMenu.name}
            style={{ width: '100%', height: 360, objectFit: 'cover' }}
          />
          <div style={{ position: 'relative', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: '4px 0' }}>{selectedMenu.name}</h2>
                <div
                  style={{
                    maxHeight: 60,
                    overflowY: 'auto',
                    margin: '4px 0',
                    color: '#555',
                    fontSize: 14,
                    lineHeight: '1.4em',
                  }}
                >
                  {selectedMenu.description}
                </div>

                {/* 태그 표시 */}
                <div style={{ margin: '4px 0', minHeight: 18 }}>
                  {(selectedMenu.tags || []).length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedMenu.tags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 12,
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
                  ) : (
                    <div style={{ height: 18 }} />
                  )}
                </div>
              </div>
            </div>
            <strong
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                fontSize: 20,
                whiteSpace: 'nowrap'
              }}
            >
              {selectedMenu.price.toLocaleString()}원
            </strong>
          </div>
        </div>
      )}
    </Modal>
    </div>
  );
}