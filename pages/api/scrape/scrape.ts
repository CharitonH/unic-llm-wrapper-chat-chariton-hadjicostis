// WORKING VERSION - ADDING STREAMING ON THE SCRAPING
/*import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";

// Async generator function to yield scraped text in chunks
async function* scrapeWebsite(url: string) {
  try {
    console.log(`🔍 Fetching URL: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    console.log(`✅ Response received, status: ${response.status}`);

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove elements that might not be needed
    $("script, style, .mw-editsection, .toc, .reflist").remove();

    // Get raw text and normalize whitespace.
    let rawText = $("#mw-content-text").text().replace(/\s+/g, " ").trim();

    if (!rawText) {
      yield "No readable content found.";
      return;
    }

    console.log(`📄 Scraped text length: ${rawText.length}`);

    // Split the text into sentences to send in chunks.
    let sentences = rawText.split(/(?<=[.?!])\s+/);
    let buffer = "";

    for (const sentence of sentences) {
      buffer += sentence + " ";

      if (buffer.length > 100) { // Adjust chunk size
        yield buffer.trim();
        buffer = "";
      }
    }

    if (buffer.length > 0) {
      yield buffer.trim();
    }
  } catch (error: any) {
    console.error("❌ Scraping failed:", error.message);
    yield "⚠️ Error: Could not retrieve content.";
  }
}

// Streaming handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  console.log("🚀 Scraping request received for:", url);

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of scrapeWebsite(url)) {
          controller.enqueue(encoder.encode(chunk + " ")); // Send chunks
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}*/












// CURRENT WORKING VERSION - SCRAPING IMPROVED
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeWebsite(url: string) {
  try {
    console.log(`🔍 Fetching URL: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    console.log(`✅ Response received, status: ${response.status}`);

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove elements that might not be needed
    $("script, style, .mw-editsection, .toc, .reflist").remove();

    // Get raw text and normalize whitespace.
    let rawText = $("#mw-content-text").text().replace(/\s+/g, " ").trim();

    // Split the text into sentences based on punctuation.
    // This regex uses a positive lookbehind to split after punctuation marks.
    let sentences = rawText.split(/(?<=[.?!])\s+/);

    // If the last sentence doesn't end with a terminal punctuation, remove it.
    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1].trim();
      if (!/[.?!]$/.test(lastSentence)) {
        sentences.pop();
      }
      rawText = sentences.join(" ");
    } else {
      // If there is only one sentence, ensure it ends with a period.
      if (!/[.?!]$/.test(rawText)) {
        rawText = rawText + ".";
      }
    }

    console.log(`📄 Scraped text length: ${rawText.length}`);
    return rawText || "No readable content found.";
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Scraping failed with status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else {
      console.error("❌ Scraping failed:", error.message);
    }
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url, summarize } = req.body; // <-- Note the new "summarize" parameter

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  console.log("🚀 Scraping request received for:", url);

  const scrapedContent = await scrapeWebsite(url);

  if (!scrapedContent) {
    return res.status(500).json({ error: "Failed to scrape website. The site may block bots." });
  }

  // If summarization is requested, generate a summary.
  if (summarize) {
    // Simple summarization: take the first 5 complete sentences.
    let sentences = scrapedContent.split(/(?<=[.?!])\s+/);
    // Remove any incomplete sentence at the end.
    if (sentences.length > 1 && !/[.?!]$/.test(sentences[sentences.length - 1].trim())) {
      sentences.pop();
    }
    const numSentences = Math.min(5, sentences.length);
    const summary = sentences.slice(0, numSentences).join(" ").trim();
    console.log(`📝 Generated summary length: ${summary.length}`);
    return res.status(200).json({ summary });
  }

  return res.status(200).json({ content: scrapedContent });
}

















// ORIGINAL CODE - NO CHAT HISTORY AND SCRAPING IS DISASTER
/*import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeWebsite(url: string) {
  try {
    console.log(`🔍 Fetching URL: ${url}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    console.log(`✅ Response received, status: ${response.status}`);

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove elements that might not be needed
    $("script, style, .mw-editsection, .toc, .reflist").remove();

    // This selector is specific to certain pages (e.g., Wikipedia)
    const rawText = $("#mw-content-text").text().replace(/\s+/g, " ").trim();

    console.log(`📄 Scraped text length: ${rawText.length}`);
    return rawText || "No readable content found.";
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Scraping failed with status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else {
      console.error("❌ Scraping failed:", error.message);
    }
    return null;
  }
}*/

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method Not Allowed" });
//   }

//   const { url } = req.body;

//   if (!url || typeof url !== "string") {
//     return res.status(400).json({ error: "Invalid URL provided" });
//   }

//   console.log("🚀 Scraping request received for:", url);

//   const scrapedContent = await scrapeWebsite(url);
  
//   if (!scrapedContent) {
//     return res.status(500).json({ error: "Failed to scrape website. The site may block bots." });
//   }

//   return res.status(200).json({ content: scrapedContent });
// }

/*export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url, summarize } = req.body; // <-- Note the new "summarize" parameter

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL provided" });
  }

  console.log("🚀 Scraping request received for:", url);

  const scrapedContent = await scrapeWebsite(url);
  
  if (!scrapedContent) {
    return res.status(500).json({ error: "Failed to scrape website. The site may block bots." });
  }

  // If summarization is requested, generate a summary.
  if (summarize) {
    // Simple summarization: take the first 5 sentences.
    const sentences = scrapedContent.split(/(?<=[.?!])\s+/);
    const numSentences = Math.min(5, sentences.length);
    const summary = sentences.slice(0, numSentences).join(" ");
    console.log(`📝 Generated summary length: ${summary.length}`);
    return res.status(200).json({ summary });
  }
  
  return res.status(200).json({ content: scrapedContent });
}*/