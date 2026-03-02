const { ChatOpenAI } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const fs = require("fs");
const path = require("path");

const chatWithAI = async (query, user) => {
    try {
        const docPath = path.join(__dirname, "../docs/user_manual.md");
        let contextText = "";
        
        if (fs.existsSync(docPath)) {
             contextText = fs.readFileSync(docPath, "utf8");
             contextText = `THÔNG TIN NGƯỜI DÙNG:
             - Tên: ${user ? user.username : 'Khách'}
             - Vai trò: ${user ? user.role : 'Không rõ'}
             
             TÀI LIỆU HƯỚNG DẪN SỬ DỤNG:\n` + contextText;
        } else {
             contextText = "Không có tài liệu hướng dẫn.";
        }

        // DeepSeek API Configuration
        if (!process.env.DEEPSEEK_API_KEY) {
            return "Chức năng AI chưa được kích hoạt (thiếu DEEPSEEK_API_KEY).";
        }

        const model = new ChatOpenAI({
            modelName: "deepseek-chat", 
            openAIApiKey: process.env.DEEPSEEK_API_KEY,
            configuration: {
                baseURL: "https://api.deepseek.com",
            },
            temperature: 0.3,
            maxRetries: 3, 
        });

        const promptTemplate = ChatPromptTemplate.fromMessages([
            ["system", `Bạn là trợ lý ảo AI hỗ trợ sử dụng phần mềm HRM.
            Người đang chat với bạn là {username} (Role: {role}).
            Hãy trả lời câu hỏi dựa trên thông tin ngữ cảnh được cung cấp bên dưới.
            Nếu thông tin không có trong ngữ cảnh, hãy nói rằng bạn không biết, đừng bịa đặt.
            Giữ giọng điệu chuyên nghiệp và thân thiện.
            
            Ngữ cảnh:
            {context}`],
            ["human", "{question}"],
        ]);

        const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

        const response = await chain.invoke({
            context: contextText,
            question: query,
            username: user ? user.username : 'Bạn',
            role: user ? user.role : 'Người dùng',
        });

        return response;

    } catch (error) {
        console.error("AI Service Error:", error.message);
        
        if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("rate limit")) {
            return "Hệ thống AI đang quá tải (Rate Limit). Vui lòng thử lại sau 1 phút.";
        }
        
        return "Xin lỗi, tôi đang gặp sự cố kết nối với DeepSeek. Vui lòng thử lại sau (" + error.message + ")";
    }
};

module.exports = {
    chatWithAI
};
