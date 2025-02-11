// ChatMessages.tsx
"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // For proper Quill styling
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit2, Save } from "lucide-react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export interface Message {
  role: string;
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  editIndex: number | null;
  /** Callback to trigger edit mode, receiving the message index and its current content */
  onEdit: (index: number, content: string) => void;
  input: string;
  setInput: (value: string) => void;
  updateMessage: () => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  editIndex,
  onEdit,
  input,
  setInput,
  updateMessage,
}) => {
  return (
    <div className="h-80 overflow-y-auto bg-[#121212] p-4 rounded-lg mt-4 border border-gray-600">
      {messages.map((msg, index) => (
        <div
          key={index}
          className="p-2 my-2 rounded-lg bg-[#232323] flex items-center"
        >
          {editIndex === index ? (
            <div className="relative w-full">
              <ReactQuill
                theme="snow"
                value={input}
                onChange={(content, delta, source, editor) =>
                  setInput(editor.getHTML())
                }
                className="bg-[#121212] text-white rounded-lg"
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
                onClick={updateMessage}
                className="absolute top-2 right-3 text-white flex items-center"
              >
                <Save size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center w-full">
              {msg.role === "user" && (
                <button
                  onClick={() => onEdit(index, msg.content)}
                  className="mr-2 p-2 bg-[#121212] rounded-full flex items-center justify-center hover:bg-[#1a1a1a]"
                >
                  <Edit2 size={18} className="text-white" />
                </button>
              )}
              <div className="flex-1 px-3 py-2 text-white">
                <strong className="mr-2">
                  {msg.role === "user" ? "You:" : "AI:"}
                </strong>
                {msg.role === "user" ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  // Render AI responses as markdown so that code blocks are syntax highlighted.
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !className?.includes("inline") && match ? (
                          <SyntaxHighlighter
                            style={atomOneDark as Record<string, React.CSSProperties>}
                            language={match[1] || "plaintext"}
                            PreTag="div"
                            {...(props as any)}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code
                            className={`${className} bg-gray-800 px-1 py-0.5 rounded`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
