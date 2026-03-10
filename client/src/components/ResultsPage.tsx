import { useMemo, useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { calculateAxisScores, calculateArchetypes, getScoreRange } from "@/lib/scoring";
import { apiRequest } from "@/lib/queryClient";
import SpiderChart from "./SpiderChart";
import contentData from "@/data/content.json";
import { ArrowRight, MoveRight, AlertCircle, RefreshCw, CheckCircle, Loader2 } from "lucide-react";

export default function ResultsPage() {
  const { answers, userData, gatingData, serverResults, setEmailStatus } = useQuizStore();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryEmail = async () => {
    if (!userData || !serverResults) return;
    setIsRetrying(true);
    try {
      await apiRequest("POST", "/api/quiz/resend-email", {
        firstName: userData.firstName,
        email: userData.email,
        primaryArchetype: serverResults.primaryArchetype,
        axisScores: serverResults.axisScores,
        ctaRoute: serverResults.ctaRoute,
      });
      setEmailStatus(true, null);
    } catch {
      setEmailStatus(false, "Failed to send email. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  const results = useMemo(() => {
    const axes = calculateAxisScores(answers);
    const archetypeScores = calculateArchetypes(axes);
    
    // Sort archetypes
    const sortedArchetypes = Object.entries(archetypeScores)
      .sort(([, a], [, b]) => b - a);
      
    const primaryArchetype = sortedArchetypes[0][0];
    const secondaryArchetype = sortedArchetypes[1][0];

    // Seed logic: simple sum to deterministically pick variations
    const seed = answers.reduce((a, b) => a + b, 0);

    const getVariation = (arr: any[]) => arr[seed % arr.length];

    const parsedContent = contentData as any;
    
    const axisContent = {
      DI: getVariation(parsedContent.axes.DI[getScoreRange(axes.DI)]),
      OD: getVariation(parsedContent.axes.OD[getScoreRange(axes.OD)]),
      CR: getVariation(parsedContent.axes.CR[getScoreRange(axes.CR)]),
      RT: getVariation(parsedContent.axes.RT[getScoreRange(axes.RT)]),
      SV: getVariation(parsedContent.axes.SV[getScoreRange(axes.SV)])
    };

    const archetypeSummary = getVariation(parsedContent.archetypes[primaryArchetype]);

    const ctaRoute = gatingData?.ownsBusiness ? 'boardroom' : 'academy';

    return { axes, primaryArchetype, secondaryArchetype, axisContent, archetypeSummary, ctaRoute };
  }, [answers, gatingData]);

  const { axes, primaryArchetype, axisContent, archetypeSummary, ctaRoute } = results;

  const archetypeDescriptors: Record<string, string> = {
    Acquirer: "You're wired for deals. You think from the deal side first.",
    Operator: "You want to own a business and actually run it. Not from a spreadsheet — in it.",
    Builder: "You're focused on making a business bigger, better, and less dependent on you.",
    Architect: "You think in systems, playing a long game to generate lasting wealth."
  };

  return (
    <div className="py-12 pb-24 animate-in fade-in duration-1000 px-4 md:px-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-16 justify-center">
        <div className="h-[1px] w-8 bg-[#52130C]"></div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#52130C]">Blueprint Results</span>
        <div className="h-[1px] w-8 bg-[#52130C]"></div>
      </div>

      {/* Hero Section */}
      <div className="mb-20 text-center">
        <h1 className="text-xl md:text-2xl text-[#1F1E1C]/60 font-serif italic mb-4">Prepared for {userData?.firstName}</h1>
        <h2 className="text-5xl md:text-7xl font-display mb-6 text-[#1F1E1C] leading-none">
          The <span className="italic text-[#52130C]">{primaryArchetype}</span>
        </h2>
        <p className="text-lg md:text-xl text-[#1F1E1C]/80 font-light max-w-2xl mx-auto leading-relaxed">
          {archetypeDescriptors[primaryArchetype]}
        </p>

        <div className="mt-16 mb-12 max-w-lg mx-auto bg-white p-6 md:p-10 border border-[#E5E0D8] shadow-2xl shadow-[#52130C]/5">
          <SpiderChart axes={axes} />
          <p className="text-[10px] uppercase tracking-widest text-[#1F1E1C]/40 mt-8 font-bold">Your Shape tells the story.</p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#1F1E1C]/10 my-16"></div>

      {/* Blueprint Summary */}
      <div className="mb-20 max-w-3xl mx-auto space-y-16">
        <div className="text-center">
          <h3 className="text-3xl md:text-4xl font-display text-[#1F1E1C] mb-4 leading-tight">Your Strategic <span className="italic text-[#52130C]">Summary</span></h3>
          <div className="w-12 h-1 bg-[#52130C] mx-auto mb-4"></div>
          <p className="text-[#1F1E1C]/50 text-sm">
            Based on your 15-point assessment
          </p>
        </div>

        <div className="text-lg md:text-xl leading-relaxed text-[#1F1E1C]/90 font-serif">
          {archetypeSummary.narrative}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="bg-white border border-[#E5E0D8] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#52130C]"></div>
            <h4 className="font-bold text-[#1F1E1C] text-sm uppercase tracking-widest mb-4">
              Biggest Opportunity
            </h4>
            <p className="text-[#1F1E1C]/80 leading-relaxed text-sm">{archetypeSummary.opportunity}</p>
          </div>

          <div className="bg-white border border-[#E5E0D8] p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#1F1E1C]"></div>
            <h4 className="font-bold text-[#1F1E1C] text-sm uppercase tracking-widest mb-4">
              Most Common Mistake
            </h4>
            <p className="text-[#1F1E1C]/80 leading-relaxed text-sm">{archetypeSummary.mistake}</p>
          </div>
        </div>

        <div className="bg-[#1F1E1C] text-[#F0EDE4] p-8 md:p-10">
          <h4 className="font-display text-2xl text-white mb-4">Your 90-Day Focus</h4>
          <p className="text-[#F0EDE4]/80 leading-relaxed text-lg font-light">{archetypeSummary.focus}</p>
        </div>

        <div className="py-8 px-6 border-y border-[#1F1E1C]/10 text-center">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#52130C] mb-6">One Question to Sit With</h4>
          <p className="text-2xl md:text-3xl font-display italic text-[#1F1E1C] leading-snug">
            "{archetypeSummary.question}"
          </p>
        </div>
      </div>

      <div className="h-[1px] w-full bg-[#1F1E1C]/10 my-16"></div>

      {/* Axis Breakdown */}
      <div className="mb-20">
        <h3 className="text-3xl md:text-4xl font-display text-center text-[#1F1E1C] mb-16">The Five <span className="italic text-[#52130C]">Dimensions</span></h3>
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-16">
          {Object.entries(axes).map(([axis, score]) => {
            const names: Record<string, string> = { DI: 'Deal Instinct', OD: 'Operator Depth', CR: 'Capital Readiness', RT: 'Risk Tolerance', SV: 'Strategic Vision' };
            const content = axisContent[axis as keyof typeof axisContent];
            
            return (
              <div key={axis} className="flex flex-col">
                <div className="flex justify-between items-baseline mb-4">
                  <h4 className="font-bold text-xl text-[#1F1E1C]">{names[axis]}</h4>
                  <div className="text-2xl font-display italic text-[#52130C]">{score.toFixed(1)}</div>
                </div>
                <div className="w-full bg-[#1F1E1C]/10 h-[1px] mb-6">
                  <div className="bg-[#52130C] h-[2px] -mt-[0.5px]" style={{ width: `${(score / 10) * 100}%` }} />
                </div>
                <p className="text-[#1F1E1C]/70 leading-relaxed font-serif">{content}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center max-w-3xl mx-auto px-6 py-16 bg-white border border-[#E5E0D8] shadow-2xl shadow-[#52130C]/5">
        <h4 className="text-3xl md:text-4xl font-display mb-6 text-[#1F1E1C]">The Next Step</h4>
        <p className="text-lg text-[#1F1E1C]/70 mb-10 max-w-xl mx-auto font-serif">
          {ctaRoute === 'academy'
            ? "This is exactly the kind of work we go deep on inside the Academy — the deal process, the evaluation framework, the community of people actively closing."
            : "BoardRoom was built for owners at your stage. Real advisors. Real peers. The board of directors your business deserves but has probably never had."}
        </p>
        <a
          href={ctaRoute === 'academy' ? import.meta.env.VITE_ACADEMY_URL : import.meta.env.VITE_BOARDROOM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-[#52130C] hover:bg-[#1F1E1C] text-white py-4 px-10 inline-flex items-center justify-center gap-4 transition-all duration-300 mx-auto"
        >
          <span className="tracking-widest text-xs uppercase font-bold">
            {ctaRoute === 'academy' ? "Explore Academy" : "Explore BoardRoom"}
          </span>
          <MoveRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
        </a>
      </div>

      {serverResults?.emailSent ? (
        <p className="text-center text-[10px] uppercase tracking-widest text-[#1F1E1C]/40 mt-16 font-bold flex items-center justify-center gap-2">
          <CheckCircle className="w-3 h-3" />
          Your full report has been sent to {userData?.email}.
        </p>
      ) : serverResults?.emailError ? (
        <div className="mt-16 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs uppercase tracking-widest font-bold">
              We couldn't send your report to {userData?.email}.
            </p>
          </div>
          <button
            onClick={handleRetryEmail}
            disabled={isRetrying}
            className="flex items-center gap-2 text-[#52130C] hover:text-[#1F1E1C] text-xs uppercase tracking-widest font-bold transition-colors disabled:opacity-50"
          >
            {isRetrying ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {isRetrying ? "Sending..." : "Retry sending email"}
          </button>
        </div>
      ) : (
        <p className="text-center text-[10px] uppercase tracking-widest text-[#1F1E1C]/40 mt-16 font-bold">
          Your full report has been sent to {userData?.email}.
        </p>
      )}
    </div>
  );
}
