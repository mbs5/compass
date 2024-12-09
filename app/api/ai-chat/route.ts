import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
const db = require("@/app/lib/db");

const WELCOME_MESSAGE = `Hi! I'm your Lōkahi Health Compass AI assistant. I can help you understand health trends, demographics, and conditions in our database. Here are some things you can ask me:

📊 Data Analysis:
- "What's the population distribution by race?"
- "Show me the most common health conditions"
- "How many patients do we have in each state?"

📈 Trends & Insights:
- "What are the current mental health trends?"
- "Compare chronic disease rates across different demographics"
- "Which conditions are increasing the most?"

🔍 Specific Queries:
- "What's the percentage of Hispanic patients?"
- "Show respiratory conditions in Hawaii"
- "Compare health outcomes between states"

Feel free to ask any questions about our health data!`;

// Enhanced database query function with more specific queries
async function queryHealthData(question: string) {
  try {
    const queries = {
      // Demographics queries
      race: `
        SELECT 
          CASE race
            WHEN '1' THEN 'Asian'
            WHEN '2' THEN 'Black'
            WHEN '3' THEN 'Hispanic'
            WHEN '4' THEN 'White'
          END as race_group,
          SUM(count) as total
        FROM demographic_summary
        GROUP BY race
        ORDER BY total DESC
      `,
      ethnicity: `
        SELECT 
          CASE ethnicity
            WHEN '1' THEN 'Hispanic'
            WHEN '2' THEN 'Non-Hispanic'
            WHEN '3' THEN 'Unknown'
          END as ethnicity_group,
          SUM(count) as total
        FROM demographic_summary
        GROUP BY ethnicity
        ORDER BY total DESC
      `,
      state: `
        SELECT state, SUM(count) as total
        FROM demographic_summary
        GROUP BY state
        ORDER BY total DESC
      `,
      gender: `
        SELECT gender, SUM(count) as total
        FROM demographic_summary
        GROUP BY gender
        ORDER BY total DESC
      `,
      // Condition queries
      conditions: `
        SELECT condition, SUM(count) as total
        FROM demographic_summary
        GROUP BY condition
        ORDER BY total DESC
      `,
      // Combined queries
      conditionsByRace: `
        SELECT 
          CASE race
            WHEN '1' THEN 'Asian'
            WHEN '2' THEN 'Black'
            WHEN '3' THEN 'Hispanic'
            WHEN '4' THEN 'White'
          END as race_group,
          condition,
          SUM(count) as total
        FROM demographic_summary
        GROUP BY race, condition
        ORDER BY race, total DESC
      `,
      conditionsByState: `
        SELECT state, condition, SUM(count) as total
        FROM demographic_summary
        GROUP BY state, condition
        ORDER BY state, total DESC
      `
    };

    const questionLower = question.toLowerCase();
    let results: any = {};

    // Match question to appropriate queries
    if (questionLower.includes('race') || questionLower.includes('demographic')) {
      results.raceDistribution = await db.prepare(queries.race).all();
    }
    if (questionLower.includes('ethnicity')) {
      results.ethnicityDistribution = await db.prepare(queries.ethnicity).all();
    }
    if (questionLower.includes('state') || questionLower.includes('location')) {
      results.stateDistribution = await db.prepare(queries.state).all();
    }
    if (questionLower.includes('gender')) {
      results.genderDistribution = await db.prepare(queries.gender).all();
    }
    if (questionLower.includes('condition') || questionLower.includes('health')) {
      results.conditions = await db.prepare(queries.conditions).all();
    }
    if (questionLower.includes('compare') || questionLower.includes('across')) {
      if (questionLower.includes('race')) {
        results.conditionsByRace = await db.prepare(queries.conditionsByRace).all();
      }
      if (questionLower.includes('state')) {
        results.conditionsByState = await db.prepare(queries.conditionsByState).all();
      }
    }

    return Object.keys(results).length > 0 ? results : null;
  } catch (error) {
    console.error("Database query error:", error);
    return null;
  }
}

const SYSTEM_PROMPT = `You are a helpful and knowledgeable health data assistant for Lokahi Compass.
You have access to health data that includes:
- Demographic information (race, ethnicity, gender, state)
- Health conditions and their trends over time
- Population health statistics and insights

Your role is to:
1. Analyze and explain health data clearly and concisely
2. Identify meaningful patterns and trends
3. Provide culturally sensitive insights
4. Help users understand population health metrics

When responding:
- Always format numbers with commas for readability (e.g., 1,234,567)
- Use percentages when comparing distributions
- Highlight significant patterns or disparities
- Be direct and concise in your explanations
- If you're not sure about something, be honest and say so

Current data structure:
- Race categories: Asian, Black, Hispanic, White
- Ethnicity categories: Hispanic, Non-Hispanic, Unknown
- Health conditions: Mental Health, Chronic Disease, Respiratory, Cancer & Critical, Healthy, Other
- States: HI, CA, WA, MI

Base your responses on actual data when possible. If asked about specific statistics, use the provided database results.`;

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    // Return welcome message for empty history
    if (!history || history.length === 0) {
      return NextResponse.json({ 
        response: WELCOME_MESSAGE,
        dataContext: null
      });
    }

    // Query relevant data based on user's question
    const data = await queryHealthData(message);
    let enhancedMessage = message;
    if (data) {
      enhancedMessage += "\n\nAvailable data: " + JSON.stringify(data);
    }

    // Format conversation history for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: enhancedMessage }
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content,
      dataContext: data ? {
        queriesExecuted: Object.keys(data),
        data: data,
        timestamp: new Date().toISOString()
      } : null
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
} 