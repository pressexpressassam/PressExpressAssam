export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, title, image } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  return res.status(200).json({
    url,
    title: title || "Press Express Assam",
    image: image || "https://pressexpressassam.github.io/PressExpressAssam/logo2.png"
  });
}
