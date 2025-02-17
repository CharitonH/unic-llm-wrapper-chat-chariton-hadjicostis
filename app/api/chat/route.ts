// WORKING UPDATED - INCLUDES STREAMING AND CHAT HISTORY
import { NextResponse } from "next/server";
import { getChatCompletionStream } from "@/lib/hfClient";

export type MessageRole = "system" | "user" | "assistant";

// Use the same type for everything
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// Use the same interface for HF streaming
export interface ChatCompletionRequestMessage {
  role: MessageRole;
  content: string;
}

interface ChatRequestBody {
  message: string;
  chatHistory?: ChatMessage[];
}


export async function POST(req: Request) {
  try {
    const { message, chatHistory }: ChatRequestBody = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build up the messages array (system + user + assistant, etc.)
    let messages: ChatMessage[] = [];
    if (chatHistory && chatHistory.length > 0) {
      messages = [...chatHistory];
    }
    messages.push({ role: "user", content: message });

    // Call the streaming function
    const hfStream = getChatCompletionStream(messages);

    const encoder = new TextEncoder();

    // Turn the HF stream into a web ReadableStream
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // for-await-of: read each chunk from HF
          for await (const chunk of hfStream) {
            // chunk.choices[0].delta.content holds the partial token
            if (chunk.choices?.length) {
              const token = chunk.choices[0].delta?.content || "";
              // Enqueue that token into our streaming response
              controller.enqueue(encoder.encode(token));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    // Return a streaming response
    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}