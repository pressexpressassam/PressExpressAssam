const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  "https://fhxtbfxvsnuelkmkbtnr.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_jM_lhxQm0iWqko9hZROrCg_n_kvNoEu";

const SITE =
  "https://press-express-assam-ryfd.vercel.app";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = async function handler(req, res) {
  try {
    const id = req.query && req.query.id;

    if (!id) {
      return res
        .status(400)
        .send("News ID missing");
    }

    const { data: article, error } =
      await supabase
        .from("articles")
        .select(
          "id,title,excerpt,content,image_url,created_at"
        )
        .eq("id", id)
        .single();

    if (error || !article) {
      return res
        .status(404)
        .send("News not found");
    }

    const title = escapeHtml(
      article.title ||
      "Press Express Assam"
    );

    const description = escapeHtml(
      article.excerpt ||
      article.content ||
      "অসমৰ শেহতীয়া খবৰ — Press Express Assam"
    );

    const image = escapeHtml(
      article.image_url ||
      SITE + "/logo2.png"
    );

    const newsUrl =
      SITE +
      "/news/" +
      encodeURIComponent(article.id);

    const safeNewsUrl =
      escapeHtml(newsUrl);

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "public, max-age=60"
    );

    return res.status(200).send(`
<!DOCTYPE html>
<html lang="as">
<head>

<meta charset="UTF-8">

<title>
${title} — Press Express Assam
</title>

<meta
  name="description"
  content="${description}"
>

<meta
  name="robots"
  content="index, follow"
>

<link
  rel="canonical"
  href="${safeNewsUrl}"
>

<meta
  property="og:type"
  content="article"
>

<meta
  property="og:title"
  content="${title}"
>

<meta
  property="og:description"
  content="${description}"
>

<meta
  property="og:url"
  content="${safeNewsUrl}"
>

<meta
  property="og:image"
  content="${image}"
>

<meta
  property="og:image:alt"
  content="${title}"
>

<meta
  property="og:site_name"
  content="Press Express Assam"
>

<meta
  name="twitter:card"
  content="summary_large_image"
>

<meta
  name="twitter:title"
  content="${title}"
>

<meta
  name="twitter:description"
  content="${description}"
>

<meta
  name="twitter:image"
  content="${image}"
>

</head>

<body>

<h1>${title}</h1>

<p>${description}</p>

<script>
  window.location.replace(
    "/?news=" +
    encodeURIComponent(${JSON.stringify(
      String(article.id)
    )})
  );
</script>

<noscript>
  <meta
    http-equiv="refresh"
    content="0;url=/?news=${encodeURIComponent(
      String(article.id)
    )}"
  >
</noscript>

</body>
</html>
    `);

  } catch (error) {

    console.error(
      "Share API error:",
      error
    );

    return res
      .status(500)
      .send("Internal server error");
  }
};
