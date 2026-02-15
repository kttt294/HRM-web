import { authFetch } from "../../../utils/auth-fetch";

export const aiService = {
    async chat(message: string): Promise<string> {
        try {
            const response = await authFetch("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                // Try to parse error message if possible
                try {
                    const errorData = await response.json();
                    if (errorData.error) throw new Error(errorData.error);
                } catch (e) {
                    // unexpected error format
                }
                throw new Error("Failed to chat");
            }

            const data = await response.json();
            return data.reply;
        } catch (error) {
            console.error("AI Chat Error:", error);
            return "Xin lỗi, hiện tại tôi không thể trả lời. Vui lòng thử lại sau.";
        }
    }
};
