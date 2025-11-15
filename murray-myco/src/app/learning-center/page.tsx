import PostCard from "@/components/cards/PostCard";

const posts = [
  {
    title: "Sterile Technique Fundamentals",
    description: "Learn the essential practices for maintaining contamination-free cultures. Covers laminar flow hood operation, proper aseptic procedures, and common mistakes to avoid.",
    category: "Technique",
    slug: "sterile-technique-fundamentals",
  },
  {
    title: "Liquid Culture Preparation",
    description: "Step-by-step guide to preparing high-quality liquid cultures. Includes recipes, sterilization procedures, and inoculation methods.",
    category: "Tutorial",
    slug: "liquid-culture-preparation",
  },
  {
    title: "Substrate Recipes and Optimization",
    description: "Detailed substrate formulations for different mushroom species. Learn how to optimize moisture content, supplementation, and sterilization.",
    category: "Guide",
    slug: "substrate-recipes",
  },
  {
    title: "Environmental Control Systems",
    description: "Build and configure environmental controls for fruiting chambers. Covers humidity, temperature, CO2, and fresh air exchange.",
    category: "DIY",
    slug: "environmental-control",
  },
  {
    title: "DIY Equipment Builds",
    description: "Open-source designs for cultivation equipment. 3D printable parts, Bill of Materials, and assembly instructions.",
    category: "DIY",
    slug: "diy-equipment",
  },
  {
    title: "Troubleshooting Common Issues",
    description: "Identify and solve common cultivation problems. Learn to recognize contamination, diagnose environmental issues, and optimize growing conditions.",
    category: "Guide",
    slug: "troubleshooting",
  },
];

export default function LearningCenterPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">Learning Center</h1>
      <p className="text-foreground/70 mb-12 max-w-2xl">
        Open-source cultivation knowledge, techniques, and methodologies. A growing collection of tutorials, guides, and documented processes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            title={post.title}
            description={post.description}
            category={post.category}
            slug={post.slug}
          />
        ))}
      </div>
    </section>
  );
}
