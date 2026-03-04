import { useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { MoveRight } from "lucide-react";

export default function GatingScreen() {
  const submitGating = useQuizStore((state) => state.submitGating);
  
  const [ownsBusiness, setOwnsBusiness] = useState<boolean | null>(null);
  const [revenueRange, setRevenueRange] = useState<string | null>(null);

  const REVENUE_RANGES = [
    "$0 - $250k",
    "$250k - $1M",
    "$1M - $5M",
    "$5M+"
  ];

  const handleContinue = () => {
    if (ownsBusiness === null) return;
    if (ownsBusiness === true && revenueRange === null) return;
    
    submitGating(ownsBusiness, revenueRange);
  };

  const isContinueEnabled = ownsBusiness === false || (ownsBusiness === true && revenueRange !== null);

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
      
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-display mb-8 leading-snug text-[#1F1E1C]">
          Do you currently own a cash-flowing business?
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={() => {
              setOwnsBusiness(true);
            }}
            className={`flex-1 p-5 md:p-6 text-center transition-all duration-150 border font-serif ${
              ownsBusiness === true 
                ? "bg-[#52130C] border-[#52130C] text-[#F0EDE4] shadow-lg shadow-[#52130C]/20" 
                : "bg-transparent border-[#1F1E1C]/20 text-[#1F1E1C]/90 hover:border-[#52130C] hover:bg-[#52130C]/5"
            }`}
            data-testid="button-gating-yes"
          >
            Yes, I do
          </button>
          
          <button
            onClick={() => {
              setOwnsBusiness(false);
              setRevenueRange(null);
            }}
            className={`flex-1 p-5 md:p-6 text-center transition-all duration-150 border font-serif ${
              ownsBusiness === false 
                ? "bg-[#52130C] border-[#52130C] text-[#F0EDE4] shadow-lg shadow-[#52130C]/20" 
                : "bg-transparent border-[#1F1E1C]/20 text-[#1F1E1C]/90 hover:border-[#52130C] hover:bg-[#52130C]/5"
            }`}
            data-testid="button-gating-no"
          >
            No, not yet
          </button>
        </div>
      </div>

      <div className={`transition-all duration-500 overflow-hidden ${ownsBusiness === true ? 'max-h-[500px] opacity-100 mb-10' : 'max-h-0 opacity-0'}`}>
        <h3 className="text-2xl font-display mb-6 text-[#1F1E1C]">
          What is your estimated annual revenue?
        </h3>
        <div className="flex flex-col gap-3">
          {REVENUE_RANGES.map((range, idx) => {
            const isSelected = revenueRange === range;
            return (
              <button
                key={idx}
                onClick={() => setRevenueRange(range)}
                className={`text-left p-4 md:p-5 transition-all duration-150 border ${
                  isSelected 
                    ? "bg-[#52130C] border-[#52130C] text-[#F0EDE4] shadow-lg shadow-[#52130C]/20" 
                    : "bg-transparent border-[#1F1E1C]/20 text-[#1F1E1C]/90 hover:border-[#52130C] hover:bg-[#52130C]/5"
                }`}
                data-testid={`button-revenue-${idx}`}
              >
                <span className="leading-relaxed text-sm md:text-base font-serif">
                  {range}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`transition-all duration-500 ${ownsBusiness !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={handleContinue}
          disabled={!isContinueEnabled}
          className={`w-full group bg-[#52130C] text-white py-5 px-8 flex items-center justify-between transition-all duration-300 ${
            !isContinueEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1F1E1C] hover:shadow-xl hover:shadow-[#1F1E1C]/10'
          }`}
          data-testid="button-continue-gating"
        >
          <span className="tracking-[0.2em] text-xs font-bold uppercase">Begin the Blueprint</span>
          <MoveRight className={`w-5 h-5 transition-transform duration-300 ${isContinueEnabled ? 'group-hover:translate-x-2' : ''}`} />
        </button>
      </div>

    </div>
  );
}