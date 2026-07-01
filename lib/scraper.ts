export async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return `[Failed to fetch HTML: Status ${res.status}]`;
    }

    const html = await res.text();
    
    // Extract page title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract page description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) || 
                      html.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i);
    const description = descMatch ? descMatch[1].trim() : "";

    // Strip script, style, and comments
    let bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Strip remaining tags
    bodyText = bodyText.replace(/<[^>]*>/g, " ");

    // Normalize spacing
    bodyText = bodyText.replace(/\s+/g, " ").trim();

    // Return truncated text payload
    return `Title: ${title}\nDescription: ${description}\nContent: ${bodyText.slice(0, 5000)}`;
  } catch (err: unknown) {
    console.error("Scraper failed:", err);
    return `[Failed to fetch content due to network error: ${err instanceof Error ? err.message : "unknown"}]`;
  }
}
