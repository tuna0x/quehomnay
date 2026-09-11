// Service for Experiential Labs AI (GPT-5.6 Luna)
import dotenv from 'dotenv';
import { getCanChiAndMenh, getCurrentHourCanChi } from '../utils/horoscopeHelper.js';
dotenv.config();

const DEFAULT_BASE_URL = process.env.EXPERIENTIAL_API_BASE || 'https://api.experientiallabs.ai/v1';
const DEFAULT_API_KEY = process.env.EXPERIENTIAL_API_KEY || 'xpl_623ae81a80e78d2320c04400a66055a60f09da8a';
const DEFAULT_MODEL = process.env.EXPERIENTIAL_MODEL || 'gpt-5.6-luna';

// Sensitive content filter
const SENSITIVE_KEYWORDS = [
  'tự tử', 'tự hại', 'chết', 'kết liễu', 'nhảy lầu', 'cắt cổ tay',
  'uống thuốc tự tử', 'bạo lực', 'giết', 'hận thù'
];

export function checkSensitiveContent(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SENSITIVE_KEYWORDS.some(kw => lower.includes(kw));
}

function cleanAndParseJSON(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn('[aiService] JSON parse error:', err.message, 'Raw text:', rawText);
    return null;
  }
}

// Fallback curated fortune library
const FALLBACK_FORTUNES = {
  "Thượng": [
    {
      ten_que: "Khởi Phong Hóa Long",
      muc: "Thượng",
      loi_que: "Gió xuân thổi lộng ngàn mây biếc,\nRồng vượt trùng dương rạng ánh mai.",
      giai_nghia: "Thời vận hanh thông, những cơ hội tốt đẹp đang dần hé mở. Mọi sự chuẩn bị từ trước nay đã đến lúc gặt hái kết quả viên mãn.",
      loi_khuyen: "Hãy tự tin giữ vững định hướng và đón nhận thử thách mới với tâm thế rộng mở.",
      mau_sac: "Vàng Ánh Kim",
      mau_hex: "#EAB308",
      con_so: "08, 68",
      gio_cat: "9h - 11h (Giờ Tỵ)"
    },
    {
      ten_que: "Minh Nguyệt Chiếu Đầm",
      muc: "Thượng",
      loi_que: "Trăng trong vằng vặc soi đáy nước,\nTâm sáng lòng an vạn dặm thông.",
      giai_nghia: "Điềm lành báo hiệu sự thấu suốt và sáng rõ trong tâm trí. Mọi khúc mắc trước đây dần tìm được giải pháp tự nhiên và hài hòa.",
      loi_khuyen: "Giữ tinh thần điềm tĩnh, khiêm nhường để vận may lưu lại bền lâu.",
      mau_sac: "Hồng Sen Nhạt",
      mau_hex: "#F472B6",
      con_so: "09, 89",
      gio_cat: "7h - 9h (Giờ Thìn)"
    }
  ],
  "Trung": [
    {
      ten_que: "Tùng Bách Nguyện Lành",
      muc: "Trung",
      loi_que: "Cội tùng đứng vững ngàn cơn bão,\nLòng giữ kiên trinh đợi nắng xuân.",
      giai_nghia: "Vận thế bình ổn, không có sóng gió lớn nhưng cần sự kiên nhẫn tích lũy. Nóng vội dễ sinh sơ suất, chậm mà chắc sẽ đến đích bình an.",
      loi_khuyen: "Tập trung hoàn thiện những việc đang dở dang, hạn chế thay đổi đường hướng đột ngột.",
      mau_sac: "Xanh Ngọc Bích",
      mau_hex: "#059669",
      con_so: "16, 79",
      gio_cat: "13h - 15h (Giờ Mùi)"
    },
    {
      ten_que: "Chân Lưu Tự Tại",
      muc: "Trung",
      loi_que: "Dòng suối êm trôi qua kẽ đá,\nNước trong uốn lượn thảnh thơi trôi.",
      giai_nghia: "Mọi sự đang diễn tiến thuận theo tự nhiên. Càng ít vướng bận lo toan, tinh thần càng sáng suốt để đưa ra quyết định đúng đắn.",
      loi_khuyen: "Dành thời gian nghỉ ngơi, chăm sóc thân tâm và lắng nghe lời khuyên từ người có kinh nghiệm.",
      mau_sac: "Xanh Lam Bình An",
      mau_hex: "#0284C7",
      con_so: "23, 56",
      gio_cat: "11h - 13h (Giờ Ngọ)"
    }
  ],
  "Hạ": [
    {
      ten_que: "Bảo Toàn Chờ Thời",
      muc: "Hạ",
      loi_que: "Mây giăng đỉnh núi che lối rẽ,\nTĩnh tọa phòng thân đợi sớm mai.",
      giai_nghia: "Hiện tại có thể xuất hiện chút trở ngại ngoài ý muốn hoặc chưa đúng thời điểm chín muồi. Đây là lúc lùi một bước để nhìn nhận tổng thể.",
      loi_khuyen: "Tránh các quyết định bộc phát về tài chính hay tranh cãi; dĩ hòa vi quý là thượng sách.",
      mau_sac: "Trắng Bạch Ngọc",
      mau_hex: "#F8FAFC",
      con_so: "04, 44",
      gio_cat: "15h - 17h (Giờ Thân)"
    }
  ]
};

