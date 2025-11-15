import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/murray_myco.svg"
            alt="Murray Myco logo"
            width={120}
            height={120}
            className="invert brightness-0"
            priority
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">Murray Myco</h1>
        <p className="mt-4 text-base md:text-lg">
          Gourmet mushrooms and quality cultures
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <a href="/fresh-mushrooms" className="px-5 py-2 rounded-md border border-foreground/50 hover:bg-foreground/10">Fresh Mushrooms</a>
          <a href="/grow-kits" className="px-5 py-2 rounded-md border border-foreground/50 hover:bg-foreground/10">Grow Kits</a>
          <a href="/liquid-cultures" className="px-5 py-2 rounded-md border border-foreground/50 hover:bg-foreground/10">Liquid Cultures</a>
          <a href="/learning-center" className="px-5 py-2 rounded-md border border-foreground/50 hover:bg-foreground/10">Learning Center</a>
          <a href="/about" className="px-5 py-2 rounded-md border border-foreground/50 hover:bg-foreground/10">About</a>
        </div>
      </div>
    </div>
  );
}
