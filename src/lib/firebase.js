// ✅ Firebase SDK 초기화
import { initializeApp } from 'firebase/app';

// ✅ Firebase Realtime Database
import { getDatabase, ref as dbRef, set, get, update, push, remove } from 'firebase/database';

// ✅ Firebase Storage
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// ✅ Firebase Auth
import { getAuth } from 'firebase/auth';

// ✅ 이미지 압축
import imageCompression from 'browser-image-compression';

// 🔑 Firebase 설정값
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DB_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// 🔧 초기화 및 export
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

//
// ──────────────────────────────────────────────
// 🔸 메뉴 등록
// ──────────────────────────────────────────────
export async function addMenu({ file, name, description, price, category, tags }) {
  const imageRef = storageRef(storage, `menus/${file.name}`);
  try {
    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);
    const newMenuRef = push(dbRef(db, "menus"));
    await set(newMenuRef, {
      name,
      description,
      price,
      category,
      tags,
      imageUrl,
      createdAt: Date.now(),
    });
  } catch (err) {
    await deleteObject(imageRef); // 실패 시 업로드된 이미지 제거
    throw err;
  }
}

// 🔸 메뉴 수정
export async function updateMenu(menuId, { file, name, description, price, category, tags }) {
  const menuRef = dbRef(db, `menus/${menuId}`);

  let imageUrl = null;
  if (file) {
    const filename = `menus/${Date.now()}_${file.name}`;
    const imageRef = storageRef(storage, filename);
    await uploadBytes(imageRef, file);
    imageUrl = await getDownloadURL(imageRef);
  }

  const updateData = {
    name,
    description,
    price,
    category,
    tags,
    updatedAt: Date.now(),
  };

  if (imageUrl) {
    updateData.imageUrl = imageUrl;
  }

  await update(menuRef, updateData);
}

//
// 🔸 메뉴 전체 조회
//
export async function fetchMenus() {
  const snapshot = await get(dbRef(db, "menus"));
  return snapshot.exists() ? snapshot.val() : {};
}

//
// 🔸 메뉴 삭제
//
export async function deleteMenu(menuId, imageUrl) {
  await remove(dbRef(db, `menus/${menuId}`)); // DB
  const path = new URL(imageUrl).pathname;
  const cleanPath = decodeURIComponent(
    path.replace(/^\/v0\/b\/[^/]+\/o\//, '').split('?')[0]
  );
  await deleteObject(storageRef(storage, cleanPath)); // Storage
}
// ------------------- 후기 ------------------- //
// ✅ 후기 등록 (여러 이미지 + 압축 + DB 저장)
export async function addReview({ nickname, password, content, files }) {
  const imageUrls = [];

  for (let file of files) {
    // 🔹 이미지 압축
    const compressed = await imageCompression(file, { maxSizeMB: 0.5 });

    // 🔹 Storage 경로
    const filename = `${Date.now()}_${file.name}`;
    const imageRef = storageRef(storage, `reviews/${filename}`);
    await uploadBytes(imageRef, compressed);

    const imageUrl = await getDownloadURL(imageRef);
    imageUrls.push(imageUrl);
  }

  // 🔹 리뷰 객체 생성
  const newReviewRef = push(dbRef(db, 'reviews'));
  await set(newReviewRef, {
    nickname,
    password,      // 4자리 숫자 저장 (해시처리는 선택)
    content,
    images: imageUrls,
    createdAt: Date.now(),
    isVisible: true,
  });
}

// 🔍 공개된 리뷰만 가져오기
export async function fetchVisibleReviews() {
  const snapshot = await get(dbRef(db, 'reviews'));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).filter(([_, r]) => r.isVisible);
}

// 🔍 전체 리뷰 가져오기 (관리자용)
export async function fetchAllReviews() {
  const snapshot = await get(dbRef(db, 'reviews'));
  return snapshot.exists() ? snapshot.val() : {};
}

// 👁️ 숨김 처리
export async function hideReview(reviewId) {
  await update(dbRef(db, `reviews/${reviewId}`), { isVisible: false });
}

// 👁️ 숨김 해제 처리
export async function unhideReview(reviewId) {
  await update(dbRef(db, `reviews/${reviewId}`), { isVisible: true });
}


// ------------------- 홈 화면 ------------------- //
// 🔸 소개글 저장
//
export async function saveIntroduction({ title, body, file }) {
  let imageUrl = "";
  if (file) {
    const imageRef = storageRef(storage, `introductions/${file.name}`);
    await uploadBytes(imageRef, file);
    imageUrl = await getDownloadURL(imageRef);
  }

  await set(dbRef(db, "introductions/main"), {
    title,
    body,
    imageUrl,
    updatedAt: Date.now(),
  });
}

