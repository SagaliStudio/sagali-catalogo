const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const seedProducts = [
  {
    id: "seed-1",
    nombre: "Vajilla de la Abuela",
    coleccion: "Casa",
    precio: "",
    desc: "Inspirado en la vitrina de la abuela y los platos pintados a mano. Listón, piedras de cerámica, broche de acero y dije plastificado.",
    img: "/img/producto1.jpg",
  },
];

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  try {
    let products = await redis.get("sagali_products");
    if (!products) {
      products = seedProducts;
      await redis.set("sagali_products", JSON.stringify(seedProducts));
    } else if (typeof products === "string") {
      products = JSON.parse(products);
    }
    res.status(200).json({ products });
  } catch (err) {
    console.error("Redis error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
