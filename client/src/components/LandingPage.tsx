import { useQuizStore } from "@/store/useQuizStore";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const startGating = useQuizStore((state) => state.startGating);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full max-w-lg mx-auto md:mx-0">
      {/* Eyebrow / Brand label */}
      <div className="flex items-center gap-4 mb-12">
        <div className="h-[1px] w-12 bg-[#52130C]"></div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#52130C]">Contrarian Thinking</span>
      </div>

      <h1 className="text-5xl md:text-7xl font-display font-semibold mb-6 text-[#1F1E1C] leading-[1.05] tracking-tight">
        The Business<br />
        Ownership<br />
        <span className="italic font-light text-[#52130C]">Blueprint</span>
      </h1>
      
      <p className="text-xl md:text-2xl text-[#1F1E1C]/70 mb-12 font-serif italic leading-relaxed">
        Discover exactly where you stand — and what to do next.
      </p>
      
      <div className="py-8 border-y border-[#1F1E1C]/15 mb-12">
        <p className="text-[#1F1E1C]/80 leading-relaxed font-sans text-sm md:text-base">
          <strong className="text-[#1F1E1C] font-semibold">15 questions. Instant results.</strong> Used by the Contrarian Thinking community to help owners and acquirers understand exactly where they are and what to do next.
        </p>
      </div>

      <button
        onClick={startGating}
        className="group relative w-full sm:w-auto bg-[#1F1E1C] hover:bg-[#52130C] text-[#F0EDE4] font-medium py-5 px-8 flex items-center justify-between sm:justify-center gap-4 transition-all duration-300 shadow-xl shadow-[#52130C]/10"
        data-testid="button-start-quiz"
      >
        <span className="tracking-wide text-sm uppercase font-bold">Get Your Blueprint</span>
        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
    </div>
  );
}
