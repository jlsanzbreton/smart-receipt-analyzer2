import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { ReceiptData, Category, CategorizedExpense, SavingsInsight, GeminiReceiptResponse, SavingsInsightItem, ReceiptItem } from '../types';
import { GEMINI_TEXT_MODEL, DEFAULT_CATEGORIES } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure process.env.API_KEY is available.");
  // In a real app, you might want to prevent API calls or show a persistent error to the user.
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "FALLBACK_API_KEY_MUST_BE_REPLACED" });

if (!API_KEY) {
    // This console log might appear if the app somehow continues with a dummy key.
    console.error("Gemini API Key is missing. The application's AI features will not function correctly.");
}

const MAX_RETRIES = 2; // Initial attempt + 2 retries = 3 total attempts
const RETRY_DELAY_MS = 1000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetries<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let attempts = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      if (attempts > MAX_RETRIES) {
        console.error(`${operationName} failed after ${attempts} attempts.`, error);
        if (error instanceof Error) {
            throw new Error(`AI operation '${operationName}' failed after multiple retries: ${error.message}`);
        } else {
            throw new Error(`AI operation '${operationName}' failed after multiple retries with an unknown error type.`);
        }
      }
      console.warn(`${operationName} attempt ${attempts} failed. Retrying in ${RETRY_DELAY_MS}ms...`, error);
      await delay(RETRY_DELAY_MS);
    }
  }
}

function parseJsonFromGeminiResponse(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Handles optional language specifier and varying newlines
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response from AI.", e);
    console.error("Raw AI text response:", text);
    throw new Error(`Failed to parse JSON response from AI. Preview: "${text.substring(0, 200)}..."`);
  }
}

const safeParseFloat = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const stringValue = String(value).trim();
  if (stringValue === "") return defaultValue;
  
  const num = parseFloat(stringValue);
  return isNaN(num) ? defaultValue : num;
};

export const analyzeReceipt = async (imageDataBase64: string): Promise<ReceiptData> => {
  return withRetries(async () => {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Consider making this dynamic if other types are common
        data: imageDataBase64,
      },
    };
    const textPart = {
      text: `Analyze this receipt image and extract information in JSON format.
      The JSON schema MUST be strictly followed:
      {
        "vendorName": "string",
        "transactionDate": "YYYY-MM-DD",
        "items": [
          {
            "description": "string",
            "quantity": "number (default to 1 if not specified but item exists)",
            "unitPrice": "number (optional, omit if not present)",
            "totalPrice": "number (mandatory for each item)"
          }
        ],
        "subtotal": "number (optional)",
        "taxAmount": "number (optional)",
        "totalAmount": "number (mandatory, critical)",
        "currency": "string (e.g., EUR, USD, GBP - use the symbol or code found)",
        "paymentMethod": "string (optional, e.g., Card, Cash, Visa)"
      }
      Important Rules:
      1. All monetary values and quantities MUST be numbers, not strings.
      2. Dates MUST be "YYYY-MM-DD". If unclear, try to infer or use today's date as a last resort if context allows, but preferably state unclear. For this task, try your best to find it on the receipt.
      3. If 'totalAmount' is not found, this is a critical failure; try your best.
      4. 'vendorName' is critical.
      5. For 'items': 'description' and 'totalPrice' are mandatory. If 'quantity' is not specified, assume 1. 'unitPrice' is optional.
      6. Do not invent data. If a field is not on the receipt, omit optional fields or use sensible defaults for required fields if contextually appropriate (e.g. quantity 1).
      7. Stick to the schema. No extra fields. Do not use "N/A" or placeholder text for numeric fields; extract the number or omit/default as per schema.
      8. If no items are clearly identifiable, "items" array can be empty.
      9. Extract 'currency' accurately. Default to EUR if absolutely not found.
      `,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } // For gemini-2.5-flash-preview-04-17
      },
    });

    const parsed = parseJsonFromGeminiResponse(response.text) as GeminiReceiptResponse;

    if (!parsed.totalAmount || !parsed.vendorName || !parsed.transactionDate) {
      console.error("Critical data missing from AI response:", parsed);
      throw new Error('AI response missing one or more critical fields: totalAmount, vendorName, or transactionDate.');
    }

    const items: ReceiptItem[] = (parsed.items || []).map((item: any) => ({
      description: String(item.description || 'Unknown Item'),
      quantity: safeParseFloat(item.quantity, 1), // Default quantity to 1
      unitPrice: item.unitPrice !== undefined ? safeParseFloat(item.unitPrice) : undefined,
      totalPrice: safeParseFloat(item.totalPrice),
    }));
    
    // Ensure totalAmount is a number, even if AI sends it as string (safeParseFloat handles this)
    const totalAmount = safeParseFloat(parsed.totalAmount);
    if (totalAmount === 0 && parsed.totalAmount !== 0 && String(parsed.totalAmount).trim() !== "0") {
        // This condition tries to catch if totalAmount was non-zero but parsed to 0, indicating a potential issue.
        // However, a legitimate 0 total is possible. The check above for !parsed.totalAmount is more direct for missing critical data.
        console.warn("Parsed totalAmount is 0, while original AI response was non-zero or non-empty. Original:", parsed.totalAmount);
    }


    return {
      vendorName: String(parsed.vendorName || 'Unknown Vendor'),
      transactionDate: String(parsed.transactionDate), // Already validated non-empty
      items: items,
      subtotal: parsed.subtotal !== undefined ? safeParseFloat(parsed.subtotal) : undefined,
      taxAmount: parsed.taxAmount !== undefined ? safeParseFloat(parsed.taxAmount) : undefined,
      totalAmount: totalAmount,
      currency: String(parsed.currency || 'EUR'), // Default to EUR
      paymentMethod: parsed.paymentMethod ? String(parsed.paymentMethod) : undefined,
    };
  }, "Analyze Receipt OCR & Parse");
};


