export default async function handler(req, res) {
  try {
    const SUPABASE_URL =
      "https://fhxtbfxvsnuelkmkbtnr.supabase.co";

    const SUPABASE_KEY =
      "sb_publishable_jM_lhxQm0iWqko9hZROrCg_n_kvNoEu";

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?select=id,title,excerpt,content,image_url,category,created_at&published=eq.true&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Supabase news load হোৱা নাই");
    }

    const articles = await response.json();

    function escapeXml(text) {
      return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    const items = articles.map(article => {
      const description =
        article.excerpt ||
        article.content ||
        "";

      const link =
        const link =
  `https://press-express-assam-ryfd.vercel.app/news/${encodeURIComponent(article.id)}`;

      return `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${escapeXml(link)}</link>
          <guid isPermaLink="true">${escapeXml(link)}</guid>
          <description>${escapeXml(description)}</description>
          <category>${escapeXml(article.category || "অসম")}</category>
          <pubDate>${new Date(article.created_at).toUTCString()}</pubDate>
        </item>
      `;
    }).join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Press Express Assam</title>
    <link>https://press-express-assam-ryfd.vercel.app/</link>
    <description>অসমৰ শেহতীয়া স্থানীয়, ৰাজ্যিক, ৰাষ্ট্ৰীয় আৰু আন্তঃৰাষ্ট্ৰীয় সংবাদ।</description>
    <language>as</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    res.setHeader(
      "Content-Type",
      "application/rss+xml; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "s-maxage=300, stale-while-revalidate=600"
    );

    res.status(200).send(rss);

  } catch (error) {

    res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Press Express Assam</title>
          <description>RSS Error</description>
          <item>
            <title>${String(error.message || "Error")}</title>
          </item>
        </channel>
      </rss>`
    );
  }
}
