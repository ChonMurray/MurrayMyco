import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categories reflecting species/product groupings
  const categories = await prisma.$transaction([
    prisma.category.upsert({
      where: { slug: "fresh" },
      update: {},
      create: { slug: "fresh", name: "Fresh culinary mushrooms", colorHex: "#7c3aed" },
    }),
    prisma.category.upsert({
      where: { slug: "grow-kits" },
      update: {},
      create: { slug: "grow-kits", name: "Mushroom grow kits", colorHex: "#10b981" },
    }),
    prisma.category.upsert({
      where: { slug: "liquid-cultures" },
      update: {},
      create: { slug: "liquid-cultures", name: "Liquid cultures", colorHex: "#f59e0b" },
    }),
    prisma.category.upsert({
      where: { slug: "extracts" },
      update: {},
      create: { slug: "extracts", name: "Medicinal mushroom extracts", colorHex: "#0ea5e9" },
    }),
    prisma.category.upsert({
      where: { slug: "substrates" },
      update: {},
      create: { slug: "substrates", name: "Substrates & blocks", colorHex: "#6b7280" },
    }),
  ]);

  // Sample products
  const [freshCat, growKitsCat, liquidCulturesCat, extractsCat, substratesCat] = categories;

  // Fresh mushrooms with matching image names
  const blueOyster = await prisma.product.upsert({
    where: { sku: "FRESH-BLUE-OYSTER" },
    update: {},
    create: {
      sku: "FRESH-BLUE-OYSTER",
      slug: "blue-oyster",
      name: "Blue Oyster",
      summary: "Delicate, savory flavor with a tender texture. Perfect for stir-fries and soups.",
      categoryId: freshCat.id,
      variants: {
        create: [
          { name: "250g", priceCents: 800, unit: "g", stock: 25 },
          { name: "500g", priceCents: 1400, unit: "g", stock: 15 },
        ],
      },
    },
  });

  const lionsMane = await prisma.product.upsert({
    where: { sku: "FRESH-LIONS-MANE" },
    update: {},
    create: {
      sku: "FRESH-LIONS-MANE",
      slug: "lions-mane",
      name: "Lion's Mane",
      summary: "Unique seafood-like flavor and texture. Excellent for gourmet dishes.",
      categoryId: freshCat.id,
      variants: {
        create: [
          { name: "250g", priceCents: 1200, unit: "g", stock: 20 },
          { name: "500g", priceCents: 2000, unit: "g", stock: 12 },
        ],
      },
    },
  });

  const pinkOyster = await prisma.product.upsert({
    where: { sku: "FRESH-PINK-OYSTER" },
    update: {},
    create: {
      sku: "FRESH-PINK-OYSTER",
      slug: "pink-oyster",
      name: "Pink Oyster",
      summary: "Vibrant pink color with a delicate, slightly fruity flavor. Beautiful and delicious.",
      categoryId: freshCat.id,
      variants: {
        create: [
          { name: "250g", priceCents: 900, unit: "g", stock: 18 },
          { name: "500g", priceCents: 1600, unit: "g", stock: 10 },
        ],
      },
    },
  });

  const reishi = await prisma.product.upsert({
    where: { sku: "EXTRACT-REISHI" },
    update: {},
    create: {
      sku: "EXTRACT-REISHI",
      slug: "reishi-extract",
      name: "Reishi Extract",
      summary: "Dual-extracted tincture (1:4)",
      categoryId: extractsCat.id,
      variants: {
        create: [
          { name: "30mL", priceCents: 2000, unit: "mL", stock: 40 },
          { name: "60mL", priceCents: 3400, unit: "mL", stock: 30 },
        ],
      },
    },
  });

  // Grow kits
  const blueOysterKit = await prisma.product.upsert({
    where: { sku: "KIT-BLUE-OYSTER" },
    update: {},
    create: {
      sku: "KIT-BLUE-OYSTER",
      slug: "blue-oyster-kit",
      name: "Blue Oyster Grow Kit",
      summary: "Complete kit with substrate, culture, and instructions. Perfect for beginners.",
      categoryId: growKitsCat.id,
      variants: { create: [{ name: "Standard Kit", priceCents: 2995, unit: "kit", stock: 30 }] },
    },
  });

  const lionsManeKit = await prisma.product.upsert({
    where: { sku: "KIT-LIONS-MANE" },
    update: {},
    create: {
      sku: "KIT-LIONS-MANE",
      slug: "lions-mane-kit",
      name: "Lion's Mane Grow Kit",
      summary: "Everything needed to grow your own Lion's Mane at home. Includes detailed guide.",
      categoryId: growKitsCat.id,
      variants: { create: [{ name: "Standard Kit", priceCents: 3495, unit: "kit", stock: 25 }] },
    },
  });

  const pinkOysterKit = await prisma.product.upsert({
    where: { sku: "KIT-PINK-OYSTER" },
    update: {},
    create: {
      sku: "KIT-PINK-OYSTER",
      slug: "pink-oyster-kit",
      name: "Pink Oyster Grow Kit",
      summary: "Fast-growing kit with beautiful pink mushrooms. Great for first-time growers.",
      categoryId: growKitsCat.id,
      variants: { create: [{ name: "Standard Kit", priceCents: 2995, unit: "kit", stock: 35 }] },
    },
  });

  // Liquid cultures
  const blueOysterLC = await prisma.product.upsert({
    where: { sku: "LC-BLUE-OYSTER" },
    update: {},
    create: {
      sku: "LC-BLUE-OYSTER",
      slug: "blue-oyster-lc",
      name: "Blue Oyster Liquid Culture",
      summary: "Sterile 10mL LC for Blue Oyster cultivation",
      categoryId: liquidCulturesCat.id,
      variants: { create: [{ name: "10mL", priceCents: 1500, unit: "mL", stock: 100 }] },
    },
  });

  const lionsManeLC = await prisma.product.upsert({
    where: { sku: "LC-LIONS-MANE" },
    update: {},
    create: {
      sku: "LC-LIONS-MANE",
      slug: "lions-mane-lc",
      name: "Lion's Mane Liquid Culture",
      summary: "Sterile 10mL LC for Lion's Mane cultivation",
      categoryId: liquidCulturesCat.id,
      variants: { create: [{ name: "10mL", priceCents: 1500, unit: "mL", stock: 100 }] },
    },
  });

  const pinkOysterLC = await prisma.product.upsert({
    where: { sku: "LC-PINK-OYSTER" },
    update: {},
    create: {
      sku: "LC-PINK-OYSTER",
      slug: "pink-oyster-lc",
      name: "Pink Oyster Liquid Culture",
      summary: "Sterile 10mL LC for Pink Oyster cultivation",
      categoryId: liquidCulturesCat.id,
      variants: { create: [{ name: "10mL", priceCents: 1500, unit: "mL", stock: 100 }] },
    },
  });

  const block = await prisma.product.upsert({
    where: { sku: "BLOCK-OAK-5LB" },
    update: {},
    create: {
      sku: "BLOCK-OAK-5LB",
      slug: "pre-colonized-oak-block",
      name: "Pre-colonized Oak Block",
      summary: "5 lb substrate block",
      categoryId: substratesCat.id,
      variants: { create: [{ name: "5lb", priceCents: 2500, unit: "block", stock: 10 }] },
    },
  });

  // Relationships (visual links)
  await prisma.productRelation.createMany({
    data: [
      { fromId: blueOysterLC.id, toId: block.id, relation: "inoculates", strength: 2 },
      { fromId: block.id, toId: blueOyster.id, relation: "fruits_to", strength: 3 },
      { fromId: blueOyster.id, toId: reishi.id, relation: "complements", strength: 1 },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
