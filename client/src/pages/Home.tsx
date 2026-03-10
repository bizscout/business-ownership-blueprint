import { useQuizStore } from "@/store/useQuizStore";
import LandingPage from "@/components/LandingPage";
import GatingScreen from "@/components/GatingScreen";
import QuizScreen from "@/components/QuizScreen";
import LeadCapture from "@/components/LeadCapture";
import ResultsPage from "@/components/ResultsPage";

export default function Home() {
  const step = useQuizStore((state) => state.step);

  return (
    <main className="min-h-screen bg-[#F0EDE4] text-[#1F1E1C] flex flex-col px-3 py-6 md:p-12 selection:bg-[#52130C]/20 relative overflow-hidden">
      {/* Subtle noise texture overlay for editorial feel */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {step === 'results' ? (
        <div className="w-full max-w-4xl mx-auto my-auto relative z-10">
          <ResultsPage />
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto my-auto relative z-10">
          {step === 'landing' && <LandingPage />}
          {step === 'gating' && <GatingScreen />}
          {step === 'quiz' && <QuizScreen />}
          {step === 'lead' && <LeadCapture />}
        </div>
      )}
    </main>
  );
}
