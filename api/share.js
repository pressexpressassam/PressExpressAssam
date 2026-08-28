const fs = require("fs");
const path = require("path");

const SUPABASE_URL =
  "https://fhxtbfxvsnuelkmkbtnr.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_jM_lhxQm0iWqko9hZROrCg_n_kvNoEu";

const SITE =
  "https://press-express-assam-ryfd.vercel.app";


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeJson(value) {
  return JSON.stringify(value ?? "")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}


function setMeta(html, regex, tag) {

  if (regex.test(html)) {
    return html.replace(regex, tag);
  }

  return html.replace(
    /<\/head>/i,
    `${tag}\n</head>`
  );
}


module.exports = async function handler(req, res) {

  try {

    /* =========================
       GET NEWS ID
    ========================= */

    let id =
      req.query &&
      req.query.id;

    /*
      If Vercel rewrite gives:
      /api/share?id=26
      the above works.

      Also supports:
      /news/26
    */

    if (!id && req.url) {

      const match =
        req.url.match(
          /\/news\/([^/?#]+)/
        );

      if (match) {
        id = match[1];
      }

    }


    if (!id) {

      return res
        .status(400)
        .send("News ID missing");

    }


    id = String(id);


    /* =========================
       LOAD NEWS
    ========================= */

    const apiUrl =
      `${SUPABASE_URL}/rest/v1/articles` +
      `?id=eq.${encodeURIComponent(id)}` +
      `&select=*`;


    const response =
      await fetch(
        apiUrl,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization:
              `Bearer ${SUPABASE_KEY}`
          }
        }
      );


    if (!response.ok) {

      console.error(
        "Supabase:",
        response.status
      );

      return res
        .status(500)
        .send("News load failed");

    }


    const articles =
      await response.json();


    if (
      !Array.isArray(articles) ||
      articles.length === 0
    ) {

      return res
        .status(404)
        .send("News not found");

    }


    const article =
      articles[0];


    /* =========================
       NEWS DATA
    ========================= */

    const title =
      article.title ||
      "Press Express Assam";


    const description =
      article.excerpt ||
      article.description ||
      article.content ||
      "অসমৰ শেহতীয়া স্থানীয়, ৰাজ্যিক, ৰাষ্ট্ৰীয় আৰু আন্তঃৰাষ্ট্ৰীয় সংবাদ।";


    const cleanDescription =
      String(description)
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 160);


    const canonical =
      `${SITE}/news/${encodeURIComponent(
        article.id
      )}`;


    const image =
      article.image_url ||
      `${SITE}/logo2.png`;


    const category =
      article.category ||
      "অসম";


    const datePublished =
      article.created_at ||
      new Date().toISOString();


    const dateModified =
      article.updated_at ||
      datePublished;


    /* =========================
       JSON-LD
    ========================= */

    const articleSchema = {

      "@context":
        "https://schema.org",

      "@type":
        "NewsArticle",

      headline:
        title,

      description:
        cleanDescription,

      image: [
        image
      ],

      datePublished:
        datePublished,

      dateModified:
        dateModified,

      articleSection:
        category,

      mainEntityOfPage: {

        "@type":
          "WebPage",

        "@id":
          canonical

      },

      publisher: {

        "@type":
          "Organization",

        name:
          "Press Express Assam",

        logo: {

          "@type":
            "ImageObject",

          url:
            `${SITE}/logo2.png`

        }

      }

    };


    /* =========================
       LOAD INDEX
    ========================= */

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


    /* =========================
       TITLE
    ========================= */

    html = html.replace(
      /<title>[\s\S]*?<\/title>/i,

      `<title>${escapeHtml(
        title
      )} | Press Express Assam</title>`
    );


    /* =========================
       DESCRIPTION
    ========================= */

    html = setMeta(
      html,

      /<meta\s+name=["']description["'][^>]*>/i,

      `<meta name="description" content="${escapeHtml(
        cleanDescription
      )}">`
    );


    /* =========================
       CANONICAL
    ========================= */

    html = setMeta(
      html,

      /<link\s+rel=["']canonical["'][^>]*>/i,

      `<link rel="canonical" href="${escapeHtml(
        canonical
      )}">`
    );


    /* =========================
       OPEN GRAPH
    ========================= */

    html = setMeta(
      html,

      /<meta\s+property=["']og:title["'][^>]*>/i,

      `<meta property="og:title" content="${escapeHtml(
        title
      )}">`
    );


    html = setMeta(
      html,

      /<meta\s+property=["']og:description["'][^>]*>/i,

      `<meta property="og:description" content="${escapeHtml(
        cleanDescription
      )}">`
    );


    html = setMeta(
      html,

      /<meta\s+property=["']og:url["'][^>]*>/i,

      `<meta property="og:url" content="${escapeHtml(
        canonical
      )}">`
    );


    html = setMeta(
      html,

      /<meta\s+property=["']og:image["'][^>]*>/i,

      `<meta property="og:image" content="${escapeHtml(
        image
      )}">`
    );


    html = setMeta(
      html,

      /<meta\s+property=["']og:type["'][^>]*>/i,

      `<meta property="og:type" content="article">`
    );


    html = setMeta(
      html,

      /<meta\s+property=["']og:site_name["'][^>]*>/i,

      `<
