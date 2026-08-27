const fs = require("fs");
const path = require("path");

const SUPABASE_URL =
  "https://fhxtbfxvsnuelkmkbtnr.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_jM_lhxQm0iWqko9hZROrCg_n_kvNoEu";

const SITE =
  "https://press-express-assam-ryfd.vercel.app";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJson(value) {
  return JSON.stringify(value || "")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function addOrReplaceMeta(html, pattern, tag) {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace(
    /<\/head>/i,
    `${tag}\n</head>`
  );
}

module.exports = async function handler(req, res) {
  try {

    // -----------------------------
    // GET NEWS ID
    // -----------------------------

    let id = req.query && req.query.id;

    if (!id && req.url) {
      const match = req.url.match(/\/news\/([^/?]+)/);

      if (match) {
        id = match[1];
      }
    }

    if (!id) {
      return res
        .status(400)
        .send("News ID missing");
    }

    // -----------------------------
    // LOAD ARTICLE FROM SUPABASE
    // -----------------------------

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      return res
        .status(500)
        .send("News load failed");
    }

    const articles = await response.json();

    if (!articles.length) {
      return res
        .status(404)
        .send("News not found");
    }

    const article = articles[0];

    // -----------------------------
    // NEWS DATA
    // -----------------------------

    const title =
      article.title ||
      "Press Express Assam";

    const description =
      article.excerpt ||
      article.content ||
      "অসমৰ শেহতীয়া স্থানীয়, ৰাজ্যিক, ৰাষ্ট্ৰীয় আৰু আন্তঃৰাষ্ট্ৰীয় সংবাদ।";

    const cleanDescription =
      String(description)
        .replace(/\s+/g, " ")
        .substring(0, 160);

    const canonical =
      `${SITE}/news/${encodeURIComponent(article.id)}`;

    const image =
      article.image_url ||
      `${SITE}/logo2.png`;

    const category =
      article.category ||
      "অসম";

    const datePublished =
      article.created_at ||
      new Date().toISOString();

    // -----------------------------
    // NEWS ARTICLE SCHEMA
    // -----------------------------

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",

      headline: title,

      description: cleanDescription,

      image: [image],

      datePublished: datePublished,

      dateModified:
        article.updated_at ||
        datePublished,

      articleSection: category,

      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical
      },

      publisher: {
        "@type": "Organization",

        name: "Press Express Assam",

        logo: {
          "@type": "ImageObject",
          url: `${SITE}/logo2.png`
        }
      }
    };

    // -----------------------------
    // LOAD INDEX.HTML
    // -----------------------------

    const indexPath =
      path.join(
        process.cwd(),
        "index.html"
      );

    let html =
      fs.readFileSync(
        indexPath,
        "utf8"
      );

    // -----------------------------
    // TITLE
    // -----------------------------

    html = html.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(title)} | Press Express Assam</title>`
    );

    // -----------------------------
    // DESCRIPTION
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+name=["']description["'][^>]*>/i,

      `<meta name="description" content="${escapeHtml(cleanDescription)}">`
    );

    // -----------------------------
    // CANONICAL
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<link\s+rel=["']canonical["'][^>]*>/i,

      `<link rel="canonical" href="${escapeHtml(canonical)}">`
    );

    // -----------------------------
    // OG TITLE
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+property=["']og:title["'][^>]*>/i,

      `<meta property="og:title" content="${escapeHtml(title)}">`
    );

    // -----------------------------
    // OG DESCRIPTION
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+property=["']og:description["'][^>]*>/i,

      `<meta property="og:description" content="${escapeHtml(cleanDescription)}">`
    );

    // -----------------------------
    // OG URL
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+property=["']og:url["'][^>]*>/i,

      `<meta property="og:url" content="${escapeHtml(canonical)}">`
    );

    // -----------------------------
    // OG IMAGE
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+property=["']og:image["'][^>]*>/i,

      `<meta property="og:image" content="${escapeHtml(image)}">`
    );

    // -----------------------------
    // OG TYPE
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+property=["']og:type["'][^>]*>/i,

      `<meta property="og:type" content="article">`
    );

    // -----------------------------
    // OG SITE NAME
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+property=["']og:site_name["'][^>]*>/i,

      `<meta property="og:site_name" content="Press Express Assam">`
    );

    // -----------------------------
    // TWITTER CARD
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+name=["']twitter:card["'][^>]*>/i,

      `<meta name="twitter:card" content="summary_large_image">`
    );

    // -----------------------------
    // TWITTER TITLE
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+name=["']twitter:title["'][^>]*>/i,

      `<meta name="twitter:title" content="${escapeHtml(title)}">`
    );

    // -----------------------------
    // TWITTER DESCRIPTION
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+name=["']twitter:description["'][^>]*>/i,

      `<meta name="twitter:description" content="${escapeHtml(cleanDescription)}">`
    );

    // -----------------------------
    // TWITTER IMAGE
    // -----------------------------

    html = addOrReplaceMeta(
      html,

      /<meta\s+name=["']twitter:image["'][^>]*>/i,

      `<meta name="twitter:image" content="${escapeHtml(image)}">`
    );

    // -----------------------------
    // JSON-LD
    // -----------------------------

    html = html.replace(
      /<\/head>/i,

      `
<script type="application/ld+json">
${escapeJson(articleSchema)}
</script>
</head>
`
    );

    // -----------------------------
    // HEADERS
    // -----------------------------

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    // -----------------------------
    // SEND HTML
    // -----------------------------

    return res
      .status(200)
      .send(html);

  } catch (error) {

    console.error(
      "Share API Error:",
      error
    );

    return res
      .status(500)
      .send("Server error");
  }
};
