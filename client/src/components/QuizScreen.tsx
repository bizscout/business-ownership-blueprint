import { useState, useEffect } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { questions } from "@/data/questions";

export default function QuizScreen() {
  const currentQuestionIndex = useQuizStore((state) => state.currentQuestionIndex);
  const answerQuestion = useQuizStore((state) => state.answerQuestion);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  const question = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  useEffect(() => {
    setSelectedScore(null);
  }, [currentQuestionIndex]);

  const handleSelect = (score: number) => {
    if (selectedScore !== null) return; // Prevent double-tap
    setSelectedScore(score);
    setTimeout(() => {
      answerQuestion(score);
    }, 400);
  };

  if (!question) return null;

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-full bg-[#1F1E1C]/10 h-[2px] overflow-hidden">
          <div 
            className="bg-[#52130C] h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-[#1F1E1C]/50 font-medium tracking-widest uppercase whitespace-nowrap">
          {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <h2 className="text-3xl md:text-4xl font-display mb-10 leading-snug text-[#1F1E1C]">
        {question.text}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedScore === option.score;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(option.score)}
              className={`text-left p-5 md:p-6 transition-all duration-300 border ${
                isSelected 
                  ? "bg-[#52130C] border-[#52130C] text-[#F0EDE4] shadow-lg shadow-[#52130C]/20" 
                  : "bg-transparent border-[#1F1E1C]/20 text-[#1F1E1C]/90 hover:border-[#52130C] hover:bg-[#52130C]/5"
              }`}
              data-testid={`button-option-${idx}`}
            >
              <span className="flex items-start gap-5">
                <span className={`flex-shrink-0 w-6 h-6 mt-0.5 border flex items-center justify-center text-xs font-serif ${
                  isSelected ? "border-[#F0EDE4] text-[#F0EDE4]" : "border-[#1F1E1C]/30 text-[#1F1E1C]/50"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed text-sm md:text-base">
                  {option.text}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}