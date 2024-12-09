import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
const db = require("@/app/lib/db");

// Function to get relevant health data
async function getHealthData(topic: string) {
  try {
    const queries = {
      // Demographics for the condition
      demographics: `
        SELECT 
          CASE race
            WHEN '1' THEN 'Asian'
            WHEN '2' THEN 'Black'
            WHEN '3' THEN 'Hispanic'
            WHEN '4' THEN 'White'
          END as race_group,
          SUM(count) as total
        FROM demographic_summary
        WHERE condition LIKE ?
        GROUP BY race
        ORDER BY total DESC
      `,
      // State distribution
      stateDistribution: `
        SELECT state, SUM(count) as total
        FROM demographic_summary
        WHERE condition LIKE ?
        GROUP BY state
        ORDER BY total DESC
      `,
      // Related conditions
      relatedConditions: `
        SELECT condition, SUM(count) as total
        FROM demographic_summary
        WHERE condition LIKE ?
        GROUP BY condition
        ORDER BY total DESC
        LIMIT 5
      `
    };

    const searchTerm = `%${topic}%`;
    const results: any = {};

    // Execute queries
    results.demographics = await db.prepare(queries.demographics).all([searchTerm]);
    results.stateDistribution = await db.prepare(queries.stateDistribution).all([searchTerm]);
    results.relatedConditions = await db.prepare(queries.relatedConditions).all([searchTerm]);

    // Calculate total population
    const totalQuery = `
      SELECT SUM(count) as total
      FROM demographic_summary
      WHERE condition LIKE ?
    `;
    const totalResult = await db.prepare(totalQuery).get([searchTerm]);
    results.totalPopulation = totalResult?.total || 0;

    return results;
  } catch (error) {
    console.error("Error fetching health data:", error);
    return null;
  }
}

const SYSTEM_PROMPT = `You are a specialized health education content generator for Lōkahi Health Compass.
Your role is to create culturally sensitive, practical health education materials.

Guidelines:
1. Keep content concise and focused (max 500 words)
2. Use simple, clear language
3. Include cultural elements naturally
4. Structure with clear headings
5. Focus on actionable advice
6. Include both modern and traditional approaches where appropriate
7. Reference provided data when available

Format your response EXACTLY as follows:

- Overview
A clear 2-3 sentence introduction to the topic. Include relevant statistics when available.

- Key Points
• First important point about the topic
• Second important point about the topic
• Third important point about the topic

- Cultural Considerations
Write 2-3 short paragraphs about cultural aspects. Reference demographic data when available.

- Practical Steps
• Clear action step one
• Clear action step two
• Clear action step three
• Clear action step four

- Additional Resources
• First relevant resource with contact info
• Second relevant resource with contact info
• Third relevant resource with contact info

Important formatting rules:
1. Use only bullet points (•) for lists
2. Never use asterisks (*) anywhere
3. Keep paragraphs short and focused
4. Start each section with "- " (hyphen space)
5. Use plain text without any special formatting`;

export async function POST(req: Request) {
  try {
    const { topic, targetAudience, culturalConsiderations } = await req.json();

    // Get relevant health data
    const healthData = await getHealthData(topic);
    
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Create health education content about ${topic} for ${targetAudience}.
Cultural context to consider: ${culturalConsiderations}

${healthData ? `Available data for context:
• Total affected population: ${healthData.totalPopulation.toLocaleString()}
• Demographic distribution: ${JSON.stringify(healthData.demographics, null, 2)}
• Geographic distribution: ${JSON.stringify(healthData.stateDistribution, null, 2)}
• Related conditions: ${JSON.stringify(healthData.relatedConditions, null, 2)}` : ''}

Remember:
- Start each section with "- " (hyphen space)
- Use bullet points (•) for lists
- Never use asterisks
- Keep it concise and practical
- Reference the provided data where relevant`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    // Clean up any remaining asterisks
    const content = completion.choices[0].message.content?.replace(/\*/g, '•') || '';

    return NextResponse.json({
      content,
      dataContext: healthData ? {
        queriesExecuted: Object.keys(healthData),
        data: healthData,
        timestamp: new Date().toISOString()
      } : null,
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