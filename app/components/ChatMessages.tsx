// NEW CODE WORKING - WITH OPTIMIZE MOBILE VIEW WHILE SCRAPING
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit2, Save, X } from "lucide-react";

import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/light";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import php from "react-syntax-highlighter/dist/esm/languages/hljs/php";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage("html", html);
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("typescript", ts);
SyntaxHighlighter.registerLanguage("php", php);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("css", css);

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export interface Message {
  role: string;
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  editIndex: number | null;
  onEdit: (index: number, content: string) => void;
  input: string;
  setInput: (value: string) => void;
  //updateMessage: () => void; // THE USER CANNOT USE SPACE/ENTER/FORMATTING
  // FIXED NOW THE USER CAN USE SPACE/ENTER/FORMATTING
  updateMessage: (newContent: string) => void; // ✅ Now expects a string argument
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  editIndex,
  onEdit,
  input,
  setInput,
  updateMessage,
}) => {
  const [editorContent, setEditorContent] = useState(input);

  // Sync changes with parent state to avoid cursor jump issues
  useEffect(() => {
    setEditorContent(input);
  }, [input]);

  return (
    <div className="h-80 overflow-y-auto overflow-x-hidden bg-[#121212] p-4 rounded-lg mt-4 border border-gray-600">
      {messages.map((msg, index) => (
        <div
          key={index}
          className="p-2 my-2 rounded-lg bg-[#232323] flex flex-wrap items-start"
        >
          {editIndex === index ? (
            // Edit mode
            <div className="relative w-full">
              <ReactQuill
                // FIXED NOW THE USER CAN USE SPACE/ENTER/FORMATTING
                theme="snow"
                placeholder= "Ask anything"
                value={editorContent}
                preserveWhitespace={true} // Ensures spaces and newlines remain
                onChange={(content, delta, source, editor) => {
                  setEditorContent(content);
                }}
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
              <div className="absolute top-2 right-3 flex items-center space-x-3">
                {/* Save button - FIXED SENDING THE UPDATED MESSAGE*/}
                <button
                  onClick={() => {
                    updateMessage(editorContent); // ✅ Now correctly calls the function with new content
                    onEdit(-1, ""); // ✅ Exits edit mode properly
                  }}
                  className="text-white flex items-center"
                >
                  <Save size={20} />
                </button>

                {/* Cancel edit button */}
                <button
                  onClick={() => {
                    setEditorContent(""); // Clear local editor content
                    onEdit(-1, ""); // Exit edit mode
                  }}
                  className="text-white flex items-center"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="flex items-start w-full">
              {msg.role === "user" && (
                <button
                  onClick={() => onEdit(index, msg.content)}
                  className="mr-2 p-2 bg-[#121212] rounded-full flex items-center justify-center hover:bg-[#1a1a1a]"
                >
                  <Edit2 size={18} className="text-white" />
                </button>
              )}

              <div className="flex-1 px-3 py-2 text-white whitespace-pre-wrap break-all">
                <strong className="mr-2">
                  {msg.role === "user" ? "You:" : "AI:"}
                </strong>

                {msg.role === "user" ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !className?.includes("inline") && match ? (
                          <SyntaxHighlighter
                            style={atomOneDark}
                            language={match[1] || "plaintext"}
                            PreTag="div"
                            wrapLongLines
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
