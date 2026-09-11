// High-quality Classical Temple Fortune Fallback Engine
// Enhanced with Lucky Colors, Lucky Numbers, and Auspicious Hours (Màu sắc, Con số & Giờ hoàng đạo)

export const FORTUNE_TEMPLATES = {
  "Thượng": [
    {
      ten_que: "Vân Khai Kiến Nhật",
      loi_que: "Mây tan trăng rọi cõi lòng thanh,\nHoa nở đầu cành đón gió lành.",
      giai_nghia: "Quẻ này biểu trưng cho sự hanh thông, những trở ngại hay nỗi hoài nghi bấy lâu nay tựa sương mây dần tan biến. Mọi sự mong cầu trong công việc, tình duyên hay sức khỏe đều đang bước vào thời kỳ khai mở thuận lợi.",
      loi_khuyen: "Hãy tự tin tiến bước với kế hoạch đã định, giữ tâm khiêm cung và sẻ chia niềm vui cùng những người xung quanh.",
      mau_sac: "Vàng Hổ Phách",
      mau_hex: "#D97706",
      con_so: "08, 68",
      gio_cat: "9h - 11h (Giờ Tỵ)"
    },
    {
      ten_que: "Bích Thuỷ Triều Sinh",
      loi_que: "Sóng biếc triều dâng bến đợi thuyền,\nTrời xanh thấu tỏ tấm lòng duyên.",
      giai_nghia: "Dòng nước trong xanh mang theo tài lộc và cơ duyên mới tới bến đỗ. Điều bạn đang ấp ủ sắp tìm được quý nhân tương trợ, tựa thuyền thuận nước xuôi dòng.",
      loi_khuyen: "Nắm bắt thời cơ khi người có duyên tìm tới, chớ ngần ngại mở lòng đón nhận sự giúp đỡ.",
      mau_sac: "Xanh Ngọc Bích",
      mau_hex: "#059669",
      con_so: "16, 79",
      gio_cat: "13h - 15h (Giờ Mùi)"
    },
    {
      ten_que: "Hàn Mai Nghinh Xuân",
      loi_que: "Nhánh mai qua tuyết đượm hương nồng,\nKhổ ải ngàn ngày bỗng hóa không.",
      giai_nghia: "Cành mai vượt qua giá lạnh mùa đông kiên cường nay trổ hoa rực rỡ đón xuân sang. Bao công sức nhọc nhằn, tích lũy từ trước đến nay sẽ sớm đơm hoa kết trái ngọt ngào.",
      loi_khuyen: "Kiên nhẫn hoàn thiện nốt những bước cuối cùng, hoa thơm ắt có người trân trọng thưởng ngoạn.",
      mau_sac: "Đỏ Chu Sa",
      mau_hex: "#DC2626",
      con_so: "09, 88",
      gio_cat: "7h - 9h (Giờ Thìn)"
    },
    {
      ten_que: "Kim Kê Báo Hiểu",
      loi_que: "Gà vàng cất tiếng rạng vầng đông,\nBao nỗi lo toan trút sạch lòng.",
      giai_nghia: "Tiếng gáy vang rền báo hiệu màn đêm đã khép, bình minh tươi sáng ló dạng. Băn khoăn bạn trăn trở đêm qua nay sẽ tìm thấy hướng đi rành mạch và thấu suốt.",
      loi_khuyen: "Hãy dậy sớm đón ánh mặt trời, bắt tay giải quyết dứt điểm điều còn dang dở với tâm thế lạc quan.",
      mau_sac: "Vàng Ánh Kim",
      mau_hex: "#EAB308",
      con_so: "28, 99",
      gio_cat: "5h - 7h (Giờ Mão)"
    },
    {
      ten_que: "Tùng Bách Ngâm Phong",
      loi_que: "Gốc tùng ngàn trượng hát trong giông,\nThế sự xoay vần dạ chẳng cong.",
      giai_nghia: "Hình ảnh cây tùng bách ngạo nghễ trước gió sương cho thấy nội lực và uy tín của bạn đang rất vững chãi. Ngoại cảnh dù biến động cũng không làm lung lay được thành quả chân chính.",
      loi_khuyen: "Giữ vững nguyên tắc sống và sự chính trực, đây chính là chiếc khiên chở che bạn bình an.",
      mau_sac: "Xanh Rừng Trúc",
      mau_hex: "#15803D",
      con_so: "03, 38",
      gio_cat: "11h - 13h (Giờ Ngọ)"
    }
  ],
  "Trung": [
    {
      ten_que: "Thủy Tĩnh Tâm An",
      loi_que: "Nước phẳng như gương bóng nguyệt soi,\nChờ khi gió lặng tỏ muôn loài.",
      giai_nghia: "Mọi việc hiện tại ở mức bình ổn, chưa nên manh động vội vã. Mặt nước lòng người càng phẳng lặng thì trí tuệ càng sáng suốt để nhận định chân tướng sự tình.",
      loi_khuyen: "Tập trung bồi dưỡng nội lực, tĩnh tại quan sát thêm vài ngày trước khi đưa ra quyết định hệ trọng.",
      mau_sac: "Xanh Lam Khói",
      mau_hex: "#0284C7",
      con_so: "02, 62",
      gio_cat: "15h - 17h (Giờ Thân)"
    },
    {
      ten_que: "Lạc Diệp Quy Căn",
      loi_que: "Lá rụng về cội đất nuôi mầm,\nNhân duyên tụ tán định nơi tâm.",
      giai_nghia: "Quẻ chỉ sự quay về chăm sóc cội nguồn, nếp nhà hoặc bản thân sau thời gian bôn ba. Có một số việc cần buông bỏ bớt để tâm trí được nhẹ nhõm, tạo đà cho tương lai.",
      loi_khuyen: "Dành thời gian nghỉ ngơi, dọn dẹp không gian sống hoặc gọi điện hỏi thăm người thân yêu.",
      mau_sac: "Nâu Gỗ Trầm",
      mau_hex: "#854D0E",
      con_so: "05, 55",
      gio_cat: "17h - 19h (Giờ Dậu)"
    },
    {
      ten_que: "Ngọc Ẩn Thạch Trung",
      loi_que: "Ngọc báu trong đá đợi tay mài,\nThời chưa tới chớ vội trách ai.",
      giai_nghia: "Tài năng và giá trị thực sự của bạn vẫn đang trong giai đoạn tôi luyện, người đời chưa thấy hết cũng là lẽ thường. Cần thêm chút thời gian và công phu rèn giũa để viên ngọc phát lộ ánh quang.",
      loi_khuyen: "Tiếp tục học hỏi, trau dồi chuyên môn mỗi ngày mà không so đo thiệt hơn với người khác.",
      mau_sac: "Trắng Bạch Ngọc",
      mau_hex: "#F8FAFC",
      con_so: "07, 77",
      gio_cat: "9h - 11h (Giờ Tỵ)"
    },
    {
      ten_que: "Thanh Chu Viễn Phàm",
      loi_que: "Thuyền nhỏ giăng buồm lướt sóng xa,\nĐường dài vạn dặm chớ la đà.",
      giai_nghia: "Một hành trình mới mở ra trước mắt với nhiều điều lạ lẫm. Cần chuẩn bị kỹ lưỡng về sức khỏe, tài chính và tâm thế, tránh vội vàng hấp tấp giữa chừng.",
      loi_khuyen: "Lập kế hoạch từng chặng cụ thể, kiểm tra lại hành trang và không đi tắt đón đầu.",
      mau_sac: "Xanh Da Trời",
      mau_hex: "#38BDF8",
      con_so: "18, 81",
      gio_cat: "7h - 9h (Giờ Thìn)"
    },
    {
      ten_que: "Xuân Vũ Nhuận Vật",
      loi_que: "Mưa xuân tí tách tưới chồi xanh,\nChờ hoa kết trái phải ngọn ngành.",
      giai_nghia: "Mưa phùn đầu xuân ngấm dần vào đất, sinh khí đang âm thầm tích tụ. Quẻ này nhắc nhở rằng mọi việc tốt đẹp đều cần thời gian đơm hoa, nóng vội sẽ làm tổn thương mầm non.",
      loi_khuyen: "Chăm sóc từng thói quen nhỏ đều đặn, thành tựu lớn sẽ tới tự nhiên như xuân đến hoa nở.",
      mau_sac: "Hồng Sen Nhạt",
      mau_hex: "#F472B6",
      con_so: "24, 42",
      gio_cat: "13h - 15h (Giờ Mùi)"
    }
  ],
  "Hạ": [
    {
      ten_que: "Vụ Tỏa Hàn Sơn",
      loi_que: "Sương giăng mờ lối núi chênh vênh,\nChậm bước chân qua bến gập ghềnh.",
      giai_nghia: "Núi cao phủ sương mù, tầm nhìn hạn chế, nếu vội vã bước nhanh rất dễ trượt chân. Quẻ báo hiệu thời điểm này ngoại cảnh đang tiềm ẩn hiểu lầm, trắc trở hoặc cạm bẫy.",
      loi_khuyen: "Tạm gác lại những quyết định chi tiêu lớn hay tranh luận gay gắt, đi chậm lại để giữ mình an toàn.",
      mau_sac: "Xám Bạc Khói",
      mau_hex: "#64748B",
      con_so: "04, 44",
      gio_cat: "11h - 13h (Giờ Ngọ)"
    },
    {
      ten_que: "Triều Lạc Lưu Sa",
      loi_que: "Nước rút cát trôi bãi vắng tanh,\nTâm người dao động việc khó thành.",
      giai_nghia: "Hình ảnh bãi cát khi thủy triều rút đi để lộ những bất cập còn ngổn ngang. Có thể bạn đang cảm thấy hụt hẫng hoặc thiếu năng lượng do đặt kỳ vọng quá cao vào người khác.",
      loi_khuyen: "Học cách tự thân vận động, chấp nhận sự thật và không để cảm xúc tiêu cực chi phối hành vi.",
      mau_sac: "Vàng Cát Sa Mạc",
      mau_hex: "#CA8A04",
      con_so: "14, 41",
      gio_cat: "15h - 17h (Giờ Thân)"
    },
    {
      ten_que: "Nghịch Phong Hành Chu",
      loi_que: "Ngược gió chèo thuyền mỏi cánh tay,\nNeo bờ nghỉ tạm đợi ngày may.",
      giai_nghia: "Chèo thuyền ngược con nước xiết chỉ hao tâm tổn sức mà chẳng tiến được bao xa. Đây không phải lúc đối đầu trực diện, mà là lúc nên dừng lại để bảo tồn tinh lực.",
      loi_khuyen: "Tìm một góc bình yên đọc sách, ngủ đủ giấc, chờ gió đổi chiều mới lại ra khơi.",
      mau_sac: "Xanh Rêu Đậm",
      mau_hex: "#3F6212",
      con_so: "01, 10",
      gio_cat: "9h - 11h (Giờ Tỵ)"
    },
    {
      ten_que: "Tàn Đăng Dạ Vũ",
      loi_que: "Đèn khuya trước gió bóng chập chờn,\nMưa lạnh qua song dứt oán hờn.",
      giai_nghia: "Ngọn đèn dầu leo lét giữa cơn mưa đêm ngụ ý nguồn lực và tinh thần của bạn đang chạm ngưỡng cạn kiệt. Cần dừng ngay việc ôm đồm phiền muộn của người khác vào thân.",
      loi_khuyen: "Uống một tách trà ấm, buông xả những trách cứ giận hờn, đi ngủ sớm để phục hồi năng lượng.",
      mau_sac: "Tím Than Bình An",
      mau_hex: "#4338CA",
      con_so: "06, 60",
      gio_cat: "19h - 21h (Giờ Tuất)"
    }
  ]
};

