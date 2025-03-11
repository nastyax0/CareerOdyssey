import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    
    const body = await req.json();
    const { messages } = body;

    
    const systemPrompt = {
      role: "user",
      parts: [{ text: `You are a career chatbot that helps users find their ideal job.
        ⚡ Keep replies short and to the point (2-3 sentences max).
        💡 Give specific career suggestions, not vague responses.
        😊 Use a friendly, conversational style.
        🚀 If a user is confused, suggest categories like high-income jobs, STEM, Arts, or location-based careers.
        Let's start! Ask the user what interests them!
        You are an expert AI career counselor. Help users find the right job.
        - If a user is confused, suggest career categories: "Tech", "Finance", "Healthcare", "Creative Arts", etc.
        - Ask at least **one follow-up question** to refine their interests.
        - Keep responses concise (2-3 sentences).
        - Provide clear **career paths** (job roles + required skills).
        - Suggest next steps: courses, certifications, or entry-level jobs.
        - If a user asks general advice, offer **structured responses** (pros/cons, required skills, etc.).
        - If the user is logged in, check stored preferences and personalize responses.
        User: ${messages.map(msg => `${msg.role}: ${msg.text}`).join("\n")}`}
    ]};

   
    console.log('System Prompt:', systemPrompt);

    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    
    const response = await model.generateContent({
      contents: [systemPrompt, ...messages.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : "user",
        parts: [{ text: msg.text }],
      }))],
    });

    
    console.log('Gemini API Response:', response);

    
    const reply = response.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    
    return new Response(
      JSON.stringify({ reply: "Error processing your request." }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
