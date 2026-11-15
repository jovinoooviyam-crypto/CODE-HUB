

export default async function handler(req, res) {
    const { fileId } = req.query;

    if (!fileId) {
        return res.status(400).send("Missing Google Drive file ID");
    }

    try {
        const imageUrl =
            `https://drive.google.com/uc?export=download&id=${fileId}`;

        const response = await fetch(imageUrl);

        if (!response.ok) {
            return res.status(response.status).send("Image not found");
        }

        const contentType = response.headers.get("content-type");

        if (!contentType?.startsWith("image/")) {
            return res.status(400).send("Invalid image file");
        }

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");

        const imageBuffer = Buffer.from(
            await response.arrayBuffer()
        );

        return res.status(200).send(imageBuffer);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Unable to load image");
    }
}
