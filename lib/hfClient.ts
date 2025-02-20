// WORKING UPDATED - INCLUDES STREAMING AND CHAT HISTORY
import { HfInference } from "@huggingface/inference";

// Define these yourself (in hfClient.ts or a separate file)
export interface ChatCompletionRequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionStreamResponse {
  choices?: Array<{
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
}

const HF_TOKEN = process.env.HUGGING_FACE_API_TOKEN || "";
if (!HF_TOKEN) {
  throw new Error("Hugging Face API Token is missing! Add it to .env.local");
}

export const hfClient = new HfInference(HF_TOKEN);

// This function returns an async iterator (a "stream") of ChatCompletionStreamResponse chunks
export function getChatCompletionStream(messages: ChatCompletionRequestMessage[]) {
  return hfClient.chatCompletionStream({
    model: "microsoft/Phi-3-mini-4k-instruct",
    messages,
    provider: "hf-inference",
    //max_tokens: 500,
    max_tokens: 1024,
  });

  /*return hfClient.chatCompletionStream({
    model: "microsoft/Phi-3-mini-4k-instruct",
    messages: [
      { role: "system", content: "Provide clear, concise responses. Do not add unnecessary spaces or line breaks." },
      ...messages,
    ],
    provider: "hf-inference",
    max_tokens: 1024,  // Increase token limit for longer responses
  });*/
}