import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
const db = require("@/app/lib/db");

interface DemographicData {
  race_group: string;
  total: number;
  percentage?: string;
}

interface StateData {
  state: string;
  total: number;
  percentage?: string;
}

interface ConditionData {
  condition: string;
  total: number;
  percentage?: string;
}

interface HealthData {
  demographics: DemographicData[];
  stateDistribution: StateData[];
  relatedConditions: ConditionData[];
  totalPopulation: number;
}

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
Your role is to create culturally sensitive, practical health education materials backed by our database.

Guidelines:
1. Keep content concise and focused (max 500 words)
2. Use simple, clear language
3. Include cultural elements naturally
4. Structure with clear headings
5. Focus on actionable advice
6. Use in-text citations for data references [Data, 2023]
7. Reference specific statistics from provided data

Format your response EXACTLY as follows:

- Overview
A clear 2-3 sentence introduction to the topic. Include key statistics from our database, using the format: "According to our health records [Data, 2023], X% of our population...". Focus on total population affected and key demographic insights.

- Key Points
• Use specific data points with citations, e.g., "Affects X% of [specific demographic] population [Data, 2023]"
• Compare statistics across different demographics or regions
• Highlight significant trends or patterns from the data

- Cultural Considerations
Write 2-3 short paragraphs about cultural aspects. Reference demographic data when available, e.g., "Our data shows a higher prevalence in [specific community] [Data, 2023]". Discuss any geographic or demographic patterns revealed in the data.

- Practical Steps
• Include data-backed recommendations, e.g., "Given the high incidence in [location] [Data, 2023]..."
• Reference successful approaches based on our population data
• Customize advice based on demographic patterns
• Include community-specific recommendations based on data trends

- Additional Resources
• Include location-specific resources based on state distribution data
• Reference community health centers in areas with high prevalence
• Suggest support groups or programs relevant to affected demographics

Important formatting rules:
1. Use only bullet points (•) for lists
2. Never use asterisks (*) anywhere
3. Keep paragraphs short and focused
4. Start each section with "- " (hyphen space)
5. Use [Data, 2023] citation format for all statistics
6. Format numbers with commas for thousands
7. Include percentages alongside absolute numbers`;

export async function POST(req: Request) {
  try {
    const { topic, targetAudience, culturalConsiderations } = await req.json();

    // Get relevant health data
    const healthData = await getHealthData(topic);
    
    // Process percentages and rankings
    let enhancedData = null;
    if (healthData) {
      const total = healthData.totalPopulation;
      enhancedData = {
        ...healthData,
        demographics: healthData.demographics.map((d: DemographicData) => ({
          ...d,
          percentage: ((d.total / total) * 100).toFixed(1)
        })),
        stateDistribution: healthData.stateDistribution.map((d: StateData) => ({
          ...d,
          percentage: ((d.total / total) * 100).toFixed(1)
        })),
        relatedConditions: healthData.relatedConditions.map((d: ConditionData) => ({
          ...d,
          percentage: ((d.total / total) * 100).toFixed(1)
        }))
      };
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Create health education content about ${topic} for ${targetAudience}.
Cultural context to consider: ${culturalConsiderations}

${enhancedData ? `Available data for context:
• Total affected population: ${enhancedData.totalPopulation.toLocaleString()} patients

Demographic Distribution:
${enhancedData.demographics.map((d: DemographicData) => 
  `• ${d.race_group}: ${d.total.toLocaleString()} (${d.percentage}% of total)`
).join('\n')}

Geographic Distribution:
${enhancedData.stateDistribution.map((d: StateData) => 
  `• ${d.state}: ${d.total.toLocaleString()} (${d.percentage}% of total)`
).join('\n')}

Related Conditions:
${enhancedData.relatedConditions.map((d: ConditionData) => 
  `• ${d.condition}: ${d.total.toLocaleString()} (${d.percentage}% of cases)`
).join('\n')}` : ''}

Remember:
- Start each section with "- " (hyphen space)
- Use bullet points (•) for lists
- Never use asterisks
- Keep it concise and practical
- Use [Data, 2023] citation format for statistics
- Include both absolute numbers and percentages when citing data`
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
      dataContext: enhancedData ? {
        queriesExecuted: Object.keys(healthData || {}),
        data: enhancedData,
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