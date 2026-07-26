const { Redis } = require("@upstash/redis");
const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  try {
    let products = await redis.get("sagali_products");
    if (!products) { products = []; await redis.set("sagali_products", "[]"); }
    else if (typeof products === "string") products = JSON.parse(products);
    res.status(200).json({ products });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
