// NEW CODE WORKING - WITH OPTIMIZE MOBILE VIEW WHILE SCRAPING
"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit2, Save } from "lucide-react";

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
    // 1) Hide horizontal overflow so it never scrolls horizontally
    <div className="h-80 overflow-y-auto overflow-x-hidden bg-[#121212] p-4 rounded-lg mt-4 border border-gray-600">
      {messages.map((msg, index) => (
        // 2) Use flex-wrap so if something is too wide, it breaks to a new line
        <div
          key={index}
          className="p-2 my-2 rounded-lg bg-[#232323] flex flex-wrap items-start"
        >
          {editIndex === index ? (
            // Edit mode
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

              {/* 
                3) whitespace-pre-wrap + break-all 
                   ensures even huge single-word text (like a long URL) will wrap
              */}
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








// OLD CODE WORKING - BUT MOBILE VIEW WHILE SCRAPING IS NOT OPTIMIZE
// "use client";

// import dynamic from "next/dynamic";
// import "react-quill/dist/quill.snow.css"; // For proper Quill styling
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Edit2, Save } from "lucide-react";

// // Import the Light build from react-syntax-highlighter
// import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/light";
// // Import languages to be registered
// import html from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
// import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
// import ts from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
// import php from "react-syntax-highlighter/dist/esm/languages/hljs/php";
// import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
// import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
// import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
// import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
// import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
// // Import a style (theme)
// import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

// // Register the languages
// SyntaxHighlighter.registerLanguage("html", html);
// SyntaxHighlighter.registerLanguage("javascript", js);
// SyntaxHighlighter.registerLanguage("typescript", ts);
// SyntaxHighlighter.registerLanguage("php", php);
// SyntaxHighlighter.registerLanguage("python", python);
// SyntaxHighlighter.registerLanguage("java", java);
// SyntaxHighlighter.registerLanguage("cpp", cpp);
// SyntaxHighlighter.registerLanguage("bash", bash);
// SyntaxHighlighter.registerLanguage("css", css);

// // Dynamically load ReactQuill (only on client-side)
// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// export interface Message {
//   role: string;
//   content: string;
// }

// interface ChatMessagesProps {
//   messages: Message[];
//   editIndex: number | null;
//   onEdit: (index: number, content: string) => void;
//   input: string;
//   setInput: (value: string) => void;
//   updateMessage: () => void;
// }

// const ChatMessages: React.FC<ChatMessagesProps> = ({
//   messages,
//   editIndex,
//   onEdit,
//   input,
//   setInput,
//   updateMessage,
// }) => {
//   return (
//     <div className="h-80 overflow-y-auto bg-[#121212] p-4 rounded-lg mt-4 border border-gray-600">
//       {messages.map((msg, index) => (
//         <div
//           key={index}
//           className="p-2 my-2 rounded-lg bg-[#232323] flex items-center"
//         >
//           {editIndex === index ? (
//             // Edit mode
//             <div className="relative w-full">
//               <ReactQuill
//                 theme="snow"
//                 value={input}
//                 onChange={(content, delta, source, editor) =>
//                   setInput(editor.getHTML())
//                 }
//                 className="bg-[#121212] text-white rounded-lg"
//                 modules={{
//                   toolbar: [
//                     ["bold", "italic", "underline", "strike"],
//                     [{ list: "ordered" }, { list: "bullet" }],
//                     ["link"],
//                   ],
//                 }}
//                 formats={[
//                   "bold",
//                   "italic",
//                   "underline",
//                   "strike",
//                   "list",
//                   "bullet",
//                   "link",
//                 ]}
//               />
//               <button
//                 onClick={updateMessage}
//                 className="absolute top-2 right-3 text-white flex items-center"
//               >
//                 <Save size={20} />
//               </button>
//             </div>
//           ) : (
//             // View mode
//             <div className="flex items-center w-full">
//               {msg.role === "user" && (
//                 <button
//                   onClick={() => onEdit(index, msg.content)}
//                   className="mr-2 p-2 bg-[#121212] rounded-full flex items-center justify-center hover:bg-[#1a1a1a]"
//                 >
//                   <Edit2 size={18} className="text-white" />
//                 </button>
//               )}
//               <div className="flex-1 px-3 py-2 text-white">
//                 <strong className="mr-2">
//                   {msg.role === "user" ? "You:" : "AI:"}
//                 </strong>
//                 {msg.role === "user" ? (
//                   <div dangerouslySetInnerHTML={{ __html: msg.content }} />
//                 ) : (
//                   // Render AI responses as markdown with code syntax highlighting.
//                   <ReactMarkdown
//                     remarkPlugins={[remarkGfm]}
//                     components={{
//                       code({ node, className, children, ...props }) {
//                         const match = /language-(\w+)/.exec(className || "");
//                         return !className?.includes("inline") && match ? (
//                           <SyntaxHighlighter
//                             style={atomOneDark}
//                             language={match[1] || "plaintext"}
//                             PreTag="div"
//                             wrapLongLines // <--- Add this prop
//                             {...(props as any)}
//                           >
//                             {String(children).replace(/\n$/, "")}
//                           </SyntaxHighlighter>
//                         ) : (
//                           <code
//                             className={`${className} bg-gray-800 px-1 py-0.5 rounded`}
//                             {...props}
//                           >
//                             {children}
//                           </code>
//                         );
//                       },
//                     }}
//                   >
//                     {msg.content}
//                   </ReactMarkdown>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ChatMessages;