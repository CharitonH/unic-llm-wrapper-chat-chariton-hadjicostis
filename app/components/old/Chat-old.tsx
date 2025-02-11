// OLD FILE
// "use client";

// import { useState, useEffect, useRef } from "react";
// import {SendHorizontal, Terminal, BookOpen, User, Plus, ChevronDown, X, Edit2, Save, Sun, SunMedium, Moon, StopCircle} from "lucide-react"; // Icons
// import Image from "next/image"; // Import Next.js Image component for the logo
// import UnicLogo from "../../public/UNIC-logo.webp";
// import "react-quill/dist/quill.snow.css"; // Import styles for Quill
// import dynamic from "next/dynamic"; // Load Quill dynamically to avoid SSR issues
// import DOMPurify from "dompurify"; // Install this package: `npm install dompurify`
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// import atomOneDark from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false }); // Load Quill dynamically

// const Chat = () => {
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
//   const [input, setInput] = useState("");
//   const [url, setUrl] = useState("");
//   const [isCommandsOpen, setIsCommandsOpen] = useState(false); // Modal for "Commands"
//   const [isAdvancedOpen, setIsAdvancedOpen] = useState(false); // Advanced Options Dropdown
//   const [isGenerating, setIsGenerating] = useState(false); // AI response status
//   const abortController = useRef<AbortController | null>(null); // Reference for aborting AI response
//   const chatContainerRef = useRef<HTMLDivElement | null>(null); // Ref for chat container
//   const [icon, setIcon] = useState<React.ReactNode>(null); // State for storing the icon
//   const [editIndex, setEditIndex] = useState<number | null>(null);

//   // Scroll to the latest message whenever messages update
//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   // Greeting based on time of day
//   const [greeting, setGreeting] = useState("");
//   useEffect(() => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) {
//       setGreeting("Good Morning!");
//       setIcon(<Sun size={20} className="text-yellow-400" />); // Sun icon for morning
//     } else if (hour >= 12 && hour < 15) {
//       setGreeting("Good Day!");
//       setIcon(<SunMedium size={20} className="text-orange-400" />); // Different sun for mid-day time (12-15)
//     } else if (hour >= 15 && hour < 18) {
//       setGreeting("Good Afternoon!");
//       setIcon(<SunMedium size={20} className="text-orange-400" />); // Different sun for afternoon
//     } else if (hour >= 18 && hour < 22) {
//       setGreeting("Good Evening!");
//       setIcon(<Moon size={20} className="text-gray-300" />); // Moon icon for evening
//     } else {
//       setGreeting("Good Night!");
//       setIcon(<Moon size={20} className="text-blue-400" />); // Moon for night
//     }
//   }, []);

//   // Default command options
//   const [maxExecutionTime, setMaxExecutionTime] = useState(300);
//   const [filter, setFilter] = useState(false);
//   const [store, setStore] = useState(false);

//   const scrapeWebsite = async () => {
//     if (!url.trim()) {
//       alert("Please enter a valid URL.");
//       return;
//     }

//     // Generate the include-url command
//     const command = `[include-url: ${url} max_execution_time:300 filter:false store:false]`;
//     console.log("📝 Generated Command:", command);

//     // Insert the command into the chat input field
//     setInput((prevInput) => (prevInput ? `${prevInput} ${command}` : command));

//     // Close the modal
//     setIsCommandsOpen(false);
//   };

//   // Function to enter edit mode for a message
//   const editMessage = (index: number) => {
//     setInput(messages[index].content); // Load message content into input
//     setEditIndex(index); // Set edit mode
//   };

//   // Function to update and resend an edited message
//   const updateMessage = async () => {
//     if (editIndex === null || !input.trim()) return;

//     const sanitizedInput = DOMPurify.sanitize(input); // Prevent raw HTML issues
//     const formattedInput = sanitizedInput.replace(/&nbsp;/g, " "); // Ensure spaces persist

//     // Replace the old message with the edited version and keep it as a "You" message
//     setMessages((prevMessages) => {
//       const updatedMessages = prevMessages.map((msg, idx) =>
//         idx === editIndex ? { role: "user", content: formattedInput } : msg
//       );

//       return [...updatedMessages, { role: "user", content: formattedInput }];
//     });

//     // Resend the updated message to the AI
//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: formattedInput }), // Send updated message
//       });

//       const data = await res.json();

//       // Append AI's new response
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { role: "assistant", content: data.response },
//       ]);
//     } catch (error) {
//       console.error("Chat request failed:", error);
//     }

//     // Clear edit mode and input
//     setInput("");
//     setEditIndex(null);
//   };

//   const sendMessage = async () => {
//     if (!input.trim()) return;
  
//     // Ensure input retains formatting correctly
//     const sanitizedInput = DOMPurify.sanitize(input);
  
//     // Append user message to chat
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       { role: "user", content: sanitizedInput },
//     ]);
  
//     setInput(""); // Clear input field
//     setIsGenerating(true); // AI is now generating
  
