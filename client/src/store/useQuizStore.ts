import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';

type ServerResults = {
  axisScores: { DI: number; OD: number; CR: number; RT: number; SV: number };
  primaryArchetype: string;
  ctaRoute: string;
  emailSent: boolean;
  emailError: string | null;
};

type QuizState = {
  step: 'landing' | 'gating' | 'quiz' | 'lead' | 'results';
  currentQuestionIndex: number;
  answers: number[];
  userData: { firstName: string; email: string } | null;
  gatingData: { ownsBusiness: boolean; revenueRange: string | null } | null;
  serverResults: ServerResults | null;
  submitError: string | null;
  startGating: () => void;
  submitGating: (ownsBusiness: boolean, revenueRange: string | null) => void;
  startQuiz: () => void;
  answerQuestion: (score: number) => void;
  submitLead: (firstName: string, email: string) => Promise<void>;
  setEmailStatus: (sent: boolean, error: string | null) => void;
  reset: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  step: 'landing',
  currentQuestionIndex: 0,
  answers: [],
  userData: null,
  gatingData: null,
  serverResults: null,
  submitError: null,
  startGating: () => set({ step: 'gating' }),
  submitGating: (ownsBusiness, revenueRange) => set({ gatingData: { ownsBusiness, revenueRange }, step: 'quiz', currentQuestionIndex: 0, answers: [] }),
  startQuiz: () => set({ step: 'quiz', currentQuestionIndex: 0, answers: [] }),
  answerQuestion: (score) => set((state) => {
    const newAnswers = [...state.answers, score];
    if (newAnswers.length === 15) {
      return { answers: newAnswers, step: 'lead' };
    }
    return { answers: newAnswers, currentQuestionIndex: state.currentQuestionIndex + 1 };
  }),
  submitLead: async (firstName: string, email: string) => {
    const state = get();
    set({ submitError: null });

    const response = await apiRequest("POST", "/api/quiz/submit", {
      firstName,
      email,
      ownsBusiness: state.gatingData?.ownsBusiness ?? false,
      revenueRange: state.gatingData?.revenueRange ?? null,
      answers: state.answers,
    });

    const result = await response.json();

    set({
      userData: { firstName, email },
      serverResults: result,
      step: 'results',
    });
  },
  setEmailStatus: (sent: boolean, error: string | null) => set((state) => ({
    serverResults: state.serverResults
      ? { ...state.serverResults, emailSent: sent, emailError: error }
      : null,
  })),
  reset: () => set({ step: 'landing', currentQuestionIndex: 0, answers: [], userData: null, gatingData: null, serverResults: null, submitError: null }),
}));
