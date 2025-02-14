import { HfInference } from "@huggingface/inference";

const HF_TOKEN = process.env.HUGGING_FACE_API_TOKEN || "";

if (!HF_TOKEN) {
  throw new Error("Hugging Face API Token is missing! Add it to .env.local");
}

export const hfClient = new HfInference(HF_TOKEN);

// ✅ Define the correct response type manually
interface ChatCompletionResponse {
  choices: { message: { content?: string } }[];
}

export const getChatCompletion = async (message: string): Promise<string> => {
  try {
    const response: ChatCompletionResponse = await hfClient.chatCompletion({
      model: "microsoft/Phi-3-mini-4k-instruct",
      messages: [{ role: "user", content: message }],
      provider: "hf-inference",
      max_tokens: 500,
    });

    // ✅ Safely extract AI response
    const aiMessage = response.choices?.[0]?.message?.content ?? "No response from AI";

    return aiMessage;
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    return "Error occurred!";
  }
};
