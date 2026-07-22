const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    let products = await redis.get("sagali_products");
    if (!products) {
      products = [];
    } else if (typeof products === "string") {
      products = JSON.parse(products);
    }

    if (req.method === "POST") {
      const { nombre, coleccion, precio, desc, img } = req.body || {};

      if (!nombre || !coleccion) {
        res.status(400).json({ error: "Falta el nombre o la colección del collar" });
        return;
      }

      const newProduct = {
        id: "p-" + Date.now(),
        nombre,
        coleccion,
        precio: precio || "",
        desc: desc || "",
        img: img || "https://placehold.co/400x500/C3D19A/4A5E28?text=Sagali"
      };

      products.push(newProduct);
      await redis.set("sagali_products", JSON.stringify(products));
      res.status(200).json({ products });
      return;
    }

    if (req.method === "DELETE") {
      const { id } = req.body || {};
      if (!id) {
        res.status(400).json({ error: "Falta el id del collar a eliminar" });
        return;
      }
      products = products.filter((p) => p.id !== id);
      await redis.set("sagali_products", JSON.stringify(products));
      res.status(200).json({ products });
      return;
    }

    res.status(405).json({ error: "Método no permitido" });
  } catch (err) {
    res.status(500).json({ error: "No se pudo guardar el cambio", details: err.message });
  }
};
