import { NextResponse } from "next/server";
import { getChatCompletion } from "@/lib/hfClient";

// ✅ Import the correct type
interface ChatCompletionResponse {
  choices: { message: string }[];
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const aiResponse = await getChatCompletion(message);

    // ✅ Ensure `aiResponse` is of the correct type before accessing `.choices`
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