export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-8">Mechatronics to Mushrooms</h1>

      <div className="space-y-8 text-foreground/90 leading-relaxed">
        <div>
          <p>
            When my daughter was born, it changed what felt important. I realized I had to go for what I actually wanted—for myself and my family. Not hours commuting to just sit at a desk all day. Not corporate timelines. 
          </p>
          <p className="mt-4">
            After years working as an engineer in the medical device industry, I decided I wanted to apply that same precision to something more tangible: combining cleanroom rigor with food production. Quality mushrooms, reliable liquid cultures, and open-source methods so others can do the same.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">The Approach</h2>
          <p>
            I&apos;m not coming with a solution looking for a problem. I&apos;m applying scientific and engineering principles to the actual problems in mushroom cultivation—finding them through hands-on work, optimizing systematically. The goal is to make this significantly easier for people, to challenge the idea that food production is impossible or inaccessible.
          </p>
          <p className="mt-4">
            Right now: producing quality mushrooms and liquid cultures while documenting methods openly. Testing, iterating, learning what works. Building the foundation for what comes next.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">The Vision</h2>
          <p>
            A state-of-the-art streamlined facility that provides jobs for local people and food for the community. State-of-the-art doesn&apos;t mean expensive or proprietary—it means world-class design using accessible tools: 3D printing, open-source hardware, methods anyone can replicate. DIY-accessible equipment with precision engineering.
          </p>
          <p className="mt-4">
            Focused on resource efficiency—both human and natural—with safety and positive workplace culture as non-negotiables. Where automation makes high-quality cultivation achievable without breaking the bank, and where every process is documented so others can build the same thing.
          </p>
          <p className="mt-4">
            Accessibility is the focus. Proving that local food production isn&apos;t just possible—it&apos;s practical, affordable, and worth doing right.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-foreground/20">
          <p className="text-foreground font-medium">—Sean Murray</p>
          <p className="text-foreground/70 italic">Mechatronics Engineer, Mycology Nerd</p>
        </div>
      </div>
    </section>
  );
}