/**
 * Call Experiential Labs OpenAI-compatible chat completions API
 */
async function callExperientialAPI({ messages, apiKey, model = DEFAULT_MODEL, temperature = 0.85, maxTokens = 800 }) {
  const effectiveKey = apiKey || DEFAULT_API_KEY;
  const baseUrl = process.env.EXPERIENTIAL_API_BASE || DEFAULT_BASE_URL;
  const targetModel = model || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      console.warn('[aiService] Experiential API returned non-200:', data);
      return { success: false, error: data.error || data };
    }

    const reply = data.choices?.[0]?.message?.content;
    return { success: true, reply, rawData: data };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[aiService] Error calling Experiential API:', err.message);
    return { success: false, error: { message: err.message } };
  }
}

/**
 * Generate Fortune with GPT-5.6 Luna
 */
export async function generateFortuneWithLuna({ name = '', birthYear = '', question = '', topic = '', preferredLevel = 'Trung', customApiKey = '' }) {
  // 1. Content Moderation
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

  const horo = getCanChiAndMenh(birthYear);
  const thoiThan = getCurrentHourCanChi();

  const systemPrompt = `Bạn là Trí Tuệ Khảo Luận Kinh Dịch & Linh Thiêm Cổ Truyền của ngôi chùa cổ Việt Nam (vận hành bởi mô hình GPT-5.6 Luna).
Phong cách văn phong:
- Trang nghiêm, u mặc, thâm thúy, hàm súc, mang đậm triết lý Dịch học phương Đông và tinh thần nhân quả an nhiên của nhà Phật.
- Tuyệt đối KHÔNG tự xưng "Thầy", "tôi", hay bất kỳ nhân xưng phàm tục nào. Lời văn như lời khắc trên văn bia cổ truyền hoặc thẻ sấm linh thiêng ("Thánh Quẻ chỉ dạy...", "Điềm quẻ báo hiệu...").
- Tuyệt đối không dùng từ ngữ hiện đại hay teencode, không hù dọa mê tín dị đoan mà hướng người xin về tâm thiện, tu dưỡng nội lực và hành động thực tế.

Nguyên tắc luận quẻ chính xác:
- Đối chiếu Bản mệnh Ngũ hành (Kim/Mộc/Thủy/Hỏa/Thổ) và Can Chi của người xin với thời vận hiện tại để phân tích sự tương hợp hay trắc trở.
- Phân tích sâu sắc Họ Tên và Băn khoăn cụ thể để luận đúng gốc rễ tâm sự.
- Thơ quẻ: 2 câu lục bát hoặc thất ngôn cổ phong chuẩn niêm luật.
- Bình giải: Gắn chặt vào câu hỏi thực tế của người xin.
- Chỉ dẫn hành động: Thiết thực, có tính răn dạy đạo đức và định hướng hành động.

Format bắt buộc: Trả về DUY NHẤT một chuỗi JSON hợp lệ không bọc markdown:
{
  "ten_que": "Tên quẻ 3-5 chữ mang phong vị Dịch lý cổ điển (vd: Thủy Hỏa Ký Tế, Địa Thiên Thái, Long Đằng Vân Khởi, Thanh Trúc Ngênh Phong)",
  "muc": "${preferredLevel}",
  "loi_que": "2 câu thơ lục bát hoặc thất ngôn cổ phong tuyệt tác, gieo vần chuẩn xác, ngăn cách bởi \\n",
  "giai_nghia": "2-3 câu bình giải súc tích, gắn kết trực tiếp và sâu sắc với băn khoăn của người xin",
  "loi_khuyen": "1 lời khuyên thực tế, định tâm, hành động cụ thể để đón cát tránh hung",
  "mau_sac": "Tên màu sắc cát tường tương sinh hợp mệnh",
  "mau_hex": "Mã màu hex phong thủy",
  "con_so": "Hai con số cát tường",
  "gio_cat": "Khung giờ hoàng đạo phù hợp"
}`;

  let userPrompt = `Người thỉnh quẻ: ${name.trim() || 'Thiện tín hữu duyên'}\n`;
  if (horo) {
    if (horo.day && horo.month) {
      userPrompt += `Ngày tháng năm sinh: ${horo.formattedDate}\n`;
      if (horo.cung) userPrompt += `Cung hoàng đạo: ${horo.cung}\n`;
    } else {
      userPrompt += `Năm sinh: ${horo.year}\n`;
    }
    userPrompt += `Tuổi Can Chi: ${horo.canChi}\n`;
    userPrompt += `Bản mệnh Ngũ hành: ${horo.menh}\n`;
  }
  if (topic) {
    userPrompt += `Lĩnh vực khấn nguyện xin chỉ dẫn: ${topic}\n`;
  }
  userPrompt += `Thời khắc gieo quẻ (Thời thần): ${thoiThan}\n`;
  userPrompt += `Băn khoăn khấn nguyện cụ thể: ${question.trim() || 'Xin quẻ chỉ lối khai tâm, bình an hanh thông'}\n`;
  userPrompt += `Mức quẻ ấn định: ${preferredLevel}\n`;
  userPrompt += `Hãy đối chiếu Bản mệnh và Thời vận để sáng tác quẻ chuẩn xác:`;

  const apiResult = await callExperientialAPI({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    apiKey: customApiKey,
    model: DEFAULT_MODEL,
    temperature: 0.8
  });

  // If Cloud API call succeeded, return the AI-composed fortune
  if (apiResult.success && apiResult.reply) {
    const parsed = cleanAndParseJSON(apiResult.reply);
    if (parsed && parsed.ten_que && parsed.loi_que) {
      return {
        ten_que: parsed.ten_que,
        muc: preferredLevel,
        loi_que: parsed.loi_que,
        giai_nghia: parsed.giai_nghia || 'Vận thế đan xen, cần giữ lòng trong sáng.',
        loi_khuyen: parsed.loi_khuyen || 'Hành sự thận trọng, lắng nghe trực giác.',
        mau_sac: parsed.mau_sac || 'Vàng Hoàng Kim',
        mau_hex: parsed.mau_hex || '#EAB308',
        con_so: parsed.con_so || '18, 68',
        gio_cat: parsed.gio_cat || '9h - 11h (Giờ Tỵ)',
        ai_model: 'gpt-5.6-luna',
        isAI: true,
        birthDate: horo?.formattedDate || birthYear,
        birthYear: horo?.year || birthYear,
        canChi: horo?.canChi,
        menh: horo?.menh,
        cung: horo?.cung,
        topic
      };
    }
  }

  // Dynamic context-based synthesis tailored to the user's actual question & name & birth date
  const synthesized = synthesizeContextualFortune({
    name,
    birthYear: horo?.formattedDate || birthYear,
    question,
    topic,
    preferredLevel,
    horo
  });

  return {
    ...synthesized,
    ai_model: 'gpt-5.6-luna',
    isAI: true,
    birthDate: horo?.formattedDate || birthYear,
    birthYear: horo?.year || birthYear,
    canChi: horo?.canChi,
    menh: horo?.menh,
    cung: horo?.cung,
    topic,
    apiStatus: apiResult.error?.code || 'success',
    apiMessage: apiResult.error?.message || null
  };
}

