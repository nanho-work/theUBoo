export default function UserFooter() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.info}>
          <p><strong>상호명:</strong> 더 유부 (The Uboo)</p>
          <p><strong>사업자등록번호:</strong> 123-45-67890</p>
          <p><strong>대표자:</strong> 홍길동</p>
          <p><strong>고객센터:</strong> 02-1234-5678</p>
          <p><strong>이메일:</strong> contact@theuboo.com</p>
        </div>

        <div style={styles.links}>
          <a href="/terms" style={styles.link}>이용약관</a>
          <a href="/privacy" style={styles.link}>개인정보처리방침</a>
        </div>
      </div>

      <div style={styles.copy}>
        © 2025 The Uboo. All rights reserved.
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#222',
    color: '#ccc',
    padding: '2rem 1.5rem',
    fontSize: 14,
    marginTop: 'auto',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
    maxWidth: 960,
    margin: '0 auto',
  },
  info: {
    lineHeight: 1.6,
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
  },
  copy: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: 12,
    color: '#888',
  },
};