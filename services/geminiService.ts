
import { GoogleGenAI, Type } from "@google/genai";
import { LifeValue, DailyAction, GeminiInsight, SmartLogResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getValuesInsight(values: LifeValue[], actions: DailyAction[]): Promise<GeminiInsight> {
  const recentActions = actions.slice(-50);
  
  const actionsSummary = recentActions.map(a => {
    const impactsText = a.impacts?.map(imp => {
      const valName = values.find(v => v.id === imp.valueId)?.name || 'Unknown';
      return `${valName} (${imp.impact})`;
    }).join(', ');
    return `- [${a.mood || 'neutral'}] ${a.description}: ${impactsText}`;
  }).join('\n');

  const prompt = `
    You are an ACT (Acceptance and Commitment Therapy) mentor. 
    Analyze the user's values vs actions to identify psychological patterns.
    
    User's Life Values (Target Directions):
    ${values.map(v => `- ${v.name}: Importance ${v.importance}/10`).join('\n')}
    
    Action History (Recent Experience):
    ${actionsSummary}
    
    TASK:
    1. Identify "Value-Action Gaps": Where is the user falling short of their own priorities?
    2. Detect Behavioral Loops (Patterns):
       - "Experiential Avoidance": Actions taken to avoid discomfort that lead away from values (e.g., procastination, substances).
       - "Habitual Wins": Positive recurring actions that build momentum.
       - "Value Conflicts": Patterns where one value (e.g., Work) consistently overrides another (e.g., Health/Family).
    3. Output in JSON format with:
       - analysis: A high-level, wise observation of their current psychological flexibility.
       - suggestions: 3 concrete, value-aligned small steps.
       - alignmentScore: 0-100 reflecting how well actions match priorities.
       - patterns: Array of {description, type ('negative' | 'positive'), count, advice}. 
         The 'advice' should be a mentor-style coaching tip in Russian.
       - ideaOfDay: A tiny, specific mission related to their lowest-scoring high-importance value.

    LANGUAGE: Russian. 
    STYLE: Wise, compassionate, non-judgmental.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            alignmentScore: { type: Type.NUMBER },
            patterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  type: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  advice: { type: Type.STRING }
                },
                required: ["description", "type", "count", "advice"]
              }
            },
            ideaOfDay: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                valueId: { type: Type.STRING }
              },
              required: ["title", "description", "valueId"]
            }
          },
          required: ["analysis", "suggestions", "alignmentScore", "patterns"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as GeminiInsight;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      analysis: "Продолжайте осознанно двигаться к своим ценностям.",
      suggestions: ["Сделайте один маленький шаг сегодня", "Прислушайтесь к своим чувствам"],
      alignmentScore: 50,
      patterns: []
    };
  }
}

export async function parseNaturalLanguageAction(text: string, values: LifeValue[]): Promise<SmartLogResult> {
  const prompt = `
    User input: "${text}"
    Available Life Values:
    ${values.map(v => `- ID: ${v.id}, Name: ${v.name}`).join('\n')}
    
    TASK:
    Identify all distinct actions described by the user. 
    For each action:
    - description: Concise summary in Russian.
    - impacts: Array of {valueId, impact} where impact is -5 to +5.
    - confidence: Score 0-1.
    
    Return a JSON object with an "actions" array. 
    LANGUAGE: Russian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  impacts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        valueId: { type: Type.STRING },
                        impact: { type: Type.NUMBER }
                      },
                      required: ["valueId", "impact"]
                    }
                  },
                  confidence: { type: Type.NUMBER }
                },
                required: ["description", "impacts", "confidence"]
              }
            }
          },
          required: ["actions"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as SmartLogResult;
  } catch (error) {
    throw new Error("Failed to parse actions");
  }
}

export async function parseAudioAction(base64Audio: string, mimeType: string, values: LifeValue[]): Promise<SmartLogResult> {
  const prompt = `
    This audio clip contains a user describing things they did today.
    Available Life Values:
    ${values.map(v => `- ID: ${v.id}, Name: ${v.name}`).join('\n')}
    
    Extract actions, identify the values impacted, and the impact weight (-5 to +5).
    Return a JSON object with an "actions" array.
    LANGUAGE: Russian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Audio, mimeType: mimeType } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  impacts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        valueId: { type: Type.STRING },
                        impact: { type: Type.NUMBER }
                      },
                      required: ["valueId", "impact"]
                    }
                  },
                  confidence: { type: Type.NUMBER }
                },
                required: ["description", "impacts", "confidence"]
              }
            }
          },
          required: ["actions"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as SmartLogResult;
  } catch (error) {
    console.error("Audio Parsing Error:", error);
    throw new Error("Failed to parse audio actions");
  }
}

export async function sendChatMessage(history: ChatMessage[], message: string, values: LifeValue[], actions: DailyAction[]): Promise<string> {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    config: {
      systemInstruction: `You are a warm, wise, and empathetic ACT (Acceptance and Commitment Therapy) mentor. 
      Help the user align their actions with their values: ${values.map(v => v.name).join(', ')}.
      Reply in Russian. Keep responses concise but psychologically profound.`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "Извините, я не смог сформулировать ответ.";
}
