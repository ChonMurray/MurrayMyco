const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.$transaction([
    prisma.category.upsert({ where: { slug: 'fresh' }, update: {}, create: { slug: 'fresh', name: 'Fresh culinary mushrooms', colorHex: '#7c3aed' } }),
    prisma.category.upsert({ where: { slug: 'extracts' }, update: {}, create: { slug: 'extracts', name: 'Medicinal mushroom extracts', colorHex: '#0ea5e9' } }),
    prisma.category.upsert({ where: { slug: 'dried' }, update: {}, create: { slug: 'dried', name: 'Dried mushrooms', colorHex: '#16a34a' } }),
    prisma.category.upsert({ where: { slug: 'cultures' }, update: {}, create: { slug: 'cultures', name: 'Cultures & media', colorHex: '#f59e0b' } }),
    prisma.category.upsert({ where: { slug: 'substrates' }, update: {}, create: { slug: 'substrates', name: 'Substrates & blocks', colorHex: '#6b7280' } }),
  ]);

  const [freshCat, extractsCat, driedCat, culturesCat, substratesCat] = categories;

  const oyster = await prisma.product.upsert({
    where: { sku: 'FRESH-OYSTER' },
    update: {},
    create: {
      sku: 'FRESH-OYSTER',
      name: 'Oyster Mushrooms',
      summary: 'Delicate texture with savory notes.',
      categoryId: freshCat.id,
      variants: { create: [ { name: '250g', priceCents: 800, unit: 'g', stock: 25 }, { name: '500g', priceCents: 1400, unit: 'g', stock: 15 } ] },
    },
  });

  const reishi = await prisma.product.upsert({
    where: { sku: 'EXTRACT-REISHI' },
    update: {},
    create: {
      sku: 'EXTRACT-REISHI',
      name: 'Reishi Extract',
      summary: 'Dual-extracted tincture (1:4)',
      categoryId: extractsCat.id,
      variants: { create: [ { name: '30mL', priceCents: 2000, unit: 'mL', stock: 40 }, { name: '60mL', priceCents: 3400, unit: 'mL', stock: 30 } ] },
    },
  });

  const culture = await prisma.product.upsert({
    where: { sku: 'CULT-LC-OYSTER' },
    update: {},
    create: {
      sku: 'CULT-LC-OYSTER',
      name: 'Oyster Liquid Culture',
      summary: 'Sterile 10mL LC',
      categoryId: culturesCat.id,
      variants: { create: [ { name: '10mL', priceCents: 1500, unit: 'mL', stock: 100 } ] },
    },
  });

  const block = await prisma.product.upsert({
    where: { sku: 'BLOCK-OAK-5LB' },
    update: {},
    create: {
      sku: 'BLOCK-OAK-5LB',
      name: 'Pre-colonized Oak Block',
      summary: '5 lb substrate block',
      categoryId: substratesCat.id,
      variants: { create: [ { name: '5lb', priceCents: 2500, unit: 'block', stock: 10 } ] },
    },
  });

  await prisma.productRelation.createMany({
    data: [
      { fromId: culture.id, toId: block.id, relation: 'inoculates', strength: 2 },
      { fromId: block.id, toId: oyster.id, relation: 'fruits_to', strength: 3 },
      { fromId: oyster.id, toId: reishi.id, relation: 'complements', strength: 1 },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
