import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief 2-sentence summary of the auto sales interaction (showroom or phone) in Chinese.",
    },
    keyInsight: {
        type: Type.STRING,
        description: "A single, powerful insight sentence about the key moment (e.g. test drive agreement, budget objection) in Chinese.",
    },
    transcript: {
      type: Type.ARRAY,
      description: "A diarized transcript of the conversation in Chinese.",
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: {
            type: Type.STRING,
            description: "Identify as '销售顾问' (Sales Consultant) or '客户' (Customer).",
          },
          text: {
            type: Type.STRING,
            description: "The spoken text in Chinese.",
          },
          timestamp: {
            type: Type.STRING,
            description: "Timestamp string, e.g., '00:15'.",
          },
        },
        required: ["speaker", "text", "timestamp"],
      },
    },
    sentimentGraph: {
      type: Type.ARRAY,
      description: "Data points representing engagement level (0-100) roughly every 30-60 seconds.",
      items: {
        type: Type.OBJECT,
        properties: {
          timeOffset: {
            type: Type.NUMBER,
            description: "Numeric value for sorting order.",
          },
          label: {
            type: Type.STRING,
            description: "Display time label, e.g., '1m'.",
          },
          engagementScore: {
            type: Type.NUMBER,
            description: "Engagement score from 0 to 100.",
          },
        },
        required: ["timeOffset", "label", "engagementScore"],
      },
    },
    coaching: {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3 specific things the sales consultant did well (e.g. needs analysis, FAB presentation, closing) in Chinese.",
        },
        missedOpportunities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3 specific missed opportunities (e.g. forgot to ask for budget, didn't offer test drive, weak objection handling) in Chinese.",
        },
      },
      required: ["strengths", "missedOpportunities"],
    },
  },
  required: ["summary", "keyInsight", "transcript", "sentimentGraph", "coaching"],
};

export const validateGeminiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: "ping" }] },
    });
    return true;
  } catch (error) {
    console.warn("Gemini Validation Failed:", error);
    return false;
  }
};

export const analyzeSalesCall = async (base64Audio: string, mimeType: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure it in settings.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `你是一位拥有20年经验的资深汽车销售培训专家 (Auto Sales Expert)。请分析这段汽车销售对话录音（可能是展厅接待或电话邀约）。请用中文（简体）回答。

            1. 识别说话人：严格使用 "销售顾问" 代表 Salesperson，使用 "客户" 代表 Prospect。
            2. 创建逐字稿 (Transcript)。
            3. 评估客户在整个通话过程中的参与度 (0-100分)。
            4. 提供辅导评估 (Coaching)：
               - 优势 (Strengths)：寻找优秀的需求挖掘（用车场景、家庭人口）、车型介绍（FAB法则）、试驾邀约技巧或异议处理表现。
               - 改进机会 (Missed Opportunities)：指出未询问的关键问题（如预算范围、竞品对比）、错过的试驾邀请时机、或生硬的价格谈判。
            5. 提取一个 "关键洞察" (Key Insight)，总结成交的关键卡点或促成点。
            
            请严格按照提供的 JSON Schema 格式返回数据。`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing sales call:", error);
    throw error;
  }
};