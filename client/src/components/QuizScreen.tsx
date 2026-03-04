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
    // Deliberately hold the selected score for a moment after transitioning 
    // to the new question to create the "lingering" micro-interaction across pages,
    // but keep it crisp so it doesn't stay too long.
    const timer = setTimeout(() => {
      setSelectedScore(null);
    }, 150);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex]);

  const handleSelect = (score: number) => {
    if (selectedScore !== null) return; // Prevent double clicking
    setSelectedScore(score);
    
    // Hold briefly to show the selection before sliding to the next question
    setTimeout(() => {
      answerQuestion(score);
    }, 350);
  };

  if (!question) return null;

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-[0.98] duration-300">
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
              className={`text-left p-5 md:p-6 transition-all duration-150 border ${
                isSelected 
                  ? "bg-[#52130C] border-[#52130C] text-[#F0EDE4] shadow-lg shadow-[#52130C]/20" 
                  : "bg-transparent border-[#1F1E1C]/20 text-[#1F1E1C]/90 hover:border-[#52130C] hover:bg-[#52130C]/5"
              }`}
              data-testid={`button-option-${idx}`}
            >
              <span className="flex items-start gap-5">
                <span className={`flex-shrink-0 w-6 h-6 mt-0.5 border flex items-center justify-center text-xs font-serif transition-colors duration-75 ${
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
