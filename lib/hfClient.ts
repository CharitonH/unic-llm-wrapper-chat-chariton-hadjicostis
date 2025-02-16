// INCLUDE STREAMING
import { HfInference } from "@huggingface/inference";

const HF_TOKEN = process.env.HUGGING_FACE_API_TOKEN || "";
if (!HF_TOKEN) {
  throw new Error("Hugging Face API Token is missing! Add it to .env.local");
}

export const hfClient = new HfInference(HF_TOKEN);

export async function* getChatCompletionStream(prompt: string) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_tokens: 100, // Allow a bit more room for the answer.
          // No stop parameter.
        },
        stream: true,
      }),
    }
  );

  if (!response.body) {
    throw new Error("No response body received from Hugging Face API");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Decode the chunk and split into lines.
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          return;
        }
        if (!jsonStr) continue;
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed?.token?.text) {
            yield parsed.token.text;
          }
        } catch (error) {
          console.error("Error parsing chunk:", error);
          continue;
        }
      }
    }
  }
}

















// import { HfInference } from "@huggingface/inference";

// const HF_TOKEN = process.env.HUGGING_FACE_API_TOKEN || "";

// if (!HF_TOKEN) {
//   throw new Error("Hugging Face API Token is missing! Add it to .env.local");
// }

// export const hfClient = new HfInference(HF_TOKEN);

// // ✅ Define the correct response type manually
// interface ChatCompletionResponse {
//   choices: { message: { content?: string } }[];
// }

// export const getChatCompletion = async (message: string): Promise<string> => {
//   try {
//     const response: ChatCompletionResponse = await hfClient.chatCompletion({
//       model: "microsoft/Phi-3-mini-4k-instruct",
//       messages: [{ role: "user", content: message }],
//       provider: "hf-inference",
//       max_tokens: 500,
//     });

//     // ✅ Safely extract AI response
//     const aiMessage = response.choices?.[0]?.message?.content ?? "No response from AI";

//     return aiMessage;
//   } catch (error) {
//     console.error("Error fetching chat completion:", error);
//     return "Error occurred!";
//   }
// };
