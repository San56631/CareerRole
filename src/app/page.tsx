import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    name: "Resume Analyzer",
    desc: "Upload your resume and get a score against a real target role, with specific line-by-line fixes.",
    tag: "01",
  },
  {
    name: "Skill Gap Roadmap",
    desc: "See exactly which skills separate you from the role you want, and a plan to close the gap.",
    tag: "02",
  },
  {
    name: "Mock Interview",
    desc: "Practice with role-specific questions and get structured feedback on your answers.",
    tag: "03",
  },
  {
    name: "Career Advisor Agent",
    desc: "One AI agent that reads your resume, checks your gaps, and decides what you should work on next.",
    tag: "04",
  },
];

const STATS = [
  { value: "3", label: "AI modules in one flow" },
  { value: "0", label: "Cost to get started" },
  { value: "1", label: "Agent that ties it together" },
];

const VALUES = [
  {
    title: "Built for the access gap",
    desc: "No placement cell, no industry mentor, no problem. CareerRole gives that guidance to any student with a resume.",
  },
  {
    title: "Specific, not generic",
    desc: "Feedback is tied to the exact role you're targeting, not a one-size-fits-all resume checklist.",
  },
  {
    title: "A loop, not a one-time scan",
    desc: "Analyze, close gaps, practice, repeat. CareerRole tracks where you stand every time you come back.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I didn't know my resume had no keywords for the role I wanted until I ran it here. Fixed it in a day.",
    name: "Ayesha K.",
    role: "3rd year, CSE",
  },
  {
    quote:
      "The mock interview caught how vague my answers were. My real interview went a lot better after two rounds of practice.",
    name: "Rohit V.",
    role: "Final year, ECE",
  },
  {
    quote:
      "My college has no placement cell for my branch. This is the closest thing I've had to a mentor.",
    name: "Sneha P.",
    role: "Final year, IT",
  },
];

export default function Home() {
  return (
    <main className="bg-bg">
      {/* Nav */}
      <header className="border-b border-line bg-gold">
        <div className="container-x flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CareerRole logo" width={48} height={48} />
            <span className="font-display text-3xl font-bold text-textPrimary">CareerRole</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-bg">
            <a href="#features" className="font-bold hover:text-textPrimary">
              Features
            </a>
            <a href="#why" className="font-bold hover:text-textPrimary">
              Why CareerRole
            </a>
            <a href="#stories" className="font-bold hover:text-textPrimary">
              Stories
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-bg text-sm font-medium border border-bg rounded-card px-4 py-2 hover:bg-textSecondary hover:text-white transition-colors"
            >
              Log in
            </Link>

            <Link
              href="/login?mode=signup"
              className="text-sm font-medium bg-gold rounded-card px-4 py-2 hover:bg-maroon transition-colors text-goldText"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container-x pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-goldDeep text-sm font-medium tracking-wide uppercase mb-4">
            AI career guidance
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-textPrimary mb-6">
            Not everyone has a placement cell.
          </h1>
          <p className="text-textSecondary text-lg leading-relaxed mb-8 max-w-md">
            CareerRole gives every student the resume feedback, skill
            roadmap, and interview practice a placement cell would give —
            powered by AI, free to start.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="bg-gold text-goldDeep font-medium rounded-card px-6 py-3 hover:bg-[#E9971A] transition-colors text-goldText"
            >
              Get started free
            </Link>
            <a
              href="#features"
              className="text-textPrimary font-medium underline underline-offset-4 hover:text-goldDeep"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Signature graphic: the gap between where you are and the role you want */}
        <div className="relative">
          <Image
            src="/Landing.jpg"
            alt="A team of professionals climbing a rising arrow toward a target, representing career growth"
            width={560}
            height={490}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-surface">
        <div className="container-x py-10 grid grid-cols-3 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl text-gold">{s.value}</p>
              <p className="text-sm text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container-x py-20">
        <h2 className="font-display text-2xl md:text-3xl text-textPrimary mb-2">
          Everything a mentor would tell you
        </h2>
        <p className="text-textSecondary mb-10 max-w-lg">
          Four modules, one flow — from finding out where your resume stands
          to walking into the interview room ready.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.name}
              className="border border-line rounded-card p-6 bg-surface hover:border-goldDeep transition-colors"
            >
              <span className="text-goldDeep font-display text-sm">
                {f.tag}
              </span>
              <h3 className="font-display text-lg text-textPrimary mt-2 mb-2">
                {f.name}
              </h3>
              <p className="text-textSecondary text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why CareerRole */}
      <section id="why" className="bg-surface border-t border-line">
        <div className="container-x py-20">
          <h2 className="font-display text-2xl md:text-3xl text-textPrimary mb-10">
            Why CareerRole
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {VALUES.map((v) => (
              <div key={v.title}>
                <h3 className="font-display text-lg text-textPrimary mb-2">
                  {v.title}
                </h3>
                <p className="text-textSecondary text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="container-x py-20">
        <h2 className="font-display text-2xl md:text-3xl text-textPrimary mb-10 text-center">
          What students are saying
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="border border-line rounded-card p-6 bg-surface"
            >
              <p className="text-textPrimary text-sm leading-relaxed mb-4">
                "{t.quote}"
              </p>
              <p className="text-sm font-medium text-textPrimary">{t.name}</p>
              <p className="text-xs text-textSecondary">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-surface">
        <div className="container-x py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">
              Ready to close your career gap?
            </h2>
            <p className="text-white/70 text-sm">
              Upload your resume and see where you stand in two minutes.
            </p>
          </div>
          <Link
            href="/login"
            className="bg-gold font-medium rounded-card px-6 py-3 hover:bg-[#E9971A] transition-colors whitespace-nowrap text-goldText"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="container-x py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-textPrimary">CareerRole</span>
          <p className="text-xs text-textSecondary">
            Built for students without a placement cell.
          </p>
        </div>
      </footer>
    </main>
  );
}
