const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Khởi tạo Gemini AI với API Key bạn cung cấp
const genAI = new GoogleGenerativeAI("AIzaSyA1zqGenF_qk_fgXkCc0H231jHS8Fft5xs");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Sử dụng gemini-2.5-flash

const chatbotController = {
  async ask(req, res, next) {
    try {
      const { message, history } = req.body;
      const { id, username, name, role } = req.user; // Thông tin từ token

      // 1. Đọc Knowledge Base (RAG đơn giản)
      const kbPath = path.join(__dirname, "../knowledge_base.md");
      let knowledgeBase = "";
      try {
        knowledgeBase = fs.readFileSync(kbPath, "utf-8");
      } catch (err) {
        console.error("Không thể đọc file knowledge_base.md:", err);
      }

      // 2. Xây dựng System Prompt với cá nhân hóa
      const displayName = name || username || "Nhân viên";
      const systemPrompt = `
Bạn là một trợ lý AI thông minh cho hệ thống Quản trị Nhân sự (HRM) của Phenikaa.
Tên người đang nói chuyện với bạn là: ${displayName} (ID: ${id}).
Vai trò của họ trong hệ thống là: ${role.toUpperCase()}.

Dựa vào kiến thức dưới đây về hệ thống, hãy trả lời câu hỏi của người dùng một cách thân thiện, chu đáo và cá nhân hóa.

--- KIẾN THỨC HỆ THỐNG ---
${knowledgeBase}
--- KẾT THÚC KIẾN THỨC ---

HƯỚNG DẪN TRẢ LỜI:
1. Luôn chào người dùng bằng tên (${displayName}) một cách tự nhiên.
2. Trả lời bằng Tiếng Việt.
3. Nếu người dùng hỏi về lý do tại sao không xem được thông tin hoặc cập nhật chưa thấy thay đổi, hãy dùng kiến thức trong mục "2. Các quy trình quan trọng" và "3. FAQ" để giải thích.
4. Tránh trả lời các vấn đề không liên quan đến công nghệ, HR hoặc hệ thống HRM.
5. Nếu câu hỏi nằm ngoài kiến thức hệ thống, hãy lịch sự xin lỗi và khuyên họ liên hệ bộ phận IT hoặc HR để được hỗ trợ trực tiếp.
6. Giữ câu trả lời ngắn gọn, súc tích và dễ nhìn (sử dụng markdown).
`;

      // 3. Gọi Gemini API
      const chat = model.startChat({
        history: history || [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      // Gửi prompt hệ thống + message thực tế của người dùng
      const fullPrompt = `${systemPrompt}\n\nNgười dùng (${displayName}): ${message}`;
      
      const result = await chat.sendMessage(fullPrompt);
      const responseText = result.response.text();

      res.json({
        reply: responseText,
        // Trả lại history nếu cần update ở FE
      });
    } catch (error) {
      console.error("Chatbot API Error:", error);
      res.status(500).json({ message: "Chatbot đang gặp sự cố, vui lòng thử lại sau." });
    }
  },
};

module.exports = chatbotController;
