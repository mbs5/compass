import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
  try {
    const { topic, targetAudience, culturalConsiderations } = await req.json();

    const prompt = `Generate culturally sensitive health education content about ${topic} for ${targetAudience}.
    Consider these cultural elements: ${culturalConsiderations}
    
    The content should be:
    1. Respectful of cultural values and beliefs
    2. Easy to understand
    3. Actionable and practical
    4. Inclusive of traditional practices where appropriate
    
    Format the response in clear paragraphs with appropriate headings.`;

    const response = await openai.invoke([new HumanMessage(prompt)]);

    return NextResponse.json({
      content: response.content,
      language: "en",
    });
  } catch (error) {
    console.error("Error generating education content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
} 