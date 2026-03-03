import { useQuizStore } from "@/store/useQuizStore";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const startQuiz = useQuizStore((state) => state.startQuiz);

  return (
    <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-16 h-16 bg-[#52130C]/10 rounded-full flex items-center justify-center mb-8 border border-[#52130C]/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#52130C]">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display leading-tight text-[#1F1E1C]">
        The Business Ownership <span className="text-[#52130C] block mt-1">Blueprint</span>
      </h1>
      
      <p className="text-xl text-[#713718] mb-8 font-light italic font-serif">
        Discover exactly where you stand — and what to do next.
      </p>
      
      <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 mb-10 text-left shadow-sm">
        <p className="text-[#1F1E1C]/80 leading-relaxed text-sm md:text-base">
          15 questions. Instant results. Used by the Contrarian Thinking community to help owners and acquirers understand exactly where they are and what to do next.
        </p>
      </div>

      <button
        onClick={startQuiz}
        className="w-full bg-[#52130C] hover:bg-[#713718] text-[#F0EDE4] font-semibold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#52130C]/20"
        data-testid="button-start-quiz"
      >
        Get Your Blueprint
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
