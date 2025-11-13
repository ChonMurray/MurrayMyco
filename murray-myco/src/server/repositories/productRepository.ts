import { prisma } from "@/lib/prisma";

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function listProductsByCategorySlug(slug: string) {
  const cat = await prisma.category.findUnique({ where: { slug } });
  if (!cat) return [];
  return prisma.product.findMany({
    where: { categoryId: cat.id },
    include: { variants: true },
    orderBy: { name: "asc" },
  });
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({
    where: { sku },
    include: {
      variants: true,
      category: true,
      relationships: { include: { to: true } },
      relatedTo: { include: { from: true } },
    },
  });
}

export async function getProductGraph() {
  const products = await prisma.product.findMany({ select: { id: true, name: true, sku: true } });
  const edges = await prisma.productRelation.findMany({ select: { fromId: true, toId: true, strength: true, relation: true } });
  return { products, edges };
}
