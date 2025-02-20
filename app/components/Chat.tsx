"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import DOMPurify from "dompurify";
import Greeting from "./Greeting";
import ChatInput from "./ChatInput";
import ChatMessages, { Message } from "./ChatMessages";
import CommandsModal from "./CommandsModal";
import UnicLogo from "../../public/UNIC-logo.webp";
import { Terminal, BookOpen, User, Plus } from "lucide-react";
import { FiCircle } from "react-icons/fi";
import { toast } from 'react-toastify';

/**
 * Helper function to strip HTML tags from a string.
 */
// const stripHtml = (html: string): string => {
//   return html.replace(/<[^>]*>?/gm, "");
// };

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.replace(/\s+/g, " ").trim() || "";
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [isCommandsOpen, setIsCommandsOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxExecutionTime, setMaxExecutionTime] = useState(300);
  const [filter, setFilter] = useState(false);
  const [store, setStore] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const abortController = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // At the top of your file or inside the component:
  const isValidWikipediaUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      // Require that the hostname ends with 'wikipedia.org'
      return parsedUrl.hostname.toLowerCase().endsWith("wikipedia.org");
    } catch (error) {
      return false;
    }
  };

  // Auto-scroll to the latest message whenever messages update.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Trigger edit mode by loading the current message's content into the input field.
  const editMessage = (index: number, content: string) => {
    setInput(content);
    setEditIndex(index);
  };
  
  // Scroll the chat down when a message is sent
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // THE USER CANNOT USE SPACE/ENTER/FORMATTING
  // const updateMessage = async () => {
  //   if (editIndex === null) return;

  //   // 1) Sanitize user’s Quill HTML, but do NOT collapse spaces.
  //   const sanitizedInput = DOMPurify.sanitize(input);

  //   // 2) Overwrite the existing message in place with the sanitized HTML
  //   const updatedMessages = messages.map((msg, i) =>
  //     i === editIndex
  //       ? { ...msg, content: sanitizedInput }  // Store the sanitized HTML
  //       : msg
  //   );

  // FIXED NOW THE USER CAN USE SPACE/ENTER/FORMATTING
  const updateMessage = async (newContent: string) => {  // Accept newContent directly
    if (editIndex === null) return;

    // 1) Sanitize user’s Quill HTML, but do NOT collapse spaces.
    const sanitizedInput = DOMPurify.sanitize(newContent); // Use newContent instead of input

    // 2) Overwrite the existing message in place with the sanitized HTML
    const updatedMessages = messages.map((msg, i) =>
      i === editIndex
        ? { ...msg, content: sanitizedInput }  // Store the sanitized HTML
        : msg
    );

    // 3) Optionally add a new user message at the end (depends on your design)
    //    If you do not want to add a brand-new user message, you can skip this step.
    const newUserMessage = { role: "user", content: sanitizedInput };
    const newMessages = [...updatedMessages, newUserMessage];

    setMessages(newMessages);
    setEditIndex(null);
    setInput("");

    // 4) If sending the updated text to your AI:
    //    Convert sanitized HTML to plain text (while preserving line breaks)
    //    Or just send the HTML if your AI can handle HTML.
    //const doc = new DOMParser().parseFromString(sanitizedInput, "text/html");
    //const plainText = doc.body.innerText;

    // SECOND TRY TO SOLVE AI RESPONSE WHEN SENDING TEXT FORMATTING
    const doc = new DOMParser().parseFromString(sanitizedInput, "text/html");
    // Convert HTML into pure text without <p> tags
    function extractPlainText(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim() || "";
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === "P" || element.tagName === "BR") {
          return "\n" + Array.from(element.childNodes).map(extractPlainText).join("");
        }
        return Array.from(element.childNodes).map(extractPlainText).join(" ");
      }
      return node.textContent?.trim() || "";
    }
    // Final cleaned text
    const plainText = extractPlainText(doc.body).replace(/\n+/g, "\n").trim();
    console.log("Cleaned Text Sent to AI:", plainText);


    // FIRST TRY TO SOLVE AI RESPONSE WHEN SENDING TEXT FORMATTING
    /*const doc = new DOMParser().parseFromString(sanitizedInput, "text/html");
    // Convert lists to plain text format correctly
    function extractPlainText(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim() || "";
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName === "OL" || element.tagName === "UL") {
          return Array.from(element.children)
            .map((child, index) => `${index + 1}. ${extractPlainText(child)}`)
            .join("\n");
        }
      }
      return node.textContent?.trim() || "";
    }
    // Final cleaned text
    const plainText = extractPlainText(doc.body);
    console.log("Cleaned Text Sent to AI:", plainText);*/

    setTimeout(() => {
      const inputField = document.querySelector("your-input-selector") as HTMLInputElement; // Ensure selector matches an <input> or <textarea>
      if (inputField) {
        inputField.focus();
        inputField.setSelectionRange(sanitizedInput.length, sanitizedInput.length);
      }
    }, 10);

    // 3) Send the updated conversation to your AI API, just like sendMessage does.
    const MAX_HISTORY = 20;
    const recentHistory = newMessages.slice(-MAX_HISTORY);

    setIsGenerating(true);
    abortController.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: plainText, // ✅ Correctly formatted list
          chatHistory: recentHistory,
        }),
        signal: abortController.current.signal,
      });
      // const res = await fetch("/api/chat", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     message: plainText,
      //     chatHistory: recentHistory,
      //   }),
      //   signal: abortController.current.signal,
      // });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }
      if (!res.body) {
        throw new Error("No response body");
      }

      // 4) Create a placeholder assistant message for streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let partialResult = "";

      // Stream the response chunk-by-chunk
      let completeResponse = ""; // Store the full AI response
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        completeResponse += chunk; // Append chunk to the full response
        
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: completeResponse, // Ensure full response is stored
            };
          }
          return updated;
        });
      }
      // Log to check if the full response was received
      console.log("Final AI Response in updateMessage:", completeResponse);

      
      // while (true) {
      //   const { value, done } = await reader.read();
      //   if (done) break;
      //   partialResult += decoder.decode(value, { stream: true });

      //   // Update the last assistant message with the partial text so far
      //   setMessages((prev) => {
      //     const updated = [...prev];
      //     const lastIndex = updated.length - 1;
      //     if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
      //       updated[lastIndex] = {
      //         ...updated[lastIndex],
      //         content: partialResult,
      //       };
      //     }
      //     return updated;
      //   });
      // }
    } catch (error) {
      console.error("Chat request failed:", error);
      let errorMessage = "An unknown error occurred.";

      if (error instanceof DOMException && error.name === "AbortError") {
        errorMessage = "Response stopped by user.";
      } else if (error instanceof Error) {
        errorMessage = `Error streaming response: ${error.message}`;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = `Error streaming response: ${JSON.stringify(error)}`;
      } else {
        errorMessage = `Error streaming response: ${String(error)}`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
    }

    setIsGenerating(false);
  };

  const sendMessage = async () => {
    // If the input is empty, have the assistant respond with a default message.
    if (!input) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "It looks like your message is empty. What can I help you with?" },
      ]);
      return;
    }
  
    // Sanitize and convert to plain text.
    const sanitizedInput = DOMPurify.sanitize(input);
    const plainText = stripHtml(sanitizedInput).trim();
    if (!plainText) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "It looks like your message is empty. What can I help you with?" },
      ]);
      setInput("");
      return;
    }
  
    // Create an updated chat history including the new user message.
    const updatedChatHistory = [
      ...messages,
      { role: "user", content: sanitizedInput },
    ];
  
    // Append the user's message (with formatting) to the conversation.
    setMessages(updatedChatHistory);
    setInput("");
    setIsGenerating(true);
    abortController.current = new AbortController();
  
    // Look for one or more scrape commands in the message.
    const scrapeMatches = Array.from(
      plainText.matchAll(/\[include-url:\s*(https?:\/\/[^\s]+).*?\]/g)
    );
  
    // SCRAPING WITH STREAMING AND PAUSING AI AND IF STOPPED -> APPROPRIATE MESSAGE
    if (scrapeMatches.length > 0) {
      // Determine if the command contains the word "summarize"
      const shouldSummarize = plainText.toLowerCase().includes("summarize");
      const maxScrapeLength = 2000; // Adjust the maximum length as needed
  
      // Process each scrape command sequentially to enable streaming updates.
      for (const match of scrapeMatches) {
        const urlToScrape = match[1];
        if (!isValidWikipediaUrl(urlToScrape)) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠️ Invalid Wikipedia URL: ${urlToScrape}` },
          ]);
          continue;
        }
  
        // Create a placeholder assistant message for this scrape command.
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        /*setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `🔍 Fetching data from ${urlToScrape}...` }, // Temporary placeholder
        ]);*/
  
        try {
          const res = await fetch("/api/scrape/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlToScrape, summarize: shouldSummarize }),
            signal: abortController.current.signal, // Added abort signal here
          });
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          if (!res.body) {
            throw new Error("No response body");
          }
  
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let streamedContent = "";
  
          // Read the streamed response chunk by chunk.
          let completeResponse = ""; // Store the full AI response
          // while (true) {
          //   const { value, done } = await reader.read();
          //   if (done) break;
            
          //   const chunk = decoder.decode(value, { stream: true });
          //   completeResponse += chunk; // Append chunk to full response
            
          //   setMessages((prev) => {
          //     const updated = [...prev];
          //     const lastIndex = updated.length - 1;
          //     if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
          //       updated[lastIndex] = {
          //         ...updated[lastIndex],
          //         content: completeResponse, // Ensure full response is stored
          //       };
          //     }
          //     return updated;
          //   });
          // }
          // // Log to check if the full response was received
          // console.log("Final AI Response in sendMessage:", completeResponse);

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            streamedContent += decoder.decode(value, { stream: true });
  
            // Update the latest assistant message with the current streamed content.
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: `🔍 ${shouldSummarize ? "Summary" : "Scraped Content"} for ${urlToScrape}:\n\n${streamedContent}`,
              };
              return updated;
            });
          }
  
          // Post-process the complete scraped content.
          let content = streamedContent;
          if (content) {
            let sentences = content.split(/(?<=[.?!])\s+/);
            if (sentences.length > 1 && !/[.?!]$/.test(sentences[sentences.length - 1].trim())) {
              sentences.pop();
            }
            content = sentences.join(" ").trim();
            if (!/[.?!]$/.test(content)) {
              content = content + ".";
            }
          }
  
          // Limit the content length to prevent excessive output.
          if (content && content.length > maxScrapeLength) {
            const afterLimit = content.substring(maxScrapeLength);
            const nextPeriodIndex = afterLimit.indexOf(".");
            if (nextPeriodIndex !== -1) {
              content = content.substring(0, maxScrapeLength + nextPeriodIndex + 1) + "\n\n";
            } else {
              let truncated = content.substring(0, maxScrapeLength);
              const lastPeriod = truncated.lastIndexOf(".");
              if (lastPeriod !== -1) {
                content = truncated.substring(0, lastPeriod + 1) + "\n\n";
              } else {
                content = truncated + "\n\n";
              }
            }
          }
  
          // Final update with the post-processed content.
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: `🔍 ${shouldSummarize ? "Summary" : "Scraped Content"} for ${urlToScrape}:\n\n${content}`,
            };
            return updated;
          });
        } catch (error: any) {
          // Check if the error was caused by aborting the request.
          if (error.name === "AbortError") {
            setMessages((prev) => [
              ...prev,
              //{ role: "assistant", content: "Response stopped by user." },
            ]);
          } else {
            console.error(`❌ ${shouldSummarize ? "Summarization" : "Scraping"} request failed for ${urlToScrape}:`, error);
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `⚠️ Failed to ${shouldSummarize ? "summarize" : "scrape"} ${urlToScrape}.` },
            ]);
          }
        }
      }
      setIsGenerating(false);
      return;
    }
  
    // Limit the history to the last 10 messages before sending
    const MAX_HISTORY = 20;
    const recentHistory = updatedChatHistory.slice(-MAX_HISTORY);
  
    // -------------------------------------------------------------------------
    // *** This snippet is what's causing the double user-message issue. ***
    // We keep it, but add a guard so it doesn't append the user message again.
    // -------------------------------------------------------------------------
    // Suppose `input` already contains the Quill HTML from the user:
    const sanitizedHtml2 = DOMPurify.sanitize(input);
  
    // 1. Store the HTML in your state for display
    const userMessageAlreadyAppended = updatedChatHistory.some(
      (m) => m.role === "user" && m.content === sanitizedHtml2
    );
    if (!userMessageAlreadyAppended) {
      setMessages((prev) => [...prev, { role: "user", content: sanitizedHtml2 }]);
    }
    // -------------------------------------------------------------------------
  
    // Otherwise, send the plain text message along with the limited chat history to the AI API.
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: plainText, chatHistory: recentHistory }),
        signal: abortController.current.signal,
      });
  
      if (!res.ok) {
        throw new Error("Chat request failed");
      }
  
      if (!res.body) {
        throw new Error("No response body");
      }
  
      // Create a placeholder for the streaming assistant message.
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let partialResult = "";
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        partialResult += decoder.decode(value, { stream: true });
  
        // Update the last assistant message with the partial text so far.
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: partialResult,
            };
          }
          return updated;
        });
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Response stopped by user." },
        ]);
      } else {
        console.error("Chat request failed:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error streaming response." },
        ]);
      }
    }
    setIsGenerating(false);
  };

  const stopGenerating = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsGenerating(false);
  };

  // Handler for commands modal: generate a scrape command and insert it into the input.
  const handleScrapeCommand = () => {
    if (!url.trim() || !isValidWikipediaUrl(url)) {
      toast.error("Please enter a valid Wikipedia URL.");
      return;
    }
    const command = `[include-url: ${url} max_execution_time:${maxExecutionTime} filter:${filter} store:${store}]`;
    setInput((prev) => (prev ? `${prev} ${command}` : command));
    setIsCommandsOpen(false);
  };

  // return (
  //   // ORIGINAL CODE - CHAT IS IN MIDDLE
  //    //<div className="w-full h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
  //     //<div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700">

  //     <div className="w-full h-auto md:h-screen flex flex-col bg-[#121212] text-white px-4">
  //      <div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col h-full">
    
  //   {/* // MODIFY CODE - CHAT IS FULL WIDTH */}
  //   {/* <div className="w-full h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
  //     <div className="w-full mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700"> */}
  //       {/* Logo */}
  //       <div className="flex items-center justify-center gap-3 mb-2">
  //         <Image src={UnicLogo} alt="UNIC Logo" width={350} height={50} />
  //       </div>
  //       {/* Chat Title */}
  //       <div className="flex flex-col items-center justify-center text-center my-4">
  //         <h2 className="text-2xl font-extrabold tracking-wide uppercase bg-gradient-to-r from-[#f1f1f1] via-[#f1f1f1] to-[#f1f1f1] text-transparent bg-clip-text">
  //           LLM Wrapper Chat
  //         </h2>
  //       </div>
  //       {/* Greeting */}
  //       <Greeting />
  //       {/* Chat Messages */}
  //       <div ref={chatContainerRef} className="flex-1 w-full overflow-y-auto min-h-0">
  //         <ChatMessages
  //           messages={messages}
  //           editIndex={editIndex}
  //           onEdit={editMessage}
  //           input={input}
  //           setInput={setInput}
  //           //updateMessage={updateMessage} // THE USER CANNOT USE SPACE/ENTER/FORMATTING
  //           // FIXED NOW THE USER CAN USE SPACE/ENTER/FORMATTING
  //           updateMessage={(newContent) => updateMessage(newContent)} // ✅ Now correctly passes a string argumen
  //         />
  //       </div>
  //       {/* Chat Input */}
  //       <ChatInput
  //         input={input}
  //         setInput={setInput}
  //         isGenerating={isGenerating}
  //         sendMessage={sendMessage}
  //         stopGenerating={stopGenerating}
  //       />
  //       {/* Commands Modal */}
  //       <CommandsModal
  //         url={url}
  //         setUrl={setUrl}
  //         onScrape={handleScrapeCommand}
  //         isCommandsOpen={isCommandsOpen}
  //         setIsCommandsOpen={setIsCommandsOpen}
  //         isAdvancedOpen={isAdvancedOpen}
  //         setIsAdvancedOpen={setIsAdvancedOpen}
  //         maxExecutionTime={maxExecutionTime}
  //         setMaxExecutionTime={setMaxExecutionTime}
  //         filter={filter}
  //         setFilter={setFilter}
  //         store={store}
  //         setStore={setStore}
  //       />
  //       {/* Command Buttons with Icons */}
  //       <div className="mt-4 flex flex-wrap gap-3 text-gray-400">
  //         <button
  //           className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300"
  //           onClick={() => setIsCommandsOpen(true)}
  //         >
  //           <Terminal size={16} /> <span>Commands</span>
  //         </button>
  //         <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
  //           <BookOpen size={16} /> <span>Prompts</span>
  //         </button>
  //         <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
  //           <User size={16} /> <span>Personas</span>
  //         </button>
  //         <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
  //           <Plus size={16} /> <span>Add</span>
  //         </button>
  //         <span className="ml-auto text-gray-500 flex items-center">
  //           32/618 <FiCircle size={18} className="ml-1 text-gray-500" />
  //         </span>
  //       </div>
  //     </div>
  //   </div>
  // );





  return (
  // ORIGINAL CODE - CHAT IS IN MIDDLE
  //<div className="w-full h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
  //<div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700">

  // 1) Outer container: min-h-screen on mobile, full h-screen on md+, flex layout
    <div className="w-full min-h-screen md:h-screen md:min-h-0 md:h-auto flex flex-col bg-[#121212] text-white px-4 m-0 p-0">

    {/* 2) Inner container: flex-1 to expand, plus h-full on md+ */}
    <div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col h-full flex-1 md:h-full">
      
      {/* // MODIFY CODE - CHAT IS FULL WIDTH */}
      {/* <div className="w-full h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
          <div className="w-full mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700"> */}
      
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <Image src={UnicLogo} alt="UNIC Logo" width={350} height={50} />
      </div>
      {/* Chat Title */}
      <div className="flex flex-col items-center justify-center text-center my-4">
        <h2 className="text-2xl font-extrabold tracking-wide uppercase bg-gradient-to-r from-[#f1f1f1] via-[#f1f1f1] to-[#f1f1f1] text-transparent bg-clip-text">
          LLM Wrapper Chat
        </h2>
      </div>
      {/* Greeting */}
      <Greeting />
      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 w-full overflow-y-auto min-h-0">
        <ChatMessages
          messages={messages}
          editIndex={editIndex}
          onEdit={editMessage}
          input={input}
          setInput={setInput}
          //updateMessage={updateMessage} // THE USER CANNOT USE SPACE/ENTER/FORMATTING
          // FIXED NOW THE USER CAN USE SPACE/ENTER/FORMATTING
          updateMessage={(newContent) => updateMessage(newContent)} // ✅ Now correctly passes a string argument
        />
      </div>
      {/* Chat Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        isGenerating={isGenerating}
        sendMessage={sendMessage}
        stopGenerating={stopGenerating}
      />
      {/* Commands Modal */}
      <CommandsModal
        url={url}
        setUrl={setUrl}
        onScrape={handleScrapeCommand}
        isCommandsOpen={isCommandsOpen}
        setIsCommandsOpen={setIsCommandsOpen}
        isAdvancedOpen={isAdvancedOpen}
        setIsAdvancedOpen={setIsAdvancedOpen}
        maxExecutionTime={maxExecutionTime}
        setMaxExecutionTime={setMaxExecutionTime}
        filter={filter}
        setFilter={setFilter}
        store={store}
        setStore={setStore}
      />
      {/* Command Buttons with Icons */}
      <div className="mt-4 flex flex-wrap gap-3 text-gray-400">
        <button
          className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300"
          onClick={() => setIsCommandsOpen(true)}
        >
          <Terminal size={16} /> <span>Commands</span>
        </button>
        <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
          <BookOpen size={16} /> <span>Prompts</span>
        </button>
        <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
          <User size={16} /> <span>Personas</span>
        </button>
        <button className="flex items-center gap-2 p-2 bg-[#232323] rounded border border-gray-600 text-gray-300">
          <Plus size={16} /> <span>Add</span>
        </button>
        <span className="ml-auto text-gray-500 flex items-center">
          32/618 <FiCircle size={18} className="ml-1 text-gray-500" />
        </span>
      </div>
    </div>
  </div>
);

};

export default Chat;
