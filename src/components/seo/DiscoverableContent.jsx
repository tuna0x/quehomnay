import React from 'react';

const FAQ_ITEMS = [
  {
    question: 'Quẻ hôm nay là gì?',
    answer:
      'Quẻ hôm nay là một thông điệp chiêm nghiệm được rút theo ngày và điều người dùng đang băn khoăn. Nội dung nhằm gợi mở góc nhìn, giúp bạn bình tâm trước khi đưa ra quyết định.',
  },
  {
    question: 'Xin quẻ và gieo quẻ trên Quẻ Hôm Nay như thế nào?',
    answer:
      'Bạn chọn ngày sinh nếu muốn tham khảo thêm thông tin bản mệnh, chọn lĩnh vực quan tâm, viết câu hỏi rồi bấm Thành Tâm Xin Quẻ. Mỗi ngày bạn có một lượt gieo quẻ miễn phí.',
  },
  {
    question: 'Quẻ có dự đoán chính xác tương lai không?',
    answer:
      'Không. Quẻ Hôm Nay là công cụ giải trí và tự chiêm nghiệm, không thay thế tư vấn y tế, pháp lý, tài chính hoặc quyết định cá nhân. Hãy xem lời quẻ như một gợi ý để suy nghĩ thận trọng hơn.',
  },
  {
    question: 'Có cần đăng nhập để gieo quẻ không?',
    answer:
      'Không cần đăng nhập để bắt đầu. Đăng nhập giúp đồng bộ lịch sử quẻ giữa các thiết bị và lưu lại những lần chiêm nghiệm của bạn.',
  },
];

export default function DiscoverableContent() {
  return (
    <section
      id="faq"
      className="w-full max-w-2xl mx-auto mt-8 mb-10 px-4"
      aria-labelledby="about-fortune-heading"
    >
      <div className="rounded-lg border border-gold-ancient/25 bg-[#170403]/80 px-5 py-6 shadow-[0_12px_36px_rgba(0,0,0,0.35)] sm:px-7">
        <div className="mb-5 text-center">
          <p className="mb-1 text-[10px] font-serif font-semibold uppercase tracking-[0.22em] text-gold-ancient">
            Góc chiêm nghiệm
          </p>
          <h2
            id="about-fortune-heading"
            className="font-serif text-xl font-black text-gold-pale sm:text-2xl"
          >
            Xin quẻ hôm nay để tìm một khoảng an
          </h2>
        </div>

        <div className="space-y-3 text-sm leading-7 text-paper-light/80">
          <p>
            <strong className="text-gold-bright">Quẻ Hôm Nay</strong> là một trải nghiệm xin quẻ và gieo quẻ trực tuyến bằng tiếng Việt. Mỗi lần gieo quẻ mở ra một lời quẻ, câu thơ cổ, phần giải nghĩa và lời khuyên để bạn chậm lại, nhìn rõ điều đang quan tâm và nuôi dưỡng sự an nhiên.
          </p>
          <p>
            Bạn có thể tham khảo quẻ theo các chủ đề <strong className="text-gold-pale">công danh, tài lộc, tình duyên, gia đạo, tâm an</strong> hoặc một ngã rẽ đang cần suy ngẫm. Hãy đặt câu hỏi chân thành và xem kết quả như một gợi ý tự phản tỉnh, không phải lời khẳng định chắc chắn về tương lai.
          </p>
        </div>

        <div className="mt-6 border-t border-gold-ancient/20 pt-5">
          <h2 className="mb-3 font-serif text-lg font-bold text-gold-pale">Câu hỏi thường gặp về xin quẻ</h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <details key={question} className="group rounded-md border border-gold-ancient/20 bg-lacquer-deep/50 px-3.5">
                <summary className="cursor-pointer list-none py-3 font-serif text-sm font-semibold text-gold-bright marker:hidden">
                  <span className="mr-2 text-gold-ancient transition group-open:inline-block group-open:rotate-45">+</span>
                  {question}
                </summary>
                <p className="pb-3 text-sm leading-6 text-paper-light/70">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
