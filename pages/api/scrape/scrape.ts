import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";

// Utility function to simulate a delay (in ms)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
    $("script, style, .mw-editsection, .toc, .reflist, .hatnote, .shortdescription").remove();

    // Get raw text and normalize whitespace.
    let rawText = $("#mw-content-text").text().replace(/\s+/g, " ").trim();

    // Split the text into sentences based on punctuation.
    let sentences = rawText.split(/(?<=[.?!])\s+/);

    // Ensure the text ends with a complete sentence.
    if (sentences.length > 1) {
      const lastSentence = sentences[sentences.length - 1].trim();
      if (!/[.?!]$/.test(lastSentence)) {
        sentences.pop();
      }
      rawText = sentences.join(" ");
    } else if (sentences.length === 1) {
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
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { url, summarize } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Invalid URL provided" });
    return;
  }

  console.log("🚀 Scraping request received for:", url);

  const scrapedContent = await scrapeWebsite(url);

  if (!scrapedContent) {
    res.status(500).json({ error: "Failed to scrape website. The site may block bots." });
    return;
  }

  let contentToStream = "";
  /*if (summarize) {
    // Instead of taking a fixed 5 sentences, accumulate sentences until a minimum length is reached.
    const minSummaryLength = 500; // Minimum desired summary length in characters
    let sentences = scrapedContent.split(/(?<=[.?!])\s+/);
    if (sentences.length > 1 && !/[.?!]$/.test(sentences[sentences.length - 1].trim())) {
      sentences.pop();
    }
    let summary = "";
    for (let i = 0; i < sentences.length; i++) {
      summary += sentences[i] + " ";
      if (summary.trim().length >= minSummaryLength) break;
    }
    contentToStream = summary.trim();
    console.log(`📝 Generated summary length: ${contentToStream.length}`);
  } else {*/
    // For non-summarized output, use the first 5 sentences
    let sentences = scrapedContent.split(/(?<=[.?!])\s+/);
    if (sentences.length > 1 && !/[.?!]$/.test(sentences[sentences.length - 1].trim())) {
      sentences.pop();
    }
    const numSentences = Math.min(5, sentences.length);
    contentToStream = sentences.slice(0, numSentences).join(" ").trim();
  //}

  // Set up headers for streaming response
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  // Split the content into small chunks and stream each chunk with a slight delay.
  const chunkSize = 50; // Adjust the chunk size as needed
  let pos = 0;
  while (pos < contentToStream.length) {
    const chunk = contentToStream.slice(pos, pos + chunkSize);
    res.write(chunk);
    pos += chunkSize;
    await delay(50); // Adjust delay to control streaming speed
  }

  // End the stream once all content has been sent.
  res.end();
}


















// import type { NextApiRequest, NextApiResponse } from "next";
// import axios from "axios";
// import * as cheerio from "cheerio";

// // Utility function to simulate a delay (in ms)
// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function scrapeWebsite(url: string) {
//   try {
//     console.log(`🔍 Fetching URL: ${url}`);

//     const response = await axios.get(url, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
//       },
//     });

//     console.log(`✅ Response received, status: ${response.status}`);

//     const html = response.data;
//     const $ = cheerio.load(html);

//     // Remove elements that might not be needed
//     $("script, style, .mw-editsection, .toc, .reflist").remove();

//     // Get raw text and normalize whitespace.
//     let rawText = $("#mw-content-text").text().replace(/\s+/g, " ").trim();

//     // Split the text into sentences based on punctuation.
//     let sentences = rawText.split(/(?<=[.?!])\s+/);

//     // Ensure that the text ends with a complete sentence.
//     if (sentences.length > 1) {
//       const lastSentence = sentences[sentences.length - 1].trim();
//       if (!/[.?!]$/.test(lastSentence)) {
//         sentences.pop();
//       }
//       rawText = sentences.join(" ");
//     } else if (sentences.length === 1) {
//       if (!/[.?!]$/.test(rawText)) {
//         rawText = rawText + ".";
//       }
//     }

//     console.log(`📄 Scraped text length: ${rawText.length}`);
//     return rawText || "No readable content found.";
//   } catch (error: any) {
//     if (error.response) {
//       console.error("❌ Scraping failed with status:", error.response.status);
//       console.error("Response data:", error.response.data);
//     } else {
//       console.error("❌ Scraping failed:", error.message);
//     }
//     return null;
//   }
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // Only allow POST requests
//   if (req.method !== "POST") {
//     res.status(405).json({ error: "Method Not Allowed" });
//     return;
//   }

//   const { url, summarize } = req.body;

//   if (!url || typeof url !== "string") {
//     res.status(400).json({ error: "Invalid URL provided" });
//     return;
//   }

//   console.log("🚀 Scraping request received for:", url);

//   const scrapedContent = await scrapeWebsite(url);

//   if (!scrapedContent) {
//     res.status(500).json({ error: "Failed to scrape website. The site may block bots." });
//     return;
//   }

//   // If summarization is requested, generate a summary.
//   let contentToStream = "";
//   if (summarize) {
//     let sentences = scrapedContent.split(/(?<=[.?!])\s+/);
//     if (sentences.length > 1 && !/[.?!]$/.test(sentences[sentences.length - 1].trim())) {
//       sentences.pop();
//     }
//     const numSentences = Math.min(5, sentences.length);
//     contentToStream = sentences.slice(0, numSentences).join(" ").trim();
//     console.log(`📝 Generated summary length: ${contentToStream.length}`);
//   } else {
//     contentToStream = scrapedContent;
//   }

//   // Set up headers for streaming response
//   res.writeHead(200, {
//     "Content-Type": "text/plain; charset=utf-8",
//     "Cache-Control": "no-cache, no-transform",
//     Connection: "keep-alive",
//   });

//   // Split the content into small chunks and stream each chunk with a slight delay.
//   const chunkSize = 50; // Adjust the chunk size as needed
//   let pos = 0;
//   while (pos < contentToStream.length) {
//     const chunk = contentToStream.slice(pos, pos + chunkSize);
//     res.write(chunk);
//     pos += chunkSize;
//     await delay(50); // Adjust delay to control streaming speed
//   }

//   // End the stream once all content has been sent.
//   res.end();
// }