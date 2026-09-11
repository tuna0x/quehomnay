// Helper calculating Can Chi, Ngu Hanh Ban Menh & Thoi Than for I-Ching Divination

const THIEN_CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
const DIA_CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];

// Luc Thap Hoa Giap Nap Am Menh
const MENH_MAP = {
  'Giáp Tý': 'Hải Trung Kim (Vàng trong biển)', 'Ất Sửu': 'Hải Trung Kim (Vàng trong biển)',
  'Bính Dần': 'Lư Trung Hỏa (Lửa trong lò)', 'Đinh Mão': 'Lư Trung Hỏa (Lửa trong lò)',
  'Mậu Thìn': 'Đại Lâm Mộc (Gỗ rừng già)', 'Kỷ Tỵ': 'Đại Lâm Mộc (Gỗ rừng già)',
  'Canh Ngọ': 'Lộ Bàng Thổ (Đất ven đường)', 'Tân Mùi': 'Lộ Bàng Thổ (Đất ven đường)',
  'Nhâm Thân': 'Kiếm Phong Kim (Vàng mũi kiếm)', 'Quý Dậu': 'Kiếm Phong Kim (Vàng mũi kiếm)',
  'Giáp Tuất': 'Sơn Đầu Hỏa (Lửa trên núi)', 'Ất Hợi': 'Sơn Đầu Hỏa (Lửa trên núi)',
  'Bính Tý': 'Giản Hạ Thủy (Nước khe suối)', 'Đinh Sửu': 'Giản Hạ Thủy (Nước khe suối)',
  'Mậu Dần': 'Thành Đầu Thổ (Đất trên thành)', 'Kỷ Mão': 'Thành Đầu Thổ (Đất trên thành)',
  'Canh Thìn': 'Bạch Lạp Kim (Vàng sáp ong)', 'Tân Tỵ': 'Bạch Lạp Kim (Vàng sáp ong)',
  'Nhâm Ngọ': 'Dương Liễu Mộc (Gỗ cây dương)', 'Quý Mùi': 'Dương Liễu Mộc (Gỗ cây dương)',
  'Giáp Thân': 'Tuyền Trung Thủy (Nước trong giếng)', 'Ất Dậu': 'Tuyền Trung Thủy (Nước trong giếng)',
  'Bính Tuất': 'Ốc Thượng Thổ (Đất trên nóc nhà)', 'Đinh Hợi': 'Ốc Thượng Thổ (Đất trên nóc nhà)',
  'Mậu Tý': 'Tích Lịch Hỏa (Lửa sấm sét)', 'Kỷ Sửu': 'Tích Lịch Hỏa (Lửa sấm sét)',
  'Canh Dần': 'Tùng Bách Mộc (Gỗ tùng bách)', 'Tân Mão': 'Tùng Bách Mộc (Gỗ tùng bách)',
  'Nhâm Thìn': 'Trường Lưu Thủy (Nước chảy dài)', 'Quý Tỵ': 'Trường Lưu Thủy (Nước chảy dài)',
  'Giáp Ngọ': 'Sa Trung Kim (Vàng trong cát)', 'Ất Mùi': 'Sa Trung Kim (Vàng trong cát)',
  'Bính Thân': 'Sơn Hạ Hỏa (Lửa dưới núi)', 'Đinh Dậu': 'Sơn Hạ Hỏa (Lửa dưới núi)',
  'Mậu Tuất': 'Bình Địa Mộc (Gỗ đồng bằng)', 'Kỷ Hợi': 'Bình Địa Mộc (Gỗ đồng bằng)',
  'Canh Tý': 'Bích Thượng Thổ (Đất trên vách)', 'Tân Sửu': 'Bích Thượng Thổ (Đất trên vách)',
  'Nhâm Dần': 'Kim Bạch Kim (Vàng trắng)', 'Quý Mão': 'Kim Bạch Kim (Vàng trắng)',
  'Giáp Thìn': 'Phúc Đăng Hỏa (Lửa ngọn đèn)', 'Ất Tỵ': 'Phúc Đăng Hỏa (Lửa ngọn đèn)',
  'Bính Ngọ': 'Thiên Hà Thủy (Nước trên trời)', 'Đinh Mùi': 'Thiên Hà Thủy (Nước trên trời)',
  'Mậu Thân': 'Đại Trạch Thổ (Đất nền nhà)', 'Kỷ Dậu': 'Đại Trạch Thổ (Đất nền nhà)',
  'Canh Tuất': 'Thoa Xuyến Kim (Vàng trang sức)', 'Tân Hợi': 'Thoa Xuyến Kim (Vàng trang sức)',
  'Nhâm Tý': 'Tang Đố Mộc (Gỗ cây dâu)', 'Quý Sửu': 'Tang Đố Mộc (Gỗ cây dâu)',
  'Giáp Dần': 'Đại Khê Thủy (Nước khe lớn)', 'Ất Mão': 'Đại Khê Thủy (Nước khe lớn)',
  'Bính Thìn': 'Sa Trung Thổ (Đất pha cát)', 'Đinh Tỵ': 'Sa Trung Thổ (Đất pha cát)',
  'Mậu Ngọ': 'Thiên Thượng Hỏa (Lửa trên trời)', 'Kỷ Mùi': 'Thiên Thượng Hỏa (Lửa trên trời)',
  'Canh Thân': 'Thạch Lựu Mộc (Gỗ cây lựu đá)', 'Tân Dậu': 'Thạch Lựu Mộc (Gỗ cây lựu đá)',
  'Nhâm Tuất': 'Đại Hải Thủy (Nước biển lớn)', 'Quý Hợi': 'Đại Hải Thủy (Nước biển lớn)'
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

/**
 * Get Can Chi & Nap Am Menh from birth date or year
 */
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
  if (menh.includes('Kim')) hanh = 'Kim';
  else if (menh.includes('Mộc')) hanh = 'Mộc';
  else if (menh.includes('Thủy')) hanh = 'Thủy';
  else if (menh.includes('Hỏa')) hanh = 'Hỏa';

  return {
    day: parsed.day,
    month: parsed.month,
    year: parsed.year,
    formattedDate: parsed.formatted,
    canChi,
    menh,
    cung,
    nguHanh: hanh
  };
}

/**
 * Get current hour in Can Chi (Thoi than)
 */
export function getCurrentHourCanChi() {
  const now = new Date();
  // UTC+7 offset
  const vnHour = (now.getUTCHours() + 7) % 24;

  if (vnHour >= 23 || vnHour < 1) return 'Giờ Tý (23h - 1h)';
  if (vnHour < 3) return 'Giờ Sửu (1h - 3h)';
  if (vnHour < 5) return 'Giờ Dần (3h - 5h)';
  if (vnHour < 7) return 'Giờ Mão (5h - 7h)';
  if (vnHour < 9) return 'Giờ Thìn (7h - 9h)';
  if (vnHour < 11) return 'Giờ Tỵ (9h - 11h)';
  if (vnHour < 13) return 'Giờ Ngọ (11h - 13h)';
  if (vnHour < 15) return 'Giờ Mùi (13h - 15h)';
  if (vnHour < 17) return 'Giờ Thân (15h - 17h)';
  if (vnHour < 19) return 'Giờ Dậu (17h - 19h)';
  if (vnHour < 21) return 'Giờ Tuất (19h - 21h)';
  return 'Giờ Hợi (21h - 23h)';
}