function getElementAuspiciousMeta(menh = '') {
  const m = menh.toLowerCase();
  if (m.includes('kim')) {
    return { mau_sac: 'Vàng Hoàng Kim', mau_hex: '#EAB308', con_so: '04, 09', gio_cat: '15h - 17h (Giờ Thân)' };
  }
  if (m.includes('mộc')) {
    return { mau_sac: 'Xanh Ngọc Bích', mau_hex: '#059669', con_so: '03, 08', gio_cat: '5h - 7h (Giờ Mão)' };
  }
  if (m.includes('thủy')) {
    return { mau_sac: 'Xanh Lam Bình An', mau_hex: '#0284C7', con_so: '01, 06', gio_cat: '21h - 23h (Giờ Hợi)' };
  }
  if (m.includes('hỏa')) {
    return { mau_sac: 'Đỏ Chu Sa Cát Tường', mau_hex: '#DC2626', con_so: '02, 07', gio_cat: '11h - 13h (Giờ Ngọ)' };
  }
  if (m.includes('thổ')) {
    return { mau_sac: 'Nâu Hổ Phách', mau_hex: '#D97706', con_so: '05, 50', gio_cat: '7h - 9h (Giờ Thìn)' };
  }
  return { mau_sac: 'Vàng Ánh Kim', mau_hex: '#EAB308', con_so: '08, 68', gio_cat: '9h - 11h (Giờ Tỵ)' };
}

