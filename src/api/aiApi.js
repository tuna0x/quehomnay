// AI Service for Que Hom Nay using Experiential Labs AI (GPT-5.6 Luna) & Offline Temple Engine
import { getSavedApiKey } from '../utils/preferences.js';
import { rollFortuneLevel, getOfflineFortune } from '../data/fallbackFortunes.js';

// Sensitive words list for gentle content moderation
const SENSITIVE_KEYWORDS = [
  'tự tử', 'tự hại', 'chết', 'kết liễu', 'nhảy lầu', 'cắt cổ tay', 
  'uống thuốc tự tử', 'bạo lực', 'giết', 'hận thù'
];

export function checkSensitiveContent(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SENSITIVE_KEYWORDS.some(keyword => lower.includes(keyword));
}

/**
 * Generate Fortune using Experiential Labs GPT-5.6 Luna backend
 */
export async function generateFortune({ name = '', birthYear = '', question = '', topic = '' }) {
  // 1. Content Moderation check
  if (checkSensitiveContent(name) || checkSensitiveContent(question)) {
    return {
      ten_que: "Tâm An Vạn Sự Bình",
      muc: "Trung",
      loi_que: "Gió lặng mây dừng sương sớm tan,\nLòng người buông xả cõi nhân gian.",
      giai_nghia: "Cuộc sống đôi lúc như biển động chập chùng, nhưng sau cơn mưa trời lại rạng. Mọi khó khăn thử thách hiện tại đều chỉ là khúc quanh tạm thời, bên cạnh bạn luôn có những tấm lòng ấm áp sẵn sàng lắng nghe.",
      loi_khuyen: "Hãy hít thở thật sâu, chia sẻ ngay nỗi lòng này với người thân tin cậy hoặc gọi tổng đài tâm lý (1800 1567 hoặc 1900 6233) để được sẻ chia bạn nhé.",
      mau_sac: "Xanh Lam Bình An",
      mau_hex: "#0284C7",
      con_so: "09, 99",
      gio_cat: "11h - 13h (Giờ Ngọ)",
      isModerated: true,
      ai_model: "gpt-5.6-luna"
    };
  }

  const preferredLevel = rollFortuneLevel();
  const customApiKey = getSavedApiKey();

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        birthYear,
        question,
        topic,
        preferredLevel,
        customApiKey
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.fortune) {
        return data.fortune;
      }
    }
  } catch (err) {
    console.warn('[aiApi] Backend AI call failed, falling back to local engine:', err.message);
  }

  // Local fallback if backend is unreachable
  await new Promise(res => setTimeout(res, 800));
  return getOfflineFortune({ name, question, preferredLevel });
}

/**
 * Chat with Thầy Luna (GPT-5.6 Luna)
 */
export async function chatWithLuna({ messages = [], fortune = null, name = '', question = '' }) {
  const customApiKey = getSavedApiKey();

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        fortune,
        name,
        question,
        customApiKey
      })
    });

    if (response.ok) {
      return await response.json();
    }
    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      message: errorData.message || 'Chưa thể kết nối tới Thầy Luna lúc này, xin thiện tín thử lại sau ít phút.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Lỗi mạng: Không thể kết nối tới máy chủ luận giải AI.'
    };
  }
}

/**
 * Get AI status from backend
 */
export async function getAiStatus() {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return {
    configured: false,
    model: 'gpt-5.6-luna',
    provider: 'Experiential Labs AI'
  };
}
