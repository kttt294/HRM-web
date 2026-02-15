const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
 
// Attempt to use legacy import, if fail, try new one. 
// Actually, let's use the robust approach below:

let RecursiveCharacterTextSplitterClass;
try {
    RecursiveCharacterTextSplitterClass = require("langchain/text_splitter").RecursiveCharacterTextSplitter;
} catch (e) {
    try {
        RecursiveCharacterTextSplitterClass = require("@langchain/textsplitters").RecursiveCharacterTextSplitter;
    } catch (e2) {
        console.error("Failed to load TextSplitter", e2);
    }
}

const { Document } = require("@langchain/core/documents");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const fs = require("fs");
const path = require("path");

// --- Simple In-Memory Vector Store Implementation ---
// Replaces MemoryVectorStore to avoid package resolution issues
class SimpleVectorStore {
    constructor(embeddings) {
        this.embeddings = embeddings;
        this.vectors = []; // { vector, document }
    }

    async addDocuments(documents) {
        const texts = documents.map(doc => doc.pageContent);
        const embeddings = await this.embeddings.embedDocuments(texts);
        
        for (let i = 0; i < documents.length; i++) {
            this.vectors.push({
                vector: embeddings[i],
                document: documents[i]
            });
        }
    }

    async similaritySearch(query, k = 4) {
        const queryEmbedding = await this.embeddings.embedQuery(query);
        
        // Calculate Cosine Similarity
        const similarities = this.vectors.map(item => {
            const similarity = this.cosineSimilarity(queryEmbedding, item.vector);
            return { ...item, similarity };
        });

        // Sort by similarity desc
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Return top k documents
        return similarities.slice(0, k).map(item => item.document);
    }
    
    asRetriever(k = 4) {
        return {
            invoke: async (query) => {
                return await this.similaritySearch(query, k);
            }
        };
    }

    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    static async fromDocuments(docs, embeddings) {
        const store = new SimpleVectorStore(embeddings);
        await store.addDocuments(docs);
        return store;
    }
}
// ----------------------------------------------------

let vectorStore;

const initializeRAG = async () => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            console.warn("GOOGLE_API_KEY is missing in .env. AI features will be disabled.");
            return;
        }

        console.log("Initializing AI Assistant Knowledge Base...");
        const docPath = path.join(__dirname, "../docs/user_manual.md");
        
        if (!fs.existsSync(docPath)) {
            console.warn("User manual not found at:", docPath);
            return;
        }

        const text = fs.readFileSync(docPath, "utf8");

        if (!RecursiveCharacterTextSplitterClass) {
             console.error("TextSplitter library not found.");
             return;
        }

        const textSplitter = new RecursiveCharacterTextSplitterClass({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const loops = await textSplitter.splitText(text);
        
        const docs = loops.map(loop => new Document({ pageContent: loop }));

        const embeddings = new GoogleGenerativeAIEmbeddings({
            model: "embedding-001", // Or "text-embedding-004"
        });

        vectorStore = await SimpleVectorStore.fromDocuments(docs, embeddings);
        console.log("AI Assistant Ready!");
    } catch (error) {
        console.error("Error initializing AI:", error);
    }
};

const chatWithAI = async (query) => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            return "Chức năng AI chưa được kích hoạt (thiếu API Key).";
        }
        
        if (!vectorStore) {
            await initializeRAG();
            if (!vectorStore) return "Hệ thống đang khởi động hoặc gặp lỗi kết nối.";
        }

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-pro",
            temperature: 0.3,
        });

        const retriever = vectorStore.asRetriever(4);
        const contextDocs = await retriever.invoke(query);
        const context = contextDocs.map(doc => doc.pageContent).join("\n\n");

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `Bạn là trợ lý ảo AI hỗ trợ sử dụng phần mềm HRM.
            Hãy trả lời câu hỏi dựa trên thông tin ngữ cảnh được cung cấp bên dưới.
            Nếu thông tin không có trong ngữ cảnh, hãy nói rằng bạn không biết, đừng bịa đặt.
            Giữ giọng điệu chuyên nghiệp và thân thiện.
            
            Ngữ cảnh:
            {context}`],
            ["human", "{question}"],
        ]);

        const chain = prompt.pipe(model).pipe(new StringOutputParser());

        const response = await chain.invoke({
            context: context,
            question: query,
        });

        return response;

    } catch (error) {
        console.error("Chat Error:", error);
        return "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn.";
    }
};

// Initialize on start
initializeRAG();

module.exports = {
    chatWithAI
};
