export default function handler(req, res) {
  const { title = "Press Express Assam", image, url } = req.query;

  const safeTitle = String(title)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const proxyImage = image
  ? `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/image?url=${encodeURIComponent(image)}`
  : "";

const safeImage = proxyImage.replace(/"/g, "&quot;");

  const safeUrl = url
    ? String(url).replace(/"/g, "&quot;")
    : "https://press-express-assam-ryfd.vercel.app/";

  res.setHeader("Content-Type", "text/html; charset=utf-8");

  res.status(200).send(`
<!DOCTYPE html>
<html lang="as">
<head>
<meta charset="UTF-8">

<title>${safeTitle} | Press Express Assam</title>

<meta property="og:type" content="article">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="সত্য, নিৰপেক্ষ আৰু দায়িত্বশীল সংবাদ">
<meta property="og:image" content="${safeImage}">
<meta property="og:url" content="${safeUrl}">
<meta property="og:site_name" content="Press Express Assam">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${safeTitle}">
<meta name="twitter:image" content="${safeImage}">

<meta http-equiv="refresh" content="0;url=${safeUrl}">
</head>

<body>
<p>Press Express Assam</p>
<p>${safeTitle}</p>
</body>
</html>
  `);
}
