const aiService = require("../services/aiService");

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const user = req.user; // Get user from auth middleware
        const response = await aiService.chatWithAI(message, user);
        res.json({ reply: response });
    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    chat
};
