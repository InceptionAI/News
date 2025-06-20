const { GoogleGenerativeAI } = require("@google/generative-ai")

require('dotenv').config();

const geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const gemini = geminiAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});