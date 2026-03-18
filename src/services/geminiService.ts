import { GoogleGenAI, Type } from "@google/genai";
import { Project, EvaluationScores } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface EvaluationResult {
  scores: EvaluationScores;
  feedback: string;
  suggestions: string[];
}

export async function evaluateProject(project: Project): Promise<EvaluationResult> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Evaluate the following student project for a Data Science academic environment.
    
    Project Title: ${project.title}
    Description: ${project.description}
    GitHub Link: ${project.githubLink || 'N/A'}
    Content: ${project.content.substring(0, 10000)} // Limit content to 10k chars for now
    
    Please provide a structured evaluation based on:
    1. Innovation: How unique and creative is the approach?
    2. Technical Depth: Complexity of the data science techniques used.
    3. Clarity: How well is the project documented and explained?
    4. Real-world Impact: Potential for practical application.
    
    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.OBJECT,
            properties: {
              innovation: { type: Type.NUMBER, description: "Score from 0 to 100" },
              technicalDepth: { type: Type.NUMBER, description: "Score from 0 to 100" },
              clarity: { type: Type.NUMBER, description: "Score from 0 to 100" },
              impact: { type: Type.NUMBER, description: "Score from 0 to 100" },
              overall: { type: Type.NUMBER, description: "Average score from 0 to 100" }
            },
            required: ["innovation", "technicalDepth", "clarity", "impact", "overall"]
          },
          feedback: { type: Type.STRING, description: "Detailed feedback on the project" },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of improvement suggestions"
          }
        },
        required: ["scores", "feedback", "suggestions"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI failed to generate evaluation.");
  
  return JSON.parse(text) as EvaluationResult;
}
