import { ChatOpenAI } from "@langchain/openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key");
}

export const openai = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.7,
  modelName: "gpt-4-1106-preview",
}); 