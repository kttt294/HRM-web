const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Hàm dùng chung để gọi Gemini
async function callGemini(displayName, role, message, history, knowledgeBase) {
  const isGuest = !role;
  const systemPrompt = `
Bạn là một trợ lý AI thông minh cho hệ thống Quản trị Nhân sự (HRM).
${
  isGuest
    ? `Người dùng đang truy cập với tư cách khách (chưa đăng nhập). Tên hiển thị: ${displayName}.`
    : `Tên người đang nói chuyện với bạn là: ${displayName}. Vai trò trong hệ thống: ${role.toUpperCase()}.`
}

Dựa vào kiến thức dưới đây về hệ thống, hãy trả lời câu hỏi một cách thân thiện, chu đáo và cá nhân hóa.

--- KIẾN THỨC HỆ THỐNG ---
${knowledgeBase}
--- KẾT THÚC KIẾN THỨC ---

HƯỚNG DẪN TRẢ LỜI:
1. Chào người dùng bằng tên (${displayName}) một cách tự nhiên.
2. Trả lời bằng Tiếng Việt.
3. Nếu người dùng hỏi về lý do không xem được thông tin hoặc cập nhật chưa thấy, hãy dùng kiến thức trong mục "2. Các quy trình quan trọng" và "3. FAQ" để giải thích.
4. Tránh trả lời các vấn đề không liên quan đến công nghệ, HR hoặc hệ thống HRM.
5. Nếu câu hỏi nằm ngoài kiến thức hệ thống, hãy lịch sự xin lỗi và khuyên họ liên hệ bộ phận IT hoặc HR.
6. Giữ câu trả lời ngắn gọn, súc tích và dễ nhìn (sử dụng markdown).
${isGuest ? "7. Nếu người dùng hỏi về thông tin cá nhân (lương, ngày phép...), nhắc nhở họ đăng nhập để xem thông tin của mình." : ""}
`;

  const validHistory = (history || []).filter(
    (msg, idx) => !(idx === 0 && msg.role === "model")
  );

  const chat = model.startChat({
    history: validHistory,
    generationConfig: { maxOutputTokens: 1000 },
  });

  const fullPrompt = `${systemPrompt}\n\nNgười dùng (${displayName}): ${message}`;
  const result = await chat.sendMessage(fullPrompt);
  return result.response.text();
}

const chatbotController = {
  // Dành cho người đã đăng nhập
  async ask(req, res, next) {
    try {
      const { message, history } = req.body;
      const { id, username, name, role } = req.user;

      const kbPath = path.join(__dirname, "../knowledge_base.md");
      let knowledgeBase = "";
      try { knowledgeBase = fs.readFileSync(kbPath, "utf-8"); } catch (err) {}

      const displayName = name || username || "Nhân viên";
      const responseText = await callGemini(displayName, role, message, history, knowledgeBase);

      res.json({ reply: responseText });
    } catch (error) {
      console.error("Chatbot API Error:", error);
      res.status(500).json({ message: "Chatbot đang gặp sự cố, vui lòng thử lại sau." });
    }
  },

  // Dành cho khách (chưa đăng nhập) - không cần auth
  async askPublic(req, res, next) {
    try {
      const { message, history } = req.body;

      const kbPath = path.join(__dirname, "../knowledge_base.md");
      let knowledgeBase = "";
      try { knowledgeBase = fs.readFileSync(kbPath, "utf-8"); } catch (err) {}

      const responseText = await callGemini("Khách", null, message, history, knowledgeBase);

      res.json({ reply: responseText });
    } catch (error) {
      console.error("Chatbot Public API Error:", error);
      res.status(500).json({ message: "Chatbot đang gặp sự cố, vui lòng thử lại sau." });
    }
  },
};

module.exports = chatbotController;