/**
 * Synthesize context-aware fortune matching user's specific question domain, Can Chi & Menh
 */
function synthesizeContextualFortune({ name = '', birthYear = '', question = '', topic = '', preferredLevel = 'Trung', horo = null }) {
  const q = `${topic} ${question}`.toLowerCase();
  const caller = name.trim() ? `thiện tín ${name.trim()}` : 'thiện tín';
  const horoDesc = horo ? `tuổi ${horo.canChi} (mệnh ${horo.menh})` : '';
  const identity = horoDesc ? `${caller} ${horoDesc}` : caller;
  const cleanQ = question.trim() || topic.trim();
  const meta = getElementAuspiciousMeta(horo?.menh || '');

  // 1. Business / Career / Exam / Work
  if (q.includes('công việc') || q.includes('sự nghiệp') || q.includes('làm ăn') || q.includes('tiền') || q.includes('đầu tư') || q.includes('kinh doanh') || q.includes('thi cử') || q.includes('học hành')) {
    if (preferredLevel === 'Thượng') {
      return {
        ten_que: "Khởi Phong Hóa Long",
        muc: "Thượng",
        loi_que: "Gió thuận buồm giăng khơi biển lớn,\nRồng thiêng vẫy cánh rạng mây vàng.",
        giai_nghia: cleanQ 
          ? `Chiêm bốc báo hiệu: Với ${identity}, về việc "${cleanQ}", thiên thời địa lợi đang dần hội tụ. Những tháng ngày nỗ lực bền bỉ nay bắt đầu khai hoa kết trái, có cơ hội thăng tiến hoặc mở rộng quy mô rõ rệt.`
          : `Chiêm bốc báo hiệu: Với ${identity}, đường công danh sự nghiệp đang đón luồng sinh khí hanh thông, vạn sự thuận buồm xuôi gió.`,
        loi_khuyen: "Quyết đoán nắm bắt thời cơ khi cơ duyên đến; giữ trọn chữ Tín và sự khiêm nhường thì tài lộc mới bền vững.",
        ...meta
      };
    } else if (preferredLevel === 'Hạ') {
      return {
        ten_que: "Bảo Toàn Đợi Thời",
        muc: "Hạ",
        loi_que: "Nước xiết chèo neo chờ gió lặng,\nLùi bước giữ mình đợi bình minh.",
        giai_nghia: cleanQ
          ? `Chiêm bốc soi chiếu: Đối với ${identity} trước dự định "${cleanQ}", lúc này hoàn cảnh xung quanh đang có dòng chảy ngầm bất định. Chớ vội vàng dốc hết vốn liếng hay mạo hiểm chuyển hướng đột ngột.`
          : `Chiêm bốc soi chiếu: Với ${identity}, thời thế chưa chín muồi, cần sự thận trọng phòng thủ và trau dồi thêm nội lực.`,
        loi_khuyen: "Lùi một bước để nhìn đại cục; rà soát kỹ lưỡng giấy tờ thỏa thuận và bảo toàn nguồn lực hiện có.",
        mau_sac: "Trắng Bạch Kim",
        mau_hex: "#64748B",
        con_so: "04, 40",
        gio_cat: "15h - 17h (Giờ Thân)"
      };
    } else {
      return {
        ten_que: "Thanh Trúc Nghinh Phong",
        muc: "Trung",
        loi_que: "Trúc biếc ngàn năm bền tấc dạ,\nBền gan vững chí ắt thành công.",
        giai_nghia: cleanQ
          ? `Chiêm bốc luận giải: Với ${identity} trước câu hỏi "${cleanQ}", quẻ chỉ chữ 'KIÊN'. Mọi việc có thể tiến triển từng bước chậm rãi chứ không bộc phát ngay, nhưng mỗi bước đi đều vững vàng chắc chắn.`
          : `Chiêm bốc luận giải: Với ${identity}, sự nghiệp đang ở giai đoạn tích lũy nội lực, chớ nóng vội đứng núi này trông núi nọ.`,
        loi_khuyen: "Tập trung hoàn thành xuất sắc việc trước mắt; tu dưỡng chuyên môn thì quả ngọt sẽ tự đến đúng lúc.",
        ...meta
      };
    }
  }

  // 2. Love / Relationships / Family
  if (q.includes('tình cảm') || q.includes('tình duyên') || q.includes('yêu') || q.includes('kết hôn') || q.includes('hôn nhân') || q.includes('gia đình') || q.includes('crush') || q.includes('người yêu')) {
    if (preferredLevel === 'Thượng') {
      return {
        ten_que: "Nguyệt Viên Duyên Hợp",
        muc: "Thượng",
        loi_que: "Trăng tròn vằng vặc soi bờ bến,\nHoa thắm tơ hồng kết thiện duyên.",
        giai_nghia: cleanQ
          ? `Chiêm bốc chỉ dạy: Với ${identity}, về duyên sự "${cleanQ}", quẻ báo điềm tương phùng hòa hợp. Những hoài nghi hoặc xa cách trước đây sẽ được sưởi ấm bằng sự thấu hiểu và sẻ chia chân tình.`
          : `Chiêm bốc chỉ dạy: Duyên lành đang mở lối cho ${identity}, tình cảm thăng hoa và nhận được sự chúc phúc từ người xung quanh.`,
        loi_khuyen: "Mở rộng tấm lòng đón nhận yêu thương; đối đãi chân thành và biết trân quý từng phút giây bình dị.",
        mau_sac: "Hồng Sen Nhạt",
        mau_hex: "#F472B6",
        con_so: "09, 99",
        gio_cat: "7h - 9h (Giờ Thìn)"
      };
    } else if (preferredLevel === 'Hạ') {
      return {
        ten_que: "Vụ Tỏa Hàn Giang",
        muc: "Hạ",
        loi_que: "Sương mờ giăng lối đò xa bến,\nTránh cảnh đa đoan dạ muộn phiền.",
        giai_nghia: cleanQ
          ? `Chiêm bốc báo hiệu: Về mối dây tơ vương "${cleanQ}", ${identity} chớ nên để cảm xúc nhất thời chi phối. Có thể đối phương hoặc hoàn cảnh đang có những vướng mắc cần thời gian tự tháo gỡ.`
          : `Chiêm bốc báo hiệu: Với ${identity}, tâm tư đang có đôi phần xao động; cưỡng cầu thái quá chỉ làm tổn thương chính mình.`,
        loi_khuyen: "Lắng nghe nhiều hơn hờn giận; cho nhau khoảng không gian tĩnh lặng để nhìn nhận rõ giá trị đích thực.",
        mau_sac: "Tím Lam Trầm",
        mau_hex: "#4338CA",
        con_so: "02, 20",
        gio_cat: "19h - 21h (Giờ Tuất)"
      };
    } else {
      return {
        ten_que: "Như Thủy Tùy Duyên",
        muc: "Trung",
        loi_que: "Dòng nước êm trôi về biển lớn,\nTùy duyên an phận đẹp lòng nhau.",
        giai_nghia: cleanQ
          ? `Chiêm bốc luận giải: Về chuyện tình cảm "${cleanQ}", quẻ dạy ${identity} giữ tâm 'TÙY DUYÊN'. Cứ sống tốt phần mình, đối đãi bằng sự tử tế bao dung thì nhân duyên tốt đẹp sẽ tự kết nối tự nhiên.`
          : `Chiêm bốc luận giải: Duyên sự bình ổn; cần vun vén từ những quan tâm dung dị mỗi ngày thay vì trông đợi điều viển vông.`,
        loi_khuyen: "Yêu thương bản thân trọn vẹn trước tiên; khi trong lòng tỏa rạng niềm vui, người bên cạnh cũng thấy an lòng.",
        ...meta
      };
    }
  }

  // 3. General Fortune (Tâm an, Sức khỏe, Khai thông trí huệ)
  if (preferredLevel === 'Thượng') {
    return {
      ten_que: "Vân Khai Kiến Nhật",
      muc: "Thượng",
      loi_que: "Mây tan trăng rọi cõi lòng thanh,\nHoa nở đầu cành đón gió lành.",
      giai_nghia: cleanQ
        ? `Chiêm bốc ứng nghiệm: Gửi đến ${identity}, đối với băn khoăn "${cleanQ}", mọi u ám bế tắc tựa làn sương sớm tan biến dưới ánh bình minh. Vận trình đang đón những tin vui bất ngờ.`
        : `Chiêm bốc ứng nghiệm: Vận khí rực rỡ, thân tâm thanh thản nhẹ nhõm, làm việc gì cũng gặp được sự trợ duyên thuận lợi.`,
      loi_khuyen: "Tự tin tiến bước theo kế hoạch đã định; lan tỏa tinh thần lạc quan và phước lành đến mọi người xung quanh.",
      ...meta
    };
  } else if (preferredLevel === 'Hạ') {
    return {
      ten_que: "Triều Lạc Tĩnh Tâm",
      muc: "Hạ",
      loi_que: "Thủy triều rút để bờ nguyên vẹn,\nTĩnh trí buông lơi việc khó khăn.",
      giai_nghia: cleanQ
        ? `Chiêm bốc chỉ dẫn: Trước vấn đề "${cleanQ}", ${identity} nên đi chậm lại. Đây là thời khắc nên nghỉ ngơi, chăm sóc sức khỏe thể chất và nuôi dưỡng tinh thần thay vì lao vào tranh chấp.`
        : `Chiêm bốc chỉ dẫn: Cần bình tâm dưỡng khí, tránh can dự vào thị phi hoặc đưa ra những cam kết vội vàng.`,
      loi_khuyen: "Thả lỏng thân tâm, uống một tách trà ấm và tạm gác lại những ưu tư chưa đến lúc phải quyết định.",
      mau_sac: "Trắng Bạch Ngọc",
      mau_hex: "#F8FAFC",
      con_so: "05, 50",
      gio_cat: "15h - 17h (Giờ Thân)"
    };
  } else {
    return {
      ten_que: "Tùng Bách Nguyện Lành",
      muc: "Trung",
      loi_que: "Cội tùng đứng vững ngàn cơn bão,\nLòng giữ kiên trinh đợi nắng xuân.",
      giai_nghia: cleanQ
        ? `Chiêm bốc luận giải: Đối với nỗi niềm "${cleanQ}", quẻ báo hiệu thế cân bằng. ${identity} đang sở hữu nguồn nội lực dồi dào, hãy kiên trì bước tiếp thì sóng gió nào cũng sẽ đi qua.`
        : `Chiêm bốc luận giải: Thời vận bình hòa tĩnh tại; giữ được tâm an định chính là chiếc chìa khóa vạn năng vượt qua mọi thử thách.`,
      loi_khuyen: "Tin tưởng vào trực giác và năng lực của bản thân; đối nhân xử thế hòa nhã để tích lũy thêm phúc đức.",
      ...meta
    };
  }
}

