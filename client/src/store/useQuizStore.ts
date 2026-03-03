import { create } from 'zustand';

type QuizState = {
  step: 'landing' | 'quiz' | 'lead' | 'results';
  currentQuestionIndex: number;
  answers: number[];
  userData: { firstName: string; email: string } | null;
  startQuiz: () => void;
  answerQuestion: (score: number) => void;
  submitLead: (firstName: string, email: string) => void;
  reset: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  step: 'landing',
  currentQuestionIndex: 0,
  answers: [],
  userData: null,
  startQuiz: () => set({ step: 'quiz', currentQuestionIndex: 0, answers: [] }),
  answerQuestion: (score) => set((state) => {
    const newAnswers = [...state.answers, score];
    if (newAnswers.length === 15) {
      return { answers: newAnswers, step: 'lead' };
    }
    return { answers: newAnswers, currentQuestionIndex: state.currentQuestionIndex + 1 };
  }),
  submitLead: (firstName, email) => set({ userData: { firstName, email }, step: 'results' }),
  reset: () => set({ step: 'landing', currentQuestionIndex: 0, answers: [], userData: null })
}));
