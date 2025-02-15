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

/**
 * Helper function to strip HTML tags from a string.
 */
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, "");
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

  // Update an edited message: append it as a new user message and send it to the API.
  const updateMessage = async () => {
    if (editIndex === null) return;

    // Sanitize the input (which may contain formatting HTML)
    const sanitizedInput = DOMPurify.sanitize(input);
    // Convert the sanitized HTML into plain text
    const plainText = stripHtml(sanitizedInput).trim();
    if (!plainText) {
      console.log("Edited message is empty after stripping formatting.");
      return;
    }

    // Append the edited message (with formatting for display)
    setMessages((prev) => [
      ...prev,
      { role: "user", content: sanitizedInput },
    ]);
    setEditIndex(null);
    setInput("");

    // Automatically send the plain text version to the AI API.
    setIsGenerating(true);
    abortController.current = new AbortController();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: plainText }),
        signal: abortController.current.signal,
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Response stopped by user." },
        ]);
      } else {
        console.error("Chat request failed:", error);
      }
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

    // Minimized the scraped content because the LLM chat was lagging after printing so many words
    if (scrapeMatches.length > 0) {
      // Determine if the command contains the word "summarize"
      const shouldSummarize = plainText.toLowerCase().includes("summarize");
      const maxScrapeLength = 2000; // Adjust the maximum length as needed

      // Process each scrape command concurrently.
      const scrapePromises = scrapeMatches.map(async (match) => {
        const urlToScrape = match[1];
        if (!isValidWikipediaUrl(urlToScrape)) {
          return `⚠️ Invalid Wikipedia URL: ${urlToScrape}`;
        }
        try {
          const res = await fetch("/api/scrape/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlToScrape, summarize: shouldSummarize }),
          });
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          const data = await res.json();
          if (data.error) {
            return `⚠️ ${shouldSummarize ? "Summarization" : "Scraping"} failed for ${urlToScrape}: ${data.error}`;
          } else {
            if (shouldSummarize) {
              return `🔍 Summary for ${urlToScrape}:\n\n${data.summary}`;
            } else {
              let content = data.content;
              // Minimize the scraped content if it's too long.
              if (content && content.length > maxScrapeLength) {
                // content = content.substring(0, maxScrapeLength) + "...\n\n[Content truncated]";
                content = content.substring(0, maxScrapeLength) + "...\n\n";
              }
              return `🔍 Scraped Content for ${urlToScrape}:\n\n${content}`;
            }
          }
        } catch (error: any) {
          console.error(`❌ ${shouldSummarize ? "Summarization" : "Scraping"} request failed for ${urlToScrape}:`, error);
          return `⚠️ Failed to ${shouldSummarize ? "summarize" : "scrape"} ${urlToScrape}.`;
        }
      });

      // Wait for all operations to complete.
      const results = await Promise.all(scrapePromises);
      const combinedResult = results.join("\n\n");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: combinedResult },
      ]);
      setIsGenerating(false);
      return;
    }

    // original code
    /*if (scrapeMatches.length > 0) {
      // Process each scrape command concurrently.
      const scrapePromises = scrapeMatches.map(async (match) => {
        const urlToScrape = match[1];
        if (!isValidWikipediaUrl(urlToScrape)) {
          return `⚠️ Invalid Wikipedia URL: ${urlToScrape}`;
        }
        try {
          const res = await fetch("/api/scrape/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlToScrape }),
          });
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          const data = await res.json();
          if (data.error) {
            return `⚠️ Scraping failed for ${urlToScrape}: ${data.error}`;
          } else {
            return `🔍 Scraped Content from ${urlToScrape}:\n\n${data.content}`;
          }
        } catch (error: any) {
          console.error(`❌ Scraping request failed for ${urlToScrape}:`, error);
          return `⚠️ Failed to scrape ${urlToScrape}.`;
        }
      });
  
      // Wait for all scraping operations to complete.
      const scrapedResults = await Promise.all(scrapePromises);
      const combinedResult = scrapedResults.join("\n\n");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: combinedResult },
      ]);
      setIsGenerating(false);
      return;
    }*/
  
    // Limit the history to the last 10 messages before sending
    const MAX_HISTORY = 10;
    const recentHistory = updatedChatHistory.slice(-MAX_HISTORY);
  
    // Otherwise, send the plain text message along with the limited chat history to the AI API.
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: plainText, chatHistory: recentHistory }),
        signal: abortController.current.signal,
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Response stopped by user." },
        ]);
      } else {
        console.error("Chat request failed:", error);
      }
    }
    setIsGenerating(false);
  };
  






  // Send a message
  // const sendMessage = async () => {
  //   // If the input is empty, have the assistant respond with a default message.
  //   if (!input) {
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: "It looks like your message is empty. What can I help you with?" },
  //     ]);
  //     return;
  //   }
  
  //   // Sanitize and convert to plain text.
  //   const sanitizedInput = DOMPurify.sanitize(input);
  //   const plainText = stripHtml(sanitizedInput).trim();
  //   if (!plainText) {
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: "It looks like your message is empty. What can I help you with?" },
  //     ]);
  //     setInput("");
  //     return;
  //   }
  
  //   // Create an updated chat history including the new user message.
  //   const updatedChatHistory = [
  //     ...messages,
  //     { role: "user", content: sanitizedInput },
  //   ];
  
  //   // Append the user's message (with formatting) to the conversation.
  //   setMessages(updatedChatHistory);
  //   setInput("");
  //   setIsGenerating(true);
  //   abortController.current = new AbortController();
  
  //   // Look for one or more scrape commands in the message.
  //   const scrapeMatches = Array.from(
  //     plainText.matchAll(/\[include-url:\s*(https?:\/\/[^\s]+).*?\]/g)
  //   );
  
  //   if (scrapeMatches.length > 0) {
  //     // Process each scrape command concurrently.
  //     const scrapePromises = scrapeMatches.map(async (match) => {
  //       const urlToScrape = match[1];
  //       if (!isValidWikipediaUrl(urlToScrape)) {
  //         return `⚠️ Invalid Wikipedia URL: ${urlToScrape}`;
  //       }
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
  //         if (data.error) {
  //           return `⚠️ Scraping failed for ${urlToScrape}: ${data.error}`;
  //         } else {
  //           return `🔍 Scraped Content from ${urlToScrape}:\n\n${data.content}`;
  //         }
  //       } catch (error: any) {
  //         console.error(`❌ Scraping request failed for ${urlToScrape}:`, error);
  //         return `⚠️ Failed to scrape ${urlToScrape}.`;
  //       }
  //     });
  
  //     // Wait for all scraping operations to complete.
  //     const scrapedResults = await Promise.all(scrapePromises);
  //     const combinedResult = scrapedResults.join("\n\n");
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: combinedResult },
  //     ]);
  //     setIsGenerating(false);
  //     return;
  //   }
  
  //   // Otherwise, send the plain text message along with the full chat history to the AI API.
  //   try {
  //     const res = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message: plainText, chatHistory: updatedChatHistory }),
  //       signal: abortController.current.signal,
  //     });
  //     const data = await res.json();
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: data.response },
  //     ]);
  //   } catch (error: any) {
  //     if (error.name === "AbortError") {
  //       setMessages((prev) => [
  //         ...prev,
  //         { role: "assistant", content: "Response stopped by user." },
  //       ]);
  //     } else {
  //       console.error("Chat request failed:", error);
  //     }
  //   }
  //   setIsGenerating(false);
  // };


  // no chat history
  // Send a new message.
  // const sendMessage = async () => {
  //   // If the input is empty, have the assistant respond with "It looks like your message is empty. What can I help you with?"
  //   if (!input) {
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: "It looks like your message is empty. What can I help you with?" },
  //     ]);
  //     return;
  //   }
  
  //   // Sanitize and convert to plain text
  //   const sanitizedInput = DOMPurify.sanitize(input);
  //   const plainText = stripHtml(sanitizedInput).trim();
  //   if (!plainText) {
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: "It looks like your message is empty. What can I help you with?" },
  //     ]);
  //     setInput("");
  //     return;
  //   }
  
  //   // Append the user's message (with formatting) to the conversation.
  //   setMessages((prev) => [
  //     ...prev,
  //     { role: "user", content: sanitizedInput },
  //   ]);
  //   setInput("");
  //   setIsGenerating(true);
  //   abortController.current = new AbortController();
  
  //   // Look for one or more scrape commands in the message.
  //   const scrapeMatches = Array.from(
  //     plainText.matchAll(/\[include-url:\s*(https?:\/\/[^\s]+).*?\]/g)
  //   );
  
  //   if (scrapeMatches.length > 0) {
  //     // Process each scrape command concurrently.
  //     const scrapePromises = scrapeMatches.map(async (match) => {
  //       const urlToScrape = match[1];
  //       if (!isValidWikipediaUrl(urlToScrape)) {
  //         return `⚠️ Invalid Wikipedia URL: ${urlToScrape}`;
  //       }
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
  //         if (data.error) {
  //           return `⚠️ Scraping failed for ${urlToScrape}: ${data.error}`;
  //         } else {
  //           return `🔍 Scraped Content from ${urlToScrape}:\n\n${data.content}`;
  //         }
  //       } catch (error: any) {
  //         console.error(`❌ Scraping request failed for ${urlToScrape}:`, error);
  //         return `⚠️ Failed to scrape ${urlToScrape}.`;
  //       }
  //     });
  
  //     // Wait for all scraping operations to complete.
  //     const scrapedResults = await Promise.all(scrapePromises);
  //     const combinedResult = scrapedResults.join("\n\n");
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: combinedResult },
  //     ]);
  //     setIsGenerating(false);
  //     return;
  //   }
  
  //   // Otherwise, send the plain text message to the AI API.
  //   try {
  //     const res = await fetch("/api/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message: plainText }),
  //       signal: abortController.current.signal,
  //     });
  //     const data = await res.json();
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: data.response },
  //     ]);
  //   } catch (error: any) {
  //     if (error.name === "AbortError") {
  //       setMessages((prev) => [
  //         ...prev,
  //         { role: "assistant", content: "Response stopped by user." },
  //       ]);
  //     } else {
  //       console.error("Chat request failed:", error);
  //     }
  //   }
  //   setIsGenerating(false);
  // };

  const stopGenerating = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsGenerating(false);
  };

  // Handler for commands modal: generate a scrape command and insert it into the input.
  const handleScrapeCommand = () => {
    if (!url.trim() || !isValidWikipediaUrl(url)) {
      alert("Please enter a valid Wikipedia URL.");
      return;
    }
    const command = `[include-url: ${url} max_execution_time:${maxExecutionTime} filter:${filter} store:${store}]`;
    setInput((prev) => (prev ? `${prev} ${command}` : command));
    setIsCommandsOpen(false);
  };
  // const handleScrapeCommand = () => {
  //   if (!url.trim()) {
  //     alert("Please enter a valid URL.");
  //     return;
  //   }
  //   const command = `[include-url: ${url} max_execution_time:${maxExecutionTime} filter:${filter} store:${store}]`;
  //   setInput((prev) => (prev ? `${prev} ${command}` : command));
  //   setIsCommandsOpen(false);
  // };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-[#121212] text-white px-4">
      <div className="w-full max-w-4xl mx-auto bg-[#1a1a1a] p-6 rounded-lg shadow-lg border border-gray-700">
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
        <div ref={chatContainerRef}>
          <ChatMessages
            messages={messages}
            editIndex={editIndex}
            onEdit={editMessage}
            input={input}
            setInput={setInput}
            updateMessage={updateMessage}
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
