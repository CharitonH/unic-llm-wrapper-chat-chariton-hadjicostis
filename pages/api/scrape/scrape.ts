import type { NextApiRequest, NextApiResponse } from "next";
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
}

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
    // Simple summarization: take the first 5 sentences.
    const sentences = scrapedContent.split(/(?<=[.?!])\s+/);
    const numSentences = Math.min(5, sentences.length);
    const summary = sentences.slice(0, numSentences).join(" ");
    console.log(`📝 Generated summary length: ${summary.length}`);
    return res.status(200).json({ summary });
  }
  
  return res.status(200).json({ content: scrapedContent });
}
