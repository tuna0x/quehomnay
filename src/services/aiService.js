// AI Service for Que Hom Nay using Google Gemini API
import { getSavedApiKey } from '../utils/storage';
import { rollFortuneLevel, getOfflineFortune } from './fallbackFortune';

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

function cleanAndParseJSON(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  return JSON.parse(cleaned);
}

// Auspicious metadata defaults by level
const LEVEL_METAS = {
  "Thượng": {
    mau_sac: "Vàng Ánh Kim",
    mau_hex: "#EAB308",
    con_so: "08, 68",
    gio_cat: "9h - 11h (Giờ Tỵ)"
  },
  "Trung": {
    mau_sac: "Xanh Ngọc Bích",
    mau_hex: "#059669",
    con_so: "16, 79",
    gio_cat: "13h - 15h (Giờ Mùi)"
  },
  "Hạ": {
    mau_sac: "Trắng Bạch Ngọc",
    mau_hex: "#F8FAFC",
    con_so: "04, 44",
    gio_cat: "15h - 17h (Giờ Thân)"
  }
};

export async function generateFortune({ name = '', question = '' }) {
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
    };
  }

  // 2. Pre-determine fortune level based on predefined ratio: 30% Thượng, 45% Trung, 25% Hạ
  const targetLevel = rollFortuneLevel();
  const apiKey = getSavedApiKey();

  if (!apiKey) {
    await new Promise(res => setTimeout(res, 1800));
    return getOfflineFortune({ name, question, preferredLevel: targetLevel });
  }

  const systemPrompt = `Bạn là một vị thầy xin xăm ở một ngôi chùa nhỏ tại Việt Nam, giọng văn cổ kính, ấm áp, hơi bí ẩn nhưng không sến súa, không dùng từ ngữ hiện đại/teencode.
Mỗi lượt xin quẻ, bạn viết MỘT quẻ mới, không lặp lại các quẻ trước, gồm:
tên quẻ (ngắn, từ 3-5 chữ, gợi hình ảnh thiên nhiên cổ điển như mây, trăng, tùng, hoa, nước), một câu lời quẻ kiểu thơ cổ (2 dòng lục bát hoặc thất ngôn, ngăn cách bởi dấu xuống dòng \\n),
phần giải nghĩa (2-3 câu, gắn kết ý nhị với điều người xin quẻ đang băn khoăn nếu có),
và một lời khuyên hành động cụ thể, thực tế (1 câu ngắn).
Trả lời CHỈ bằng JSON hợp lệ, không kèm markdown, không có lời dẫn.`;

  const userPrompt = `Tên người xin quẻ: ${name.trim() || "không rõ"}
Điều họ đang băn khoăn: ${question.trim() || "không nói cụ thể, cho quẻ tổng quát hôm nay"}
Mức quẻ cần viết: ${targetLevel}
Hãy viết nội dung quẻ khớp với mức trên, trả về đúng format:
{"ten_que": string, "loi_que": string, "giai_nghia": string, "loi_khuyen": string, "mau_sac": string, "con_so": string, "gio_cat": string}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 600,
          responseMimeType: "application/json"
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Gemini API error, falling back to offline engine");
      return getOfflineFortune({ name, question, preferredLevel: targetLevel });
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = cleanAndParseJSON(rawContent);

    if (parsed && parsed.ten_que && parsed.loi_que && parsed.giai_nghia && parsed.loi_khuyen) {
      const defaultMeta = LEVEL_METAS[targetLevel] || LEVEL_METAS["Trung"];
      return {
        ten_que: parsed.ten_que,
        muc: targetLevel,
        loi_que: parsed.loi_que,
        giai_nghia: parsed.giai_nghia,
        loi_khuyen: parsed.loi_khuyen,
        mau_sac: parsed.mau_sac || defaultMeta.mau_sac,
        mau_hex: defaultMeta.mau_hex,
        con_so: parsed.con_so || defaultMeta.con_so,
        gio_cat: parsed.gio_cat || defaultMeta.gio_cat,
        isAI: true
      };
    } else {
      return getOfflineFortune({ name, question, preferredLevel: targetLevel });
    }
  } catch (err) {
    clearTimeout(timeoutId);
    return getOfflineFortune({ name, question, preferredLevel: targetLevel });
  }
}
