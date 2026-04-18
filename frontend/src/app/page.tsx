import Link from "next/link";
import { ArrowRight, Sparkles, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button"; // Will create this shortly
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Glass Navbar (placeholder until we build the real one) */}
      <nav className="fixed w-full z-50 top-0 left-0 bg-surface/80 backdrop-blur-[20px] px-8 py-4 flex items-center justify-between">
        <div className="font-heading font-bold text-xl text-primary tracking-tight">
          SkillxChange
        </div>
        <div className="flex gap-4">
      <ThemeToggle/>
          <Link href="/sign-in" className="text-on-surface hover:text-primary transition-colors py-2 px-4 font-medium">Log in</Link>
          <Link href="/sign-up">
            <button className="bg-gradient-primary text-white px-6 py-2 rounded-[3rem] font-medium hover:scale-95 transition-transform duration-300">
              Join the Atelier
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-24 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8 z-10">
          <h1 className="font-heading text-[3.5rem] leading-[1.1] font-bold text-on-surface tracking-[-0.02em]">
            Exchange value, <br />
            <span className="text-primary">not currency.</span>
          </h1>
          <p className="text-on-surface/80 text-lg leading-[1.6] max-w-xl">
            A curated space to trade your expertise. Learn high-income skills by teaching what you already know. Welcome to the digital atelier of knowledge.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/sign-up">
              <button className="bg-gradient-primary text-white px-8 py-4 rounded-[3rem] font-bold flex items-center gap-2 hover:scale-[0.98] transition-transform duration-300 shadow-[0_0_40px_rgba(70,72,212,0.3)]">
                Start Trading <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="#how-it-works">
              <button className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-[3rem] font-bold hover:bg-surface-container transition-colors duration-300">
                Discover
              </button>
            </Link>
          </div>
        </div>

        {/* Abstract "Glass" Hero Visual */}
        <div className="flex-1 relative w-full aspect-square max-w-md hidden lg:block">
          {/* Decorative floating elements */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative z-10 w-full h-full bg-surface-container-lowest/80 backdrop-blur-[20px] rounded-[3rem] border border-outline-variant/15 flex items-center justify-center custom-shadow">
             <Sparkles size={80} className="text-primary/50" />
          </div>
        </div>
      </main>

      {/* Value Pillars */}
      <section id="how-it-works" className="py-24 bg-surface-container-low px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl font-bold mb-16 text-center">The Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Borderless Exchange", desc: "Connect with experts globally. Your location doesn't limit your potential to learn." },
              { icon: Sparkles, title: "Curated Matching", desc: "Our algorithm pairs complementary skill sets for mutually beneficial growth." },
              { icon: Shield, title: "Verified Reputation", desc: "Built on trust. Every exchange is rated, ensuring a high-quality community." }
            ].map((feature, i) => (
              <div key={i} className="bg-surface-container-lowest p-8 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300 custom-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-on-surface/70 leading-[1.6]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-on-surface/50 text-sm">
        <p>© 2026 SkillxChange Digital Atelier. All rights reserved.</p>
      </footer>
    </div>
  );
}