export const classifyExpense = async (vendorName: string, itemDescriptions: string): Promise<Category> => {
 return withRetries(async () => {
    const categoriesString = DEFAULT_CATEGORIES.join(', ');
    const prompt = `Given the vendor name "${vendorName}" and item descriptions (e.g., "${itemDescriptions.substring(0,100)}..."), classify this expense into ONE of the following categories: ${categoriesString}.
    Return ONLY the category name as a single string from the provided list. For example, if it's for food from a supermarket, return "Groceries". If it's a restaurant meal, return "Dining Out".
    If uncertain, choose the most general applicable category from the list or "Other". Do not invent new categories.
    The response must be exactly one of these category names: ${categoriesString}.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        // No specific config like responseMimeType needed, as we expect a simple string.
    });

    let category = response.text.trim();

    // Ensure the response is one of the exact category strings.
    if (!DEFAULT_CATEGORIES.includes(category as Category)) {
      console.warn(`Gemini returned a category not in the defined list: "${category}". Attempting to find a close match or defaulting to "Other".`);
      // Simple fallback, could be improved with fuzzy matching if needed
      const lowerCaseCategory = category.toLowerCase();
      const matchedCategory = DEFAULT_CATEGORIES.find(c => c.toLowerCase() === lowerCaseCategory);
      category = matchedCategory || 'Other';
    }
    return category as Category;
  }, "Classify Expense Category");
};

export const getSavingsInsights = async (expenses: CategorizedExpense[]): Promise<SavingsInsight> => {
  return withRetries(async () => {
    const categoriesString = DEFAULT_CATEGORIES.join(', ');
    const prompt = `
      Analyze the following expenses (JSON format) and provide savings insights.
      Expenses:
      ${JSON.stringify(expenses.slice(0, 50), null, 2)} 
      ${expenses.length > 50 ? `\n(...and ${expenses.length - 50} more expenses not shown to save space)` : ''}

      Return a JSON object with two keys: "insights" and "overallSummary".
      1. "overallSummary": A brief text (2-4 sentences) summarizing key spending patterns and overall potential for savings. Be encouraging.
      2. "insights": An array of 2 to 4 objects, each representing a specific insight. Each insight object MUST have:
         - "category": A string, MUST be one of these exact category names: ${categoriesString}.
         - "observation": A string (1-2 sentences) describing a specific spending observation in this category (e.g., "Frequent small purchases in 'Shopping' add up.").
         - "suggestion": A string (1-2 sentences) offering a concrete, actionable savings suggestion (e.g., "Consider consolidating shopping trips or setting a weekly budget for non-essentials.").
         - "potentialSaving": A brief string describing potential savings (e.g., "Approx. €15-25/month", "Could reduce by 10-15%", "Modest but consistent"). Avoid overly precise or speculative large numbers.

      Focus on impactful categories or habits. Provide practical, realistic suggestions.
      The entire response MUST be a single, valid JSON object. Ensure all text strings are well-formed.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        }
    });
    
    const parsed = parseJsonFromGeminiResponse(response.text);

    if (!parsed.insights || !Array.isArray(parsed.insights) || typeof parsed.overallSummary !== 'string') {
        console.error("Invalid structure for savings insights from AI:", parsed);
        throw new Error("AI returned an invalid or incomplete structure for savings insights.");
    }
    
    const validatedInsights: SavingsInsightItem[] = parsed.insights.map((item: any) => {
        const category = DEFAULT_CATEGORIES.includes(item.category as Category) ? item.category : 'Other';
        return {
            category: category as Category,
            observation: String(item.observation || "No specific observation provided."),
            suggestion: String(item.suggestion || "No specific suggestion provided."),
            potentialSaving: String(item.potentialSaving || "Not specified.")
        };
    }).slice(0, 4); // Ensure we don't exceed a reasonable number of insights, e.g., max 4.

    return {
      insights: validatedInsights,
      overallSummary: String(parsed.overallSummary || "No overall summary provided by AI."),
    };
  }, "Get Savings Insights");
};
