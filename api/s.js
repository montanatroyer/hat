function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

function decodeShare(encoded) {
  try {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    const obj = JSON.parse(json);
    if (!obj || typeof obj.name !== "string" || !Array.isArray(obj.items)) return null;
    return { name: obj.name.trim(), itemCount: obj.items.length };
  } catch (e) {
    return null;
  }
}

module.exports = (req, res) => {
  const encoded = (req.query && req.query.share) || "";
  const decoded = decodeShare(encoded);
  const name = decoded ? decoded.name : "Magical Hats";
  const desc = decoded
    ? `Open the "${name}" hat — ${decoded.itemCount} item${decoded.itemCount === 1 ? "" : "s"} inside.`
    : "Drop your papers in. Pick one at random.";
  const safeName = escapeHtml(name);
  const safeDesc = escapeHtml(desc);
  const target = encoded ? `/?share=${encodeURIComponent(encoded)}` : "/";
  const safeTargetAttr = escapeHtml(target);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeName}</title>
<meta property="og:title" content="${safeName}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${safeName}" />
<meta name="twitter:description" content="${safeDesc}" />
<meta http-equiv="refresh" content="0;url=${safeTargetAttr}" />
<script>window.location.replace(${JSON.stringify(target)});</script>
</head>
<body>Loading ${safeName}…</body>
</html>`);
};
