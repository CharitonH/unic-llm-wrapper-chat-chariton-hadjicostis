// ChatInput.tsx
"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import Quill CSS for toolbar styling
import { StopCircle, SendHorizontal } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isGenerating: boolean;
  sendMessage: () => void;
  stopGenerating: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isGenerating,
  sendMessage,
  stopGenerating,
}) => {
  return (
    <div className="mt-4 flex flex-col bg-[#121212] p-3 rounded-lg border border-gray-600">
      <div className="relative">
        <ReactQuill
          theme="snow"
          value={input}
          onChange={(content, delta, source, editor) =>
            setInput(editor.getHTML())
          }
          className="bg-gray-700 text-white rounded mt-2"
          modules={{
            toolbar: [
              ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"],
            ],
          }}
          formats={[
            "bold",
            "italic",
            "underline",
            "strike",
            "list",
            "bullet",
            "link",
          ]}
        />
        <button
          onClick={isGenerating ? stopGenerating : sendMessage}
          className="absolute top-2 right-3 text-white flex items-center"
        >
          {isGenerating ? (
            <StopCircle size={24} />
          ) : (
            <SendHorizontal size={24} />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
