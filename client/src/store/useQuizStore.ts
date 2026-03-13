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
  step: 'landing' | 'gating' | 'quiz' | 'results';
  currentQuestionIndex: number;
  answers: number[];
  userData: { firstName: string; email: string } | null;
  gatingData: { ownsBusiness: boolean; revenueRange: string | null } | null;
  serverResults: ServerResults | null;
  submitError: string | null;
  submitLanding: (firstName: string, email: string) => void;
  submitGating: (ownsBusiness: boolean, revenueRange: string | null) => void;
  answerQuestion: (score: number) => void;
  submitToServer: () => Promise<void>;
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
  submitLanding: (firstName, email) => set({ userData: { firstName, email }, step: 'gating' }),
  submitGating: (ownsBusiness, revenueRange) => set({ gatingData: { ownsBusiness, revenueRange }, step: 'quiz', currentQuestionIndex: 0, answers: [] }),
  answerQuestion: (score) => {
    const state = get();
    const newAnswers = [...state.answers, score];
    if (newAnswers.length === 15) {
      set({ answers: newAnswers, step: 'results' });
      // Fire server submission in background after transitioning to results
      setTimeout(() => get().submitToServer(), 0);
    } else {
      set({ answers: newAnswers, currentQuestionIndex: state.currentQuestionIndex + 1 });
    }
  },
  submitToServer: async () => {
    const state = get();
    if (!state.userData || !state.gatingData) return;

    const payload = {
      firstName: state.userData.firstName,
      email: state.userData.email,
      ownsBusiness: state.gatingData.ownsBusiness,
      revenueRange: state.gatingData.revenueRange,
      answers: state.answers,
    };

    try {
      const response = await apiRequest("POST", "/api/quiz/submit", payload);
      const result = await response.json();
      set({ serverResults: result });
    } catch (err: any) {
      set({ submitError: err.message });
    }
  },
  setEmailStatus: (sent: boolean, error: string | null) => set((state) => ({
    serverResults: state.serverResults
      ? { ...state.serverResults, emailSent: sent, emailError: error }
      : null,
  })),
  reset: () => set({ step: 'landing', currentQuestionIndex: 0, answers: [], userData: null, gatingData: null, serverResults: null, submitError: null }),
}));
