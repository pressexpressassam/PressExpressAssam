export default function handler(req, res) {
  const { title = "Press Express Assam", image, url } = req.query;

  const safeTitle = String(title)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const siteUrl =
    url
      ? String(url)
      : "https://press-express-assam-ryfd.vercel.app/";

  const imageUrl =
    image
      ? String(image)
      : "https://pressexpressassam.github.io/PressExpressAssam/logo2.png";

  const origin =
    `${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"] || req.headers.host}`;

  const proxyImage =
    `${origin}/api/image?url=${encodeURIComponent(imageUrl)}`;

  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  res.status(200).send(`
<!DOCTYPE html>
<html lang="as">
<head>
<meta charset="UTF-8">

<title>${safeTitle} | Press Express Assam</title>

<meta property="og:type" content="article">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="সত্য, নিৰপেক্ষ আৰু দায়িত্বশীল সংবাদ">
<meta property="og:image" content="${proxyImage}">
<meta property="og:image:secure_url" content="${proxyImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${siteUrl}">
<meta property="og:site_name" content="Press Express Assam">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${safeTitle}">
<meta name="twitter:image" content="${proxyImage}">

<meta http-equiv="refresh" content="0;url=${siteUrl}">

</head>

<body>
<p>Press Express Assam</p>
<p>${safeTitle}</p>
</body>
</html>
`);
}
