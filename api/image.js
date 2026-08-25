export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send("Image URL required");
  }

  try {
    const imageUrl = new URL(url);

    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      return res.status(400).send("Invalid image URL");
    }

    const response = await fetch(imageUrl.toString());

    if (!response.ok) {
      return res.status(response.status).send("Image could not be loaded");
    }

    const contentType =
      response.headers.get("content-type") || "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return res.status(400).send("URL is not an image");
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400"
    );

    return res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Image proxy error");
  }
}
