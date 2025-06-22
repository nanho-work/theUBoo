import { Link } from 'react-router-dom';

export default function UserHeader() {
  const menuItems = [
    { label: '메뉴', path: '/menu' },
    { label: '방문후기', path: '/review' },
    { label: '이벤트', path: '/event' }
  ];

  const topInfo = ['고객센터', '사이트맵', '가맹점 개설안내'];

  return (
    <header style={styles.header}>
      {/* 상단 안내 */}
      <div style={styles.topInfo}>
        {topInfo.map((text, idx) => (
          <span key={idx}>
            {text}
            {idx < topInfo.length - 1 && <span style={styles.topDivider}>｜</span>}
          </span>
        ))}
      </div>

      {/* 로고 + 네비게이션 */}
      <div style={styles.navWrapper}>
        <div style={styles.logoSection}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/logo.png" alt="TheUboo" style={{ height: 32 }} />
            <strong style={styles.logoText}>THE 유부</strong>
          </Link>
        </div>
        <nav style={styles.nav}>
          {menuItems.map((item, idx) => (
            <Link to={item.path} key={item.label} style={styles.navItem}>
              {idx !== 0 && <span style={styles.navDivider}>｜</span>}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',     // ✅ 화면 상단 고정
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',  // ✅ 배경 있어야 겹침 방지
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // ✅ 그림자 효과
    borderBottom: '1px solid #eee',
  },
  topInfo: {
    fontSize: 13,
    color: '#a89f93',
    textAlign: 'right',
    padding: '6px 24px 4px',
  },
  topDivider: {
    margin: '0 6px',
  },
  navWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 32px',
    gap: 32,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    color: '#111',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    fontSize: 18,
    fontFamily: '"Noto Sans KR", sans-serif',
    color: '#111',
    gap: 18,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#111',
  },
  navDivider: {
    color: '#ccc',
    fontSize: 18,
    fontWeight: 400,
  },
};