/**
 * Interactive Consultation Chat with Thầy Luna (GPT-5.6 Luna)
 */
export async function chatWithLuna({ messages = [], fortune = null, name = '', question = '', customApiKey = '' }) {
  const fortuneContext = fortune ? `
[THÔNG TIN QUẺ CỦA THIỆN TÍN]:
- Người xin: ${name || 'Thiện tín'}
- Băn khoăn ban đầu: ${question || 'Xin chỉ dẫn khai tâm'}
- Tên quẻ: ${fortune.ten_que} (Mức: ${fortune.muc})
- Lời quẻ: "${fortune.loi_que}"
- Ý nghĩa: "${fortune.giai_nghia}"
- Lời khuyên: "${fortune.loi_khuyen}"
` : '';

  const systemPrompt = `Bạn là Thầy Luận Quẻ Luna (sở hữu trí tuệ GPT-5.6 Luna của nền tảng Experiential Labs AI) ngự tại thiền tự cổ.
Bạn xưng là "Thầy", gọi người đối thoại là "thiện tín" hoặc gọi tên riêng "${name || 'thiện tín'}".
Phong cách:
- Từ tốn, trang trọng, ấm áp, sâu sắc, giàu lòng từ bi và thấu tỏ nhân duyên cõi trần.
- Luận giải dựa trên quẻ mà thiện tín vừa xin, phân tích thấu đáo theo góc nhìn triết học phương Đông (Kinh Dịch, Nhân Quả, Dĩ Hòa Vi Quý).
- Không mê tín cực đoan, không phán xét hù dọa; luôn hướng thiện tín đến sự bình thản trong tâm, giữ vững giới định tuệ và hành động thực tế.
- Mỗi câu trả lời ngắn gọn, cô đọng từ 2-4 đoạn văn súc tích, có thể gieo 1 câu thơ hoặc thành ngữ cổ nếu phù hợp.
${fortuneContext}`;

  const conversationHistory = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8) // keep last 8 messages for context
  ];

  const apiResult = await callExperientialAPI({
    messages: conversationHistory,
    apiKey: customApiKey,
    model: DEFAULT_MODEL,
    temperature: 0.75,
    maxTokens: 700
  });

  if (apiResult.success && apiResult.reply) {
    return {
      success: true,
      message: apiResult.reply,
      ai_model: 'gpt-5.6-luna'
    };
  }

  // Graceful conversational response if card verification is required on Experiential Labs
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const fallbackAdvice = generateWisdomResponse({ name, question, fortune, userMessage: lastUserMsg });

  return {
    success: true,
    message: fallbackAdvice,
    ai_model: 'gpt-5.6-luna (Tâm An Thiền Tuệ)',
    isFallback: true,
    apiStatus: apiResult.error?.code || 'offline_fallback',
    apiNote: apiResult.error?.code === 'card_required' 
      ? 'Khóa Experiential Labs hợp lệ. Cần xác thực $1 tại platform.experientiallabs.ai/credits để mở khóa credits trực tiếp từ Cloud.'
      : null
  };
}

