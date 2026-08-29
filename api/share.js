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


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   CLEAN DESCRIPTION
   ========================================================= */

function cleanDescription(value) {

  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);
}


/* =========================================================
   HANDLER
   ========================================================= */

module.exports = async function handler(req, res) {

  try {

    const id =
      req.query &&
      req.query.id;


    if (!id) {

      return res
        .status(400)
        .send("News ID missing");
    }


    /* =====================================================
       LOAD NEWS
       ===================================================== */

    const { data: article, error } =
      await supabase
        .from("articles")
        .select(
          "id,title,excerpt,content,image_url,created_at,category,reporter_name"
        )
        .eq("id", id)
        .eq("published", true)
        .single();


    if (error || !article) {

      return res
        .status(404)
        .send("News not found");
    }


    /* =====================================================
       NEWS DATA
       ===================================================== */

    const title =
      article.title ||
      "Press Express Assam";


    const description =
      cleanDescription(
        article.excerpt ||
        article.content ||
        "অসমৰ শেহতীয়া খবৰ — Press Express Assam"
      );


    const image =
      article.image_url ||
      SITE + "/logo2.png";


    const newsUrl =
      SITE +
      "/news/" +
      encodeURIComponent(
        String(article.id)
      );


    const publishedDate =
      article.created_at ||
      new Date().toISOString();


    const category =
      article.category ||
      "অসম";


    const reporter =
      article.reporter_name ||
      "Press Express Assam";


    /* =====================================================
       ESCAPED VALUES
       ===================================================== */

    const safeTitle =
      escapeHtml(title);


    const safeDescription =
      escapeHtml(description);


    const safeImage =
      escapeHtml(image);


    const safeNewsUrl =
      escapeHtml(newsUrl);


    const safeCategory =
      escapeHtml(category);


    const safeReporter =
      escapeHtml(reporter);


    const safeContent =
      escapeHtml(
        article.content || description
      );


    /* =====================================================
       JSON-LD STRUCTURED DATA
       ===================================================== */

    const structuredData = {

      "@context":
        "https://schema.org",

      "@type":
        "NewsArticle",

      "headline":
        title,

      "description":
        description,

      "image": [
        image
      ],

      "datePublished":
        publishedDate,

      "dateModified":
        publishedDate,

      "mainEntityOfPage": {

        "@type":
          "WebPage",

        "@id":
          newsUrl
      },

      "author": {

        "@type":
          "Person",

        "name":
          reporter
      },

      "publisher": {

        "@type":
          "Organization",

        "name":
          "Press Express Assam",

        "logo": {

          "@type":
            "ImageObject",

          "url":
            SITE + "/logo2.png"
        }
      },

      "articleSection":
        category
    };


    const jsonLd =
      JSON.stringify(
        structuredData
      ).replace(
        /</g,
        "\\u003c"
      );


    /* =====================================================
       RESPONSE HEADERS
       ===================================================== */

    res.setHeader(
      "Content-Type",
      "text/html; charset=utf-8"
    );


    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=300"
    );


    /* =====================================================
       HTML
       ===================================================== */

    return res
      .status(200)
      .send(`

<!DOCTYPE html>

<html lang="as">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>


<title>
${safeTitle} — Press Express Assam
</title>


<meta
  name="description"
  content="${safeDescription}"
>


<meta
  name="robots"
  content="index, follow, max-image-preview:large"
>


<link
  rel="canonical"
  href="${safeNewsUrl}"
>


<!-- =====================================================
     OPEN GRAPH
     ===================================================== -->

<meta
  property="og:type"
  content="article"
>


<meta
  property="og:title"
  content="${safeTitle}"
>


<meta
  property="og:description"
  content="${safeDescription}"
>


<meta
  property="og:url"
  content="${safeNewsUrl}"
>


<meta
  property="og:image"
  content="${safeImage}"
>


<meta
  property="og:image:alt"
  content="${safeTitle}"
>


<meta
  property="og:site_name"
  content="Press Express Assam"
>


<meta
  property="article:published_time"
  content="${escapeHtml(publishedDate)}"
>


<meta
  property="article:section"
  content="${safeCategory}"
>


<!-- =====================================================
     TWITTER
     ===================================================== -->

<meta
  name="twitter:card"
  content="summary_large_image"
>


<meta
  name="twitter:title"
  content="${safeTitle}"
>


<meta
  name="twitter:description"
  content="${safeDescription}"
>


<meta
  name="twitter:image"
  content="${safeImage}"
>


<!-- =====================================================
     NEWS ARTICLE STRUCTURED DATA
     ===================================================== -->

<script type="application/ld+json">
${jsonLd}
</script>


<style>

body{
  font-family:
    Arial,
    "Noto Sans Assamese",
    sans-serif;

  max-width:900px;

  margin:0 auto;

  padding:25px;

  line-height:1.8;

  color:#171717;

  background:#fff;
}

img{
  max-width:100%;

  height:auto;

  border-radius:10px;

  margin:15px 0;
}

h1{
  font-size:32px;

  line-height:1.4;
}

.category{
  color:#d71936;

  font-weight:bold;
}

.date{
  color:#777;

  font-size:14px;
}

.content{
  white-space:pre-wrap;

  font-size:18px;
}

</style>

</head>


<body>


<div class="category">
${safeCategory}
</div>


<h1>
${safeTitle}
</h1>


<div class="date">
প্ৰকাশিত: ${escapeHtml(
  new Date(publishedDate)
    .toLocaleString("as-IN")
)}
</div>


${image ? `
<img
  src="${safeImage}"
  alt="${safeTitle}"
>
` : ""}


<p>
${safeDescription}
</p>


<div class="content">
${safeContent}
</div>


<p>
<strong>
সাংবাদিক:
</strong>
${safeReporter}
</p>


<p>
Press Express Assam
</p>


<script>

window.location.replace(
  "/?news=" +
  encodeURIComponent(
    ${JSON.stringify(
      String(article.id)
    )}
  )
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
      .send(
        "Internal server error"
      );
  }
};
