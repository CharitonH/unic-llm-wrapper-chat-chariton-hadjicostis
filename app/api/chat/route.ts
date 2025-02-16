// IMPLEMENTED STREAMING
// import { NextResponse } from "next/server";
// import { getChatCompletion } from "@/lib/hfClient";

// interface ChatMessage {
//   role: string;
//   content: string;
// }

// interface ChatRequestBody {
//   message: string;
//   chatHistory?: ChatMessage[];
// }

// export async function POST(req: Request) {
//   try {
//     const { message, chatHistory }: ChatRequestBody = await req.json();
//     if (!message) {
//       return NextResponse.json({ error: "Message is required" }, { status: 400 });
//     }

//     // Build the full prompt from chat history and current message.
//     let fullPrompt = "";
//     if (chatHistory && chatHistory.length > 0) {
//       fullPrompt = chatHistory.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n";
//     }
//     fullPrompt += `User: ${message}\nAssistant:`;

//     // Get the complete AI response using your existing completion function.
//     const aiResponse = await getChatCompletion(fullPrompt);
//     const assistantMessage =
//       typeof aiResponse === "object" && "choices" in aiResponse
//         ? (aiResponse as any).choices?.[0]?.message || "No response from AI"
//         : aiResponse;

//     // Create a TextEncoder instance to convert text to Uint8Array chunks.
//     const encoder = new TextEncoder();

//     // Split the response into tokens (using space as delimiter)
//     const tokens = assistantMessage.split(" ");

//     // Create a ReadableStream that enqueues each token with a delay.
//     const stream = new ReadableStream({
//       async start(controller) {
//         for (const token of tokens) {
//           // Enqueue token plus a space
//           controller.enqueue(encoder.encode(token + " "));
//           // Wait 100ms between tokens (adjust as needed)
//           await new Promise((resolve) => setTimeout(resolve, 100));
//         }
//         controller.close();
//       },
//     });

//     return new Response(stream, {
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Cache-Control": "no-cache",
//       },
//     });
//   } catch (error) {
//     console.error("Chat API Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }











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