// Select random fortune level: 30% Thượng, 45% Trung, 25% Hạ
export function rollFortuneLevel() {
  const rand = Math.random() * 100;
  if (rand < 30) return "Thượng";
  if (rand < 75) return "Trung";
  return "Hạ";
}

// Generate contextualized fallback fortune
export function getOfflineFortune({ name = '', question = '', preferredLevel = null }) {
  const level = preferredLevel || rollFortuneLevel();
  const list = FORTUNE_TEMPLATES[level] || FORTUNE_TEMPLATES["Trung"];
  const item = list[Math.floor(Math.random() * list.length)];

  let customizedGiaiNghia = item.giai_nghia;
  const cleanName = name.trim();
  const cleanQuestion = question.trim();

  if (cleanName && cleanQuestion) {
    customizedGiaiNghia = `Gửi đến ${cleanName}: Đối với nỗi niềm "${cleanQuestion}", ${item.giai_nghia.charAt(0).toLowerCase() + item.giai_nghia.slice(1)}`;
  } else if (cleanName) {
    customizedGiaiNghia = `Gửi đến ${cleanName}: ${item.giai_nghia}`;
  } else if (cleanQuestion) {
    customizedGiaiNghia = `Về nỗi niềm "${cleanQuestion}": ${item.giai_nghia.charAt(0).toLowerCase() + item.giai_nghia.slice(1)}`;
  }

  return {
    ten_que: item.ten_que,
    muc: level,
    loi_que: item.loi_que,
    giai_nghia: customizedGiaiNghia,
    loi_khuyen: item.loi_khuyen,
    mau_sac: item.mau_sac,
    mau_hex: item.mau_hex,
    con_so: item.con_so,
    gio_cat: item.gio_cat,
    isOffline: true,
  };
}
