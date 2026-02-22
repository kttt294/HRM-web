const { VertexAI } = require('@google-cloud/vertexai');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const fs = require("fs");
const path = require("path");

// Function to initialize Vertex AI Chat Model
const getVertexAIModel = () => {
    try {
        const keyPath = path.join(__dirname, "../vertex-key.json");
        if (fs.existsSync(keyPath)) {
            console.log("Using Vertex AI (Service Account)...");
            
            // Read JSON file directly
            const keyContent = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            
            const vertex_ai = new VertexAI({
                project: keyContent.project_id,
                location: 'us-central1',
                googleAuthOptions: {
                    credentials: {
                        client_email: keyContent.client_email,
                        private_key: keyContent.private_key,
                    },
                    projectId: keyContent.project_id
                }
            });

            return {
                type: 'vertex',
                client: vertex_ai.preview.getGenerativeModel({
                    model: 'gemini-1.5-flash-001',
                    generationConfig: {
                        'maxOutputTokens': 2048,
                        'temperature': 0.3,
                    },
                })
            };
        }
    } catch (error) {
        console.warn("Failed to initialize Vertex AI:", error.message);
    }
    return null;
};

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

        // 1. Try Vertex AI First (Service Account)
        const vertexModel = getVertexAIModel();
        
        if (vertexModel) {
            try {
                const prompt = `Bạn là trợ lý ảo AI hỗ trợ sử dụng phần mềm HRM.
                Người đang chat với bạn là ${user ? user.username : 'Bạn'} (Role: ${user ? user.role : 'Người dùng'}).
                Hãy trả lời câu hỏi dựa trên thông tin ngữ cảnh được cung cấp bên dưới.
                Nếu thông tin không có trong ngữ cảnh, hãy nói rằng bạn không biết, đừng bịa đặt.
                Giữ giọng điệu chuyên nghiệp và thân thiện.
                
                Ngữ cảnh:
                ${contextText}
                
                Câu hỏi: ${query}`;

                const result = await vertexModel.client.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                });
                
                const response = result.response;
                if (response.candidates && response.candidates[0].content.parts[0].text) {
                    return response.candidates[0].content.parts[0].text;
                }
            } catch (vertexError) {
                console.error("Vertex AI Failed:", vertexError.message);
                
                if (vertexError.message.includes("429")) {
                     console.warn("Vertex AI Rate Limited. Trying Fallback...");
                }
            }
        }

        // 2. Fallback to Gemini API (API Key)
        if (!process.env.GOOGLE_API_KEY) {
            return "Chức năng AI chưa được kích hoạt (thiếu API Key và k tìm thấy Service Account).";
        }

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-pro", // Switching to 2.5 Pro as requested
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
        
        return "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau (" + error.message + ")";
    }
};

module.exports = {
    chatWithAI
};
