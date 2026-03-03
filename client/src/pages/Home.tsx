import { useQuizStore } from "@/store/useQuizStore";
import LandingPage from "@/components/LandingPage";
import QuizScreen from "@/components/QuizScreen";
import LeadCapture from "@/components/LeadCapture";
import ResultsPage from "@/components/ResultsPage";

export default function Home() {
  const step = useQuizStore((state) => state.step);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4 selection:bg-teal-500/30">
      <div className="w-full max-w-md mx-auto">
        {step === 'landing' && <LandingPage />}
        {step === 'quiz' && <QuizScreen />}
        {step === 'lead' && <LeadCapture />}
        {step === 'results' && <ResultsPage />}
      </div>
    </main>
  );
}
