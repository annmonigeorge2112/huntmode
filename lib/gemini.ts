import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function geminiSearch(query: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    const result = await model.generateContent(query);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini search error:", error);
    return "";
  }
}

export async function searchJobListings(company: string, location: string): Promise<string> {
  const query = `Search for ECE/embedded systems/IoT internship openings at "${company}" in "${location}" for January 2027. 
  Return: job titles, company career page URL, application deadlines, and brief descriptions.
  Focus on: firmware, microcontroller, embedded systems, automotive, semiconductor, IoT roles.`;

  return geminiSearch(query);
}

export async function findHRProfiles(company: string): Promise<string> {
  const query = `Find HR recruiters or talent acquisition specialists at "${company}" who handle ECE/embedded systems/engineering internship hiring.
  Include: names, titles, LinkedIn profiles if public, and any public contact information.
  Prioritize: university relations, campus recruitment, engineering hiring managers.`;

  return geminiSearch(query);
}
