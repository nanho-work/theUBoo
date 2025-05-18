import UserHeader from '@/components/UserHeader';
import UserFooter from '@/components/UserFooter';

export default function UserLayout({ children }) {
  return (
    <>
      <UserHeader />
      <main style={styles.main}>{children}</main>
      <UserFooter />
    </>
  );
}

const styles = {
  main: {
    paddingTop: 110, // 🧷 고정 헤더(약 110px)만큼 여백 확보
    minHeight: 'calc(100vh - 160px)', // ✅ 푸터까지 고려한 최소 높이
    backgroundColor: '#fafafa',       // (선택) 전체 배경 지정
  },
};