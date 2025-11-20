import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const summarizeContent = async (input: string): Promise<string> => {
  try {
    const client = getClient();
    
    // We use the Search tool to simulate the "Scraping" part of the stack
    // This allows the model to fetch real-time info about the URL or Topic provided.
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an intelligent content processor. 
      The user has provided the following input (which may be a URL or a topic): "${input}".
      
      1. If it is a URL, use Google Search to find the content of that page.
      2. If it is a topic, search for the latest information on it.
      3. Provide a comprehensive summary of the content.
      4. Extract 3-5 key takeaways.
      5. Format the output in clean Markdown.
      `,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    if (response.text) {
      return response.text;
    }
    
    return "No content generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process content via Gemini");
  }
};