//     abortController.current = new AbortController(); // Create a new AbortController
  
//     // Check if the input is a scrape command
//     const scrapeMatch = sanitizedInput.match(/\[include-url:\s*(https?:\/\/[^\s]+).*?\]/);
  
//     if (scrapeMatch) {
//       const urlToScrape = scrapeMatch[1]; // Extract the URL
//       console.log("🔍 Detected scraping command. Extracted URL:", urlToScrape);
  
//       try {
//         const res = await fetch("/api/scrape/scrape", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ url: urlToScrape }),
//         });
  
//         if (!res.ok) {
//           throw new Error(`HTTP error! Status: ${res.status}`);
//         }
  
//         const data = await res.json();
//         console.log("📥 Scraped Content:", data);
  
//         if (data.error) {
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { role: "assistant", content: `⚠️ Scraping failed: ${data.error}` },
//           ]);
//         } else {
//           // Append the scraped content to chat
//           const scrapedText = `🔍 Scraped Content from ${urlToScrape}:\n\n${data.content}`;
  
//           setMessages((prevMessages) => [
//             ...prevMessages,
//             { role: "assistant", content: scrapedText },
//           ]);
//         }
//       } catch (error) {
//         console.error("❌ Scraping request failed:", error);
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { role: "assistant", content: "⚠️ Failed to scrape the website." },
//         ]);
//       }
  
//       setIsGenerating(false);
//       return; // Stop further processing
//     }
  
//     // If it's a normal message, send it to AI
//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: sanitizedInput }),
//         signal: abortController.current.signal, // Attach signal to abort request
//       });
  
//       const data = await res.json();
  
//       // Remove all HTML tags from the AI's response so that only plain text remains.
//       const plainTextResponse = DOMPurify.sanitize(data.response, { ALLOWED_TAGS: [] });
  
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         { role: "assistant", content: plainTextResponse },
//       ]);
//     } catch (error: unknown) {
//       if (error instanceof Error && error.name === "AbortError") {
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           { role: "assistant", content: "Response stopped by user." },
//         ]);
//       } else {
//         console.error("Chat request failed:", error);
//       }
//     }
  
//     setIsGenerating(false);
//   };

//   // Stop Generating Function
//   const stopGenerating = () => {
//     if (abortController.current) {
//       abortController.current.abort();
//     }
//     setIsGenerating(false);
//   };

// return (
//     <div className="w-full h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
//       <div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700">
//         {/* Logo on top first */}
//         <div className="flex items-center justify-center gap-3 mb-2">
//           <Image src={UnicLogo} alt="UNIC Logo" width={350} height={50} />
//         </div>

//         {/* Chat title */}
//         <div className="flex flex-col items-center justify-center text-center my-4">
//           <h2 className="text-2xl font-extrabold tracking-wide uppercase bg-gradient-to-r from-[#f1f1f1] via-[#f1f1f1] to-[#f1f1f1] text-transparent bg-clip-text">
//             LLM Wrapper Chat
//           </h2>
//         </div>

//         {/* Dynamic greeting message */}
//         <h2 className="text-md text-gray-300 flex items-center gap-2">
//           {icon} {greeting} What can I help with?
//         </h2>

//         {/* Chat Messages */}
//         <div ref={chatContainerRef} className="h-80 overflow-y-auto bg-[#121212] p-4 rounded-lg mt-4 border border-gray-600">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`p-2 my-2 rounded-lg ${
//                 msg.role === "user" ? "bg-[#232323]" : "bg-[#232323]"
//               } flex items-center`}
//             >
//               {/* Edit Mode */}
//               {editIndex === index ? (
//                 <div className="relative w-full">
//                   <ReactQuill
//                     theme="snow"
//                     value={input}
//                     onChange={(content, delta, source, editor) => setInput(editor.getHTML())}
//                     className="custom-quill bg-[#121212] text-white rounded-lg"
//                     modules={{
//                       toolbar: [
//                         ["bold", "italic", "underline", "strike"],
//                         [{ list: "ordered" }, { list: "bullet" }],
//                         ["link"],
//                       ],
//                     }}
//                     formats={["bold", "italic", "underline", "strike", "list", "bullet", "link"]}
//                   />

//                   {/* Save Button Positioned at Cursor Level */}
//                   {editIndex === index && (
//                     <button
//                       onClick={updateMessage}
//                       className="absolute top-2 right-3 text-white flex items-center"
//                     >
//                       <Save size={20} className="text-white" /> {/* Diskette Icon for Save */}
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 // Normal Message Display
//                 <div className="flex items-center w-full">
//                   {/* Edit Button */}
//                   {msg.role === "user" && (
//                     <button
//                       onClick={() => editMessage(index)}
//                       className="mr-2 p-2 bg-[#121212] rounded-full flex items-center justify-center hover:bg-[#1a1a1a]"
//                     >
//                       <Edit2 size={18} className="text-white" />
//                     </button>
//                   )}

