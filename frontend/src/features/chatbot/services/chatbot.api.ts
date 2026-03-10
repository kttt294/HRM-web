import { authFetch } from "../../../utils/auth-fetch";

export const chatbotApi = {
  async ask(message: string, history: any[] = []) {
    const response = await authFetch("/api/chatbot/ask", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
    if (!response.ok) {
      throw new Error("Chatbot is currently busy.");
    }
    return response.json();
  },
};
