// src/pages/AdminPage.jsx
import { useState } from 'react';
import MenuManage from '@/admin/MenuManage';
import HomeManage from '@/admin/HomeManage';
import ReviewManage from '@/admin/ReviewManage';
import AdminHeader from "@/admin/AdminHeader.jsx";
import EventManage from '@/admin/EventManage';

export default function AdminPage() {
  const [tab, setTab] = useState('home');

  return (
    <div style={{ margin: 0, padding: 0 }}> {/* 여기서 간섭 없도록 설정 */}
      <AdminHeader tab={tab} setTab={setTab} />
      <main style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: `'Segoe UI', 'Noto Sans KR', sans-serif`,
      }}>
        {tab === 'home' && <HomeManage />}
        {tab === 'menu' && <MenuManage />}
        {tab === 'review' && <ReviewManage />}
        {tab === 'event' && <EventManage />}
      </main>
    </div>
  );
}