//                   {/* Message Content */}
//                   <div className="flex-1 px-3 py-2 text-white">
//                     <strong className="text-white mr-2">{msg.role === "user" ? "You:" : "AI:"}</strong>

//                     {/* Render User Messages with HTML Support */}
//                     {msg.role === "user" ? (
//                       <div dangerouslySetInnerHTML={{ __html: msg.content }} />
//                     ) : (
//                       <ReactMarkdown
//                         remarkPlugins={[remarkGfm]}
//                         components={{
//                           code({ node, className, children, ...props }) {
//                             const match = /language-(\w+)/.exec(className || "");
//                             return !className?.includes("inline") && match ? (
//                               <SyntaxHighlighter
//                                 style={atomOneDark as Record<string, React.CSSProperties>} // Fix type issue
//                                 language={match[1] || "plaintext"}
//                                 {...(props as any)} // Temporary workaround
//                               >
//                                 {String(children).replace(/\n$/, "")}
//                               </SyntaxHighlighter>
//                             ) : (
//                               <code className={`${className} bg-gray-800 px-1 py-0.5 rounded`} {...props}>
//                                 {children}
//                               </code>
//                             );
//                           },
//                         }}
//                       >
//                         {msg.content}
//                       </ReactMarkdown>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Chat Input Section with WYSIWYG Editor & Send Button */}
//         <div className="mt-4 flex flex-col bg-[#121212] p-3 rounded-lg border border-gray-600">
//           {/* Chat Input Section with WYSIWYG Editor & Send Button */}
//             <div className="relative">
//               <ReactQuill
//                 theme="snow"
//                 value={input}
//                 onChange={(content, delta, source, editor) => setInput(editor.getHTML())} // Ensure spaces persist
//                 className="custom-quill bg-gray-700 text-white rounded mt-2"
//                 modules={{
//                   toolbar: [
//                     ["bold", "italic", "underline", "strike"],
//                     [{ list: "ordered" }, { list: "bullet" }],
//                     ["link"],
//                   ],
//                 }}
//                 formats={[
//                   "bold", "italic", "underline", "strike", "list", "bullet", "link",
//                 ]}
//               />

//               {/* Send Button Positioned at Cursor Level */}
//               <button
//                 onClick={isGenerating ? stopGenerating : sendMessage}
//                 className="absolute top-2 right-3 text-white flex items-center"
//               >
//                 {isGenerating ? (
//                 <StopCircle size={24} className="text-white" onClick={stopGenerating} />
//               ) : (
//                 <SendHorizontal size={24} className="text-white" />
//               )}
//               </button>
//             </div>
//         </div>

//       {/* Commands Modal */}
//       {isCommandsOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700 w-96">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-bold">Commands</h2>
//               <button onClick={() => setIsCommandsOpen(false)} className="text-gray-300">
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="flex w-full gap-2">
//               <input
//                 type="text"
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 placeholder="Enter URL to get key points"
//                 className="w-full p-2 rounded bg-[#232323] text-white border border-gray-600"
//               />
//               <button
//                 onClick={() => {
//                   scrapeWebsite();
//                   setIsCommandsOpen(false); // Close modal after triggering
//                 }}
//                 className="bg-blue-600 px-4 py-2 rounded text-white"
//               >
//                 Scrape
//               </button>
//             </div>

//             {/* Advanced Settings */}
//             <div className="mt-4">
//               <button
//                 className="flex justify-between items-center w-full p-2 bg-[#232323] text-white rounded border border-gray-600"
//                 onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
//               >
//                 Advanced Settings <ChevronDown size={16} />
//               </button>
//               {isAdvancedOpen && (
//                 <div className="mt-2 space-y-2">
//                   <div>
//                     <label className="text-sm">Max Execution Time (seconds)</label>
//                     <input
//                       type="number"
//                       value={maxExecutionTime}
//                       onChange={(e) => setMaxExecutionTime(Number(e.target.value))}
//                       className="w-full p-2 rounded bg-[#232323] text-white border border-gray-600"
//                     />
//                   </div>
//                  <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={filter}
//                       onChange={() => setFilter(!filter)}
//                       className="w-4 h-4 cursor-pointer"
//                       id="enableFiltering"
//                     />
//                     <label htmlFor="enableFiltering" className="text-sm cursor-pointer">
//                       Enable Filtering
//                     </label>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={store}
//                       onChange={() => setStore(!store)}
//                       className="w-4 h-4 cursor-pointer"
//                       id="storeData"
//                     />
//                     <label htmlFor="storeData" className="text-sm cursor-pointer">
//                       Store Data
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//         {/* Command Buttons */}
//         <div className="mt-4 flex flex-wrap gap-3 text-gray-400">
//           <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300" onClick={() => setIsCommandsOpen(true)}>
//             <Terminal size={16} /> Commands
//           </button>
//           <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
//             <BookOpen size={16} /> Prompts
//           </button>
//           <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
//             <User size={16} /> Personas
//           </button>
//           <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
//             <Plus size={16} /> Add
//           </button>
//           <span className="ml-auto text-gray-500">32/618 Tokens</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;