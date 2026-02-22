require('dotenv').config();

async function listAllModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            console.error("Body:", await response.text());
        } else {
            const data = await response.json();
            console.log("AVAILABLE MODELS FOR THIS KEY:");
            if (data.models) {
                data.models.forEach(m => {
                    // Only show generateContent supported models
                    if (m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name}`);
                    }
                });
            } else {
                console.log("No models found.");
            }
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

listAllModels();
