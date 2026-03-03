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
    setSelectedScore(score);
    // Auto-advance after 400ms delay
    setTimeout(() => {
      answerQuestion(score);
    }, 400);
  };

  if (!question) return null;

  return (
    <div className="w-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Progress Bar */}
      <div className="w-full bg-[#222] h-1.5 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-teal-500 h-full transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-sm text-teal-400 font-medium mb-4 tracking-wider uppercase">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-8 font-display leading-snug">
        {question.text}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedScore === option.score;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(option.score)}
              className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                isSelected 
                  ? "bg-teal-500/10 border-teal-500 text-white" 
                  : "bg-[#161616] border-[#2a2a2a] text-gray-300 hover:border-gray-500 hover:bg-[#222]"
              }`}
              data-testid={`button-option-${idx}`}
            >
              <span className="flex items-center gap-4">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                  isSelected ? "border-teal-500 text-teal-500" : "border-gray-600 text-gray-500"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
