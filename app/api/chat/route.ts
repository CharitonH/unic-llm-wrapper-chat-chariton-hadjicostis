// IMPLEMENTED STREAMING
import { NextResponse } from "next/server";
import { getChatCompletionStream } from "@/lib/hfClient";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // Use a simpler prompt.
    //const fullPrompt = `Answer the following question concisely:\n${message}`;
    const fullPrompt = `${message}`;
    
    // Create a streaming response.
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of getChatCompletionStream(fullPrompt)) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
    
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}














// WORKING - IMPLEMENTED CHAT HISTORY FIRST
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

// interface ChatCompletionResponse {
//   choices: { message: string }[];
// }

// export async function POST(req: Request) {
//   try {
//     const { message, chatHistory }: ChatRequestBody = await req.json();
//     if (!message) {
//       return NextResponse.json({ error: "Message is required" }, { status: 400 });
//     }

//     // Combine chat history (if any) with the current message to form a full prompt.
//     let fullPrompt = "";
//     if (chatHistory && chatHistory.length > 0) {
//       fullPrompt =
//         chatHistory.map((m) => `${m.role}: ${m.content}`).join("\n") + "\n";
//     }
//     fullPrompt += `User: ${message}\nAssistant:`;

//     // Now pass the full prompt (a string) to getChatCompletion.
//     const aiResponse = await getChatCompletion(fullPrompt);

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