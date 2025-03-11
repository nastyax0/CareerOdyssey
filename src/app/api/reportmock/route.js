import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";


  


export async function GET(req) {
  try {
    console.log("Checking ENV Vars in API Route...");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
  console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY);

  return NextResponse.json({ message: "API route is working!" }, { status: 200 });
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: sessionError } = await supabase.auth.getUser(token);

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized. Invalid session." }, { status: 401 });
    }

    const userId = user.id;
    console.log("Authenticated User ID:", userId);

    const { data: responses, error } = await supabase
      .from("user_responses")
      .select("*")
      .eq("user_id", userId);

    console.log("Supabase Query Result:", responses);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: "No responses found." }, { status: 404 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
User responses: ${JSON.stringify(responses)}

Based on these responses, analyze the user's preferences and suggest a suitable career path.
Provide:
1. Career Recommendation
2. Key insights explaining the choice
3. Learning resources and next steps
`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    console.log("Generated Report:", responseText);

    return NextResponse.json({ report: responseText }, { status: 200 });

  } catch (err) {
    console.error("Unexpected Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}