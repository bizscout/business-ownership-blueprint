import { useState, useEffect } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { ArrowRight, Check } from "lucide-react";
import SpiderChart from "./SpiderChart";

function AnimatedChart() {
  const [axes, setAxes] = useState({ DI: 6, OD: 6, CR: 6, RT: 6, SV: 6 });

  useEffect(() => {
    const interval = setInterval(() => {
      setAxes(prev => ({
        DI: Math.max(3, Math.min(10, prev.DI + (Math.random() * 6 - 3))),
        OD: Math.max(3, Math.min(10, prev.OD + (Math.random() * 6 - 3))),
        CR: Math.max(3, Math.min(10, prev.CR + (Math.random() * 6 - 3))),
        RT: Math.max(3, Math.min(10, prev.RT + (Math.random() * 6 - 3))),
        SV: Math.max(3, Math.min(10, prev.SV + (Math.random() * 6 - 3)))
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full md:max-w-md mx-auto mb-6 pointer-events-none">
      <div className="relative transition-all duration-1000 ease-in-out">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F0EDE4] z-10 opacity-80" />
        <SpiderChart axes={axes} />
      </div>
    </div>
  );
}

export default function LandingPage() {
  const submitLanding = useQuizStore((state) => state.submitLanding);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return;
    submitLanding(firstName, email);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full max-w-lg mx-auto md:mx-0 pt-8 pb-12">
      {/* Eyebrow / Brand label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] w-12 bg-[#52130C]"></div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#52130C]">Contrarian Thinking</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-display font-semibold mb-4 text-[#1F1E1C] leading-[1.05] tracking-tight">
        The Business<br />
        Ownership<br />
        <span className="italic font-light text-[#52130C]">Blueprint</span>
      </h1>

      <p className="text-lg md:text-xl text-[#1F1E1C]/70 mb-4 font-serif italic leading-relaxed">
        Discover exactly where you stand and what to do next.
      </p>

      <AnimatedChart />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-6 md:p-8 border border-[#E5E0D8] shadow-xl shadow-[#52130C]/5 mb-8">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-transparent border-b border-[#1F1E1C]/20 rounded-none px-0 py-2 text-[#1F1E1C] focus:outline-none focus:border-[#52130C] transition-all placeholder:text-[#1F1E1C]/40"
            placeholder="First Name"
          />
        </div>

        <div className="flex flex-col gap-2 mb-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-b border-[#1F1E1C]/20 rounded-none px-0 py-2 text-[#1F1E1C] focus:outline-none focus:border-[#52130C] transition-all placeholder:text-[#1F1E1C]/40"
            placeholder="Email Address"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer group mb-2">
          <div className={`mt-0.5 w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-colors ${optIn ? 'bg-[#52130C] border-[#52130C]' : 'border-[#1F1E1C]/30 group-hover:border-[#52130C]'}`}>
            {optIn && <Check className="w-3 h-3 text-[#F0EDE4]" />}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
          />
          <span className="text-xs text-[#1F1E1C]/60 leading-relaxed">
            I agree to receive emails from Contrarian Thinking. You can unsubscribe at any time.
          </span>
        </label>

        <button
          type="submit"
          disabled={!firstName || !email}
          className="group relative w-full bg-[#1F1E1C] hover:bg-[#52130C] disabled:opacity-50 disabled:cursor-not-allowed text-[#F0EDE4] font-medium py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300"
          data-testid="button-start-quiz"
        >
          <span className="tracking-wide text-sm uppercase font-bold">Start the Assessment</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </form>

      <div className="py-6 border-y border-[#1F1E1C]/15">
        <p className="text-[#1F1E1C]/80 leading-relaxed font-sans text-sm">
          <strong className="text-[#1F1E1C] font-semibold">15 questions. Instant results.</strong> Used by the community to help owners and acquirers understand exactly where they are and what to do next.
        </p>
      </div>
    </div>
  );
}
