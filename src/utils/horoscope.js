// Client-side horoscope helper for real-time Can Chi & Ban Menh calculation

const THIEN_CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const DIA_CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

const MENH_MAP = {
  'Giáp Tý': 'Hải Trung Kim', 'Ất Sửu': 'Hải Trung Kim',
  'Bính Dần': 'Lư Trung Hỏa', 'Đinh Mão': 'Lư Trung Hỏa',
  'Mậu Thìn': 'Đại Lâm Mộc', 'Kỷ Tỵ': 'Đại Lâm Mộc',
  'Canh Ngọ': 'Lộ Bàng Thổ', 'Tân Mùi': 'Lộ Bàng Thổ',
  'Nhâm Thân': 'Kiếm Phong Kim', 'Quý Dậu': 'Kiếm Phong Kim',
  'Giáp Tuất': 'Sơn Đầu Hỏa', 'Ất Hợi': 'Sơn Đầu Hỏa',
  'Bính Tý': 'Giản Hạ Thủy', 'Đinh Sửu': 'Giản Hạ Thủy',
  'Mậu Dần': 'Thành Đầu Thổ', 'Kỷ Mão': 'Thành Đầu Thổ',
  'Canh Thìn': 'Bạch Lạp Kim', 'Tân Tỵ': 'Bạch Lạp Kim',
  'Nhâm Ngọ': 'Dương Liễu Mộc', 'Quý Mùi': 'Dương Liễu Mộc',
  'Giáp Thân': 'Tuyền Trung Thủy', 'Ất Dậu': 'Tuyền Trung Thủy',
  'Bính Tuất': 'Ốc Thượng Thổ', 'Đinh Hợi': 'Ốc Thượng Thổ',
  'Mậu Tý': 'Tích Lịch Hỏa', 'Kỷ Sửu': 'Tích Lịch Hỏa',
  'Canh Dần': 'Tùng Bách Mộc', 'Tân Mão': 'Tùng Bách Mộc',
  'Nhâm Thìn': 'Trường Lưu Thủy', 'Quý Tỵ': 'Trường Lưu Thủy',
  'Giáp Ngọ': 'Sa Trung Kim', 'Ất Mùi': 'Sa Trung Kim',
  'Bính Thân': 'Sơn Hạ Hỏa', 'Đinh Dậu': 'Sơn Hạ Hỏa',
  'Mậu Tuất': 'Bình Địa Mộc', 'Kỷ Hợi': 'Bình Địa Mộc',
  'Canh Tý': 'Bích Thượng Thổ', 'Tân Sửu': 'Bích Thượng Thổ',
  'Nhâm Dần': 'Kim Bạch Kim', 'Quý Mão': 'Kim Bạch Kim',
  'Giáp Thìn': 'Phúc Đăng Hỏa', 'Ất Tỵ': 'Phúc Đăng Hỏa',
  'Bính Ngọ': 'Thiên Hà Thủy', 'Đinh Mùi': 'Thiên Hà Thủy',
  'Mậu Thân': 'Đại Trạch Thổ', 'Kỷ Dậu': 'Đại Trạch Thổ',
  'Canh Tuất': 'Thoa Xuyến Kim', 'Tân Hợi': 'Thoa Xuyến Kim',
  'Nhâm Tý': 'Tang Đố Mộc', 'Quý Sửu': 'Tang Đố Mộc',
  'Giáp Dần': 'Đại Khê Thủy', 'Ất Mão': 'Đại Khê Thủy',
  'Bính Thìn': 'Sa Trung Thổ', 'Đinh Tỵ': 'Sa Trung Thổ',
  'Mậu Ngọ': 'Thiên Thượng Hỏa', 'Kỷ Mùi': 'Thiên Thượng Hỏa',
  'Canh Thân': 'Thạch Lựu Mộc', 'Tân Dậu': 'Thạch Lựu Mộc',
  'Nhâm Tuất': 'Đại Hải Thủy', 'Quý Hợi': 'Đại Hải Thủy'
};

export function parseBirthDate(input) {
  if (!input) return null;
  const str = String(input).trim();
  let day = null;
  let month = null;
  let year = null;

  // Pattern 1: YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const parts = str.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  }
  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY
  else if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(str)) {
    const parts = str.split(/[/-]/);
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }
  // Pattern 3: Just year YYYY
  else if (/^\d{4}$/.test(str)) {
    year = parseInt(str, 10);
  }

  if (!year || isNaN(year) || year < 1920 || year > 2030) return null;

  return {
    day,
    month,
    year,
    formatted: day && month 
      ? `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
      : `${year}`
  };
}

export function getZodiacSign(day, month) {
  if (!day || !month) return null;
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Bạch Dương';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Kim Ngưu';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'Song Tử';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'Cự Giải';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Sư Tử';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Xử Nữ';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'Thiên Bình';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return 'Bọ Cạp';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return 'Nhân Mã';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Ma Kết';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Bảo Bình';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Song Ngư';
  return null;
}

export function getCanChiAndMenh(birthInput) {
  const parsed = parseBirthDate(birthInput);
  if (!parsed) return null;

  const year = parsed.year;
  const can = THIEN_CAN[year % 10];
  const chi = DIA_CHI[year % 12];
  const canChi = `${can} ${chi}`;
  const menh = MENH_MAP[canChi] || 'Trung Châu Mệnh';
  const cung = getZodiacSign(parsed.day, parsed.month);

  let hanh = 'Thổ';
  let badgeColor = 'bg-amber-900/40 text-amber-300 border-amber-500/40';

  if (menh.includes('Kim')) {
    hanh = 'Kim';
    badgeColor = 'bg-yellow-900/40 text-yellow-300 border-yellow-500/40';
  } else if (menh.includes('Mộc')) {
    hanh = 'Mộc';
    badgeColor = 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40';
  } else if (menh.includes('Thủy')) {
    hanh = 'Thủy';
    badgeColor = 'bg-sky-950/50 text-sky-300 border-sky-500/40';
  } else if (menh.includes('Hỏa')) {
    hanh = 'Hỏa';
    badgeColor = 'bg-red-950/50 text-red-300 border-red-500/40';
  }

  return {
    day: parsed.day,
    month: parsed.month,
    year: parsed.year,
    formattedDate: parsed.formatted,
    canChi,
    menh,
    cung,
    nguHanh: hanh,
    badgeColor
  };
}
