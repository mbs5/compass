import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";

const SYSTEM_PROMPT = `You are a healthcare analytics assistant for Lōkahi Health Compass. 
Your role is to help users understand health trends, suggest interventions, and provide insights about health equity in Hawaii.
Focus on being:
1. Data-driven in your responses
2. Culturally sensitive and inclusive
3. Practical and actionable
4. Clear and concise`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      content: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 