//
// 🔸 홈 슬라이드 이미지 업로드
export async function uploadSlideImage(file, slot) {
  // ⚠️ slot 고정 경로 → 고유 경로로 변경
  const filename = `slot-${slot}-${Date.now()}.jpg`;
  const fileRef = storageRef(storage, `intro-slides/${filename}`);

  await uploadBytes(fileRef, file);
  const imageUrl = await getDownloadURL(fileRef); // 이 URL을 그대로 DB에 저장
  await set(dbRef(db, `introSlides/${slot}`), { imageUrl }); // DB에는 URL만 저장
  return imageUrl;
}
//
// 🔸 홈 슬라이드 이미지 삭제
export async function deleteSlideImage(slot) {
  const snapshot = await get(dbRef(db, `introSlides/${slot}`));
  if (!snapshot.exists()) return;

  const { imageUrl } = snapshot.val();
  if (imageUrl) {
    const path = new URL(imageUrl).pathname;
    const cleanPath = decodeURIComponent(path.replace(/^\/v0\/b\/[^/]+\/o\//, '').split('?')[0]);
    const fileRef = storageRef(storage, cleanPath);
    await deleteObject(fileRef);
  }

  await remove(dbRef(db, `introSlides/${slot}`));
}

// 🔸 홈 슬라이드 이미지 불러오기
export async function fetchSlideImages() {
  const snapshot = await get(dbRef(db, "introSlides"));
  return snapshot.exists() ? snapshot.val() : {};
}


// 매장 정보 저장 함수
export async function saveStoreInfo({ address, latitude, longitude, description }) {
  const ref = dbRef(db, 'storeInfo');
  await set(ref, {
    address,
    latitude,
    longitude,
    description,
    updatedAt: Date.now(),
  });
}

// 매장 정보 불러오기 함수
export async function fetchStoreInfo() {
  const snapshot = await get(dbRef(db, 'storeInfo'));
  return snapshot.exists() ? snapshot.val() : null;
}


// 🔸 업로드
export async function uploadStoreImage(file) {
  const filename = `store-${Date.now()}.jpg`;
  const fileRef = storageRef(storage, `store-images/${filename}`);
  await uploadBytes(fileRef, file);
  const imageUrl = await getDownloadURL(fileRef);

  // DB에 저장
  const newImageRef = push(dbRef(db, "storeImages"));
  await set(newImageRef, imageUrl);

  return imageUrl;
}

// 🔸 삭제
export async function deleteStoreImage(imageUrl) {
  const path = decodeURIComponent(
    new URL(imageUrl).pathname.split("/o/")[1].split("?")[0]
  );
  const fileRef = storageRef(storage, path);
  await deleteObject(fileRef);

  // DB에서 삭제
  const snapshot = await get(dbRef(db, "storeImages"));
  if (!snapshot.exists()) return;
  const all = snapshot.val();
  const targetKey = Object.keys(all).find((key) => all[key] === imageUrl);
  if (targetKey) {
    await remove(dbRef(db, `storeImages/${targetKey}`));
  }
}

// 🔸 전체 이미지 불러오기
export async function fetchStoreImages() {
  const snapshot = await get(dbRef(db, "storeImages"));
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val()); // [url, url, ...]
}
// ------------------- 이벤트 ------------------- //
// 이벤트 목록 불러오기
export async function fetchEvents() {
  const snapshot = await get(dbRef(db, 'events'));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val()).sort((a, b) => b[1].createdAt - a[1].createdAt);
}

// 이벤트 등록 
export async function addEvent({ title, description, startDate, endDate, file }) {
  // 🔹 Storage 경로 구성
  const newEventRef = push(dbRef(db, 'events'));
  const eventId = newEventRef.key;
  const imageRef = storageRef(storage, `events/${eventId}/${file.name}`);

  // 🔹 이미지 업로드
  await uploadBytes(imageRef, file);
  const imageUrl = await getDownloadURL(imageRef);

  // 🔹 DB 저장
  await set(newEventRef, {
    title,
    description,
    startDate,
    endDate,
    imageUrl,
    participants: 0,
    views: 0,
    createdAt: Date.now(),
  });
}

// 이벤트 상세 가져오기
export async function getEventDetail(eventId) {
  const snapshot = await get(dbRef(db, `events/${eventId}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// 이벤트 조회수 1 증가
export async function incrementEventViews(eventId) {
  const eventRef = dbRef(db, `events/${eventId}/views`);
  const snapshot = await get(eventRef);
  const current = snapshot.exists() ? snapshot.val() : 0;
  await set(eventRef, current + 1);
}

// 🔸 후기 수정
export async function updateReview(reviewId, updatedFields) {
  const reviewRef = dbRef(db, `reviews/${reviewId}`);
  await update(reviewRef, {
    ...updatedFields,
    updatedAt: Date.now(),
  });
}

// 이벤트 수정
export async function updateEvent(eventId, updatedData) {
  const eventRef = dbRef(db, `events/${eventId}`);
  await update(eventRef, {
    ...updatedData,
    updatedAt: Date.now(),
  });
}

// 🔸 이벤트 삭제
export async function deleteEvent(eventId) {
  await remove(dbRef(db, `events/${eventId}`));
}