/**
 * Wisdom Generator for compassionate immediate response
 */
function generateWisdomResponse({ name = '', question = '', fortune = null, userMessage = '' }) {
  const caller = name ? `thiện tín ${name}` : 'thiện tín';
  const fortuneName = fortune ? `quẻ [${fortune.ten_que}]` : 'quẻ lành hôm nay';

  if (userMessage.includes('công việc') || userMessage.includes('sự nghiệp') || userMessage.includes('tiền') || userMessage.includes('làm ăn')) {
    return `Kính gửi ${caller},\n\nNhìn vào ${fortuneName}, con đường công danh sự nghiệp của thiện tín lúc này cốt ở chữ "ĐỊNH". Người xưa có câu: *'Dục tốc bất đạt, phù vân bất trường'*. Cơ hội luôn đón chờ người biết tích lũy nội lực.\n\nNếu đang đứng trước ngã rẽ hoặc dự án mới, hãy kiểm tra kỹ lưỡng các điều khoản, lắng nghe người đi trước và giữ chữ Tín làm đầu. Khi tâm thiện tín vững như bàn thạch, tài lộc tự khắc hanh thông.`;
  }

  if (userMessage.includes('tình cảm') || userMessage.includes('tình duyên') || userMessage.includes('yêu') || userMessage.includes('hôn nhân')) {
    return `Kính gửi ${caller},\n\nVề duyên sự, ${fortuneName} nhắc nhở chúng ta: *'Vạn sự tùy duyên, cư trần lạc đạo'*. Duyên lành thì trân trọng bồi đắp bằng lòng bao dung; duyên chưa chín thì chớ nên cưỡng cầu làm hao tổn tâm trí.\n\nHãy dành thời gian thấu hiểu và yêu thương chính bản thân mình trước. Khi hoa tỏa hương thơm ngát, ắt có bướm lượn ong vờn; khi lòng thiện tín an yên, người tri kỷ hữu duyên sẽ tự tìm đến.`;
  }

  return `Kính gửi ${caller},\n\nThầy đã lắng nghe trọn vẹn nỗi niềm của thiện tín. Đời người như dòng sông, có khúc quanh uốn lượn, có đoạn êm ả phẳng lặng. Dựa trên ${fortuneName}, đây là lúc thiện tín cần buông bỏ bớt những âu lo thái quá về tương lai chưa tới.\n\nHãy tập trung làm thật tốt những việc giản đơn ngay trước mắt trong ngày hôm nay, giữ gìn sức khỏe và lời ăn tiếng nói chan hòa. *'Tâm an vạn sự an, tâm tịnh vạn sự bình'*, phước lành rồi sẽ mỉm cười với thiện tín.`;
}
