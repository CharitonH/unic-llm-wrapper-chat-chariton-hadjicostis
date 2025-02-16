// WORKING - IMPLEMENTED CHAT HISTORY FIRST
import { NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/hfClient";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequestBody {
  message: string;
  chatHistory?: ChatMessage[];
}

interface ChatCompletionResponse {
  choices: { message: string }[];
}

export async function POST(req: Request) {
  try {
    const { message, chatHistory }: ChatRequestBody = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Combine chat history (if any) with the current message to form a full prompt.
    let fullPrompt = "";
    if (chatHistory && chatHistory.length > 0) {
      fullPrompt =
        chatHistory.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n";
    }
    fullPrompt += `User: ${message}\nAssistant:`;

    // Now pass the full prompt (a string) to getChatCompletion.
    const aiResponse = await getChatCompletion(fullPrompt);

    const assistantMessage =
      typeof aiResponse === "object" && "choices" in aiResponse
        ? (aiResponse as ChatCompletionResponse).choices?.[0]?.message || "No response from AI"
        : aiResponse;

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}







// OLD CODE - WORKING BUT WITH NO AI STREAMLINE or HISTORY
// import { NextResponse } from "next/server";
// import { getChatCompletion } from "@/lib/hfClient";

// // ✅ Import the correct type
// interface ChatCompletionResponse {
//   choices: { message: string }[];
// }

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();
//     if (!message) {
//       return NextResponse.json({ error: "Message is required" }, { status: 400 });
//     }

//     const aiResponse = await getChatCompletion(message);

//     // ✅ Ensure `aiResponse` is of the correct type before accessing `.choices`
//     const assistantMessage =
//       typeof aiResponse === "object" && "choices" in aiResponse
//         ? (aiResponse as ChatCompletionResponse).choices?.[0]?.message || "No response from AI"
//         : aiResponse;

//     return NextResponse.json({ response: assistantMessage });
//   } catch (error) {
//     console.error("Chat API Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// HISTORY BUT SUMMARIZE TEXTS
// import { NextResponse } from "next/server";
// import { getChatCompletion } from "@/lib/hfClient";

// // Define a TypeScript interface for chat messages (if needed)
// interface ChatMessage {
//   role: string;
//   content: string;
// }

// interface ChatCompletionResponse {
//   choices: { message: string }[];
// }

// function isChatCompletionResponse(
//   obj: any
// ): obj is ChatCompletionResponse {
//   return obj && typeof obj === "object" && "choices" in obj;
// }

// export async function POST(req: Request) {
//   try {
//     const { message, chatHistory } = await req.json();

//     if (!message) {
//       return NextResponse.json({ error: "Message is required" }, { status: 400 });
//     }

//     // Limit chat history to the last 10 messages to avoid exceeding token limits.
//     const MAX_HISTORY = 10;
//     let recentHistory: ChatMessage[] = [];
//     if (Array.isArray(chatHistory)) {
//       recentHistory = chatHistory.slice(-MAX_HISTORY);
//     }

//     // Construct a prompt by concatenating the recent chat history.
//     let prompt = recentHistory
//       .map((m: ChatMessage) => {
//         const speaker = m.role === "user" ? "User" : "AI";
//         return `${speaker}: ${m.content}`;
//       })
//       .join("\n");

//     // Optionally, if the new message isn't already in the history, add it:
//     // prompt += `\nUser: ${message}\nAI:`;

//     // Now call your chat completion function with the prompt containing the recent history.
//     const aiResponse = await getChatCompletion(prompt);

//     // Assuming getChatCompletion returns a structure similar to:
//     // { choices: [{ message: string }] }
//     const assistantMessage = isChatCompletionResponse(aiResponse)
//       ? aiResponse.choices[0]?.message || "No response from AI"
//       : aiResponse;

//     return NextResponse.json({ response: assistantMessage });
//   } catch (error) {
//     console.error("Chat API Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }