// /pages/api/theuboo.ts (전체 통합코드 + 추천 확장 반영)
import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { ref, push, set, get, update, remove } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';

const storage = getStorage();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const type = query.type as string;

  if (!type) return res.status(400).json({ error: 'type 쿼리 파라미터가 필요합니다.' });

  try {
    switch (type) {
      case 'menu': {
        const menuRef = ref(adminDb, 'menus');

        if (method === 'GET') {
          const snap = await get(menuRef);
          return res.status(200).json(snap.exists() ? snap.val() : {});
        }

        if (method === 'POST') {
          const { name, description, price, category, tags, imageUrl } = body;
          if (!name || !description || !price || !category || !imageUrl) {
            return res.status(400).json({ error: '메뉴 필수 항목 누락' });
          }
          const newRef = push(menuRef);
          await set(newRef, {
            name,
            description,
            price,
            category,
            tags,
            imageUrl,
            createdAt: Date.now(),
          });
          return res.status(200).json({ success: true, id: newRef.key });
        }

        if (method === 'DELETE') {
          const id = query.id as string;
          const imageUrl = query.imageUrl as string;
          if (!id || !imageUrl) return res.status(400).json({ error: 'id와 imageUrl 필요' });

          await remove(ref(adminDb, `menus/${id}`));
          const path = decodeURIComponent(new URL(imageUrl).pathname.replace(/^\/v0\/b\/[^/]+\/o\//, '').split('?')[0]);
          await storage.bucket().file(path).delete();
          return res.status(200).json({ success: true });
        }
        break;
      }

      case 'review': {
        const reviewRef = ref(adminDb, 'reviews');

        if (method === 'GET') {
          const snap = await get(reviewRef);
          if (!snap.exists()) return res.status(200).json([]);
          const data = Object.entries(snap.val()).filter(([_, r]: any) => r.isVisible);
          return res.status(200).json(Object.fromEntries(data));
        }

        if (method === 'POST') {
          const { nickname, password, content, images } = body;
          if (!nickname || !password || !content) {
            return res.status(400).json({ error: '후기 필수 항목 누락' });
          }
          const newRef = push(reviewRef);
          await set(newRef, {
            nickname,
            password,
            content,
            images: images ?? [],
            isVisible: true,
            createdAt: Date.now(),
          });
          return res.status(200).json({ success: true, id: newRef.key });
        }

        if (method === 'PATCH') {
          const id = query.id as string;
          const hide = query.hide === 'true';
          if (!id) return res.status(400).json({ error: 'id 쿼리 필요' });
          await update(ref(adminDb, `reviews/${id}`), { isVisible: !hide });
          return res.status(200).json({ success: true });
        }
        break;
      }

      case 'event': {
        const eventRef = ref(adminDb, 'events');

        if (method === 'GET') {
          const id = query.id as string;
          if (id) {
            const snap = await get(ref(adminDb, `events/${id}`));
            return res.status(200).json(snap.exists() ? snap.val() : null);
          }
          const snap = await get(eventRef);
          if (!snap.exists()) return res.status(200).json([]);
          const data = Object.entries(snap.val()).sort(([, a]: any, [, b]: any) => b.createdAt - a.createdAt);
          return res.status(200).json(Object.fromEntries(data));
        }

        if (method === 'POST') {
          const { title, description, startDate, endDate, imageUrl } = body;
          if (!title || !description || !startDate || !endDate || !imageUrl) {
            return res.status(400).json({ error: '이벤트 필수 항목 누락' });
          }
          const newRef = push(eventRef);
          await set(newRef, {
            title,
            description,
            startDate,
            endDate,
            imageUrl,
            participants: 0,
            views: 0,
            createdAt: Date.now(),
          });
          return res.status(200).json({ success: true, id: newRef.key });
        }

        if (method === 'PATCH') {
          const id = query.id as string;
          if (!id) return res.status(400).json({ error: '이벤트 id 필요' });
          const viewsRef = ref(adminDb, `events/${id}/views`);
          const snap = await get(viewsRef);
          const current = snap.exists() ? snap.val() : 0;
          await set(viewsRef, current + 1);
          return res.status(200).json({ success: true });
        }
        break;
      }

      case 'store': {
        const storeRef = ref(adminDb, 'storeInfo');
        const slidesRef = ref(adminDb, 'introSlides');

        if (method === 'GET') {
          const [storeSnap, slideSnap] = await Promise.all([get(storeRef), get(slidesRef)]);
          return res.status(200).json({
            storeInfo: storeSnap.exists() ? storeSnap.val() : null,
            introSlides: slideSnap.exists() ? slideSnap.val() : {},
          });
        }

        if (method === 'POST') {
          const { address, zipcode, latitude, longitude, description, introSlides } = body;
          if (!address || !zipcode || !latitude || !longitude || !description) {
            return res.status(400).json({ error: '매장 필수 항목 누락' });
          }
          await set(storeRef, {
            address,
            zipcode,
            latitude,
            longitude,
            description,
            updatedAt: Date.now(),
          });
          if (introSlides && typeof introSlides === 'object') {
            const updates: Record<string, any> = {};
            Object.entries(introSlides).forEach(([slot, url]) => {
              updates[slot] = { imageUrl: url };
            });
            await set(slidesRef, updates);
          }
          return res.status(200).json({ success: true });
        }
        break;
      }

      case 'slide': {
        if (method === 'DELETE') {
          const slot = query.slot as string;
          if (!slot) return res.status(400).json({ error: 'slot 쿼리 필요' });
          const snapshot = await get(ref(adminDb, `introSlides/${slot}`));
          if (!snapshot.exists()) return res.status(404).json({ error: '슬라이드 없음' });
          const { imageUrl } = snapshot.val();
          const path = decodeURIComponent(new URL(imageUrl).pathname.replace(/^\/v0\/b\/[^/]+\/o\//, '').split('?')[0]);
          await storage.bucket().file(path).delete();
          await remove(ref(adminDb, `introSlides/${slot}`));
          return res.status(200).json({ success: true });
        }
        break;
      }

      case 'storeImage': {
        if (method === 'DELETE') {
          const imageUrl = query.url as string;
          if (!imageUrl) return res.status(400).json({ error: 'url 쿼리 필요' });
          const path = decodeURIComponent(new URL(imageUrl).pathname.replace(/^\/v0\/b\/[^/]+\/o\//, '').split('?')[0]);
          await storage.bucket().file(path).delete();
          const snapshot = await get(ref(adminDb, 'storeImages'));
          if (snapshot.exists()) {
            const all = snapshot.val();
            const targetKey = Object.keys(all).find((key) => all[key] === imageUrl);
            if (targetKey) await remove(ref(adminDb, `storeImages/${targetKey}`));
          }
          return res.status(200).json({ success: true });
        }

        if (method === 'GET') {
          const snap = await get(ref(adminDb, 'storeImages'));
          return res.status(200).json(snap.exists() ? Object.values(snap.val()) : []);
        }
        break;
      }

      case 'introduction': {
        if (method === 'POST') {
          const { title, body, imageUrl } = body;
          if (!title || !body) return res.status(400).json({ error: 'title, body 필요' });
          await set(ref(adminDb, 'introductions/main'), {
            title,
            body,
            imageUrl,
            updatedAt: Date.now(),
          });
          return res.status(200).json({ success: true });
        }
        break;
      }

      default:
        return res.status(400).json({ error: '지원하지 않는 type입니다.' });
    }
  } catch (error) {
    console.error(`API 오류 (${type})`, error);
    return res.status(500).json({ error: '서버 오류' });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}