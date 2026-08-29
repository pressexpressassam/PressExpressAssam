import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://fhxtbfxvsnuelkmkbtnr.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_jM_lhxQm0iWqko9hZROrCg_n_kvNoEu";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const SITE =
  "https://press-express-assam-ryfd.vercel.app";

export default async function handler(req, res) {
  try {
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const urls = [
      `
      <url>
        <loc>${SITE}/</loc>
        <changefreq>hourly</changefreq>
        <priority>1.0</priority>
      </url>
      `
    ];

    for (const article of articles || []) {
      const id = encodeURIComponent(article.id);

      const lastmod = article.created_at
        ? new Date(article.created_at).toISOString()
        : new Date().toISOString();

      urls.push(`
        <url>
          <loc>${SITE}/news/${id}</loc>
          <lastmod>${lastmod}</lastmod>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>
      `);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).send(xml);

  } catch (error) {
    console.error("Sitemap error:", error);

    return res
      .status(500)
      .send("Sitemap generation failed");
  }
}
