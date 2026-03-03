import { useMemo } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { calculateAxisScores, calculateArchetypes, getScoreRange } from "@/lib/scoring";
import SpiderChart from "./SpiderChart";
import contentData from "@/data/content.json";
import { ArrowRight, CheckCircle2, AlertTriangle, Target, HelpCircle } from "lucide-react";

export default function ResultsPage() {
  const { answers, userData } = useQuizStore();

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

    return { axes, primaryArchetype, secondaryArchetype, axisContent, archetypeSummary };
  }, [answers]);

  const { axes, primaryArchetype, axisContent, archetypeSummary } = results;

  const archetypeDescriptors: Record<string, string> = {
    Acquirer: "You're wired for deals. You think from the deal side first.",
    Operator: "You want to own a business and actually run it. Not from a spreadsheet — in it.",
    Builder: "You're focused on making a business bigger, better, and less dependent on you.",
    Architect: "You think in systems, playing a long game to generate lasting wealth."
  };

  return (
    <div className="py-8 pb-20 animate-in fade-in duration-700 w-[100vw] px-4 -ml-[calc(50vw-50%)] max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-xl text-[#713718] font-medium mb-2">Hi {userData?.firstName},</h1>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-[#52130C] mb-4">
          You're The {primaryArchetype}
        </h2>
        <p className="text-lg text-[#1F1E1C]/80 font-light italic mb-10 max-w-md mx-auto">
          {archetypeDescriptors[primaryArchetype]}
        </p>

        <div className="mb-6 max-w-md mx-auto">
          <SpiderChart axes={axes} />
          <p className="text-xs text-[#713718] mt-4 italic">No two profiles look the same. Your shape tells the story.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8 max-w-xl mx-auto text-sm">
          <div className="bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-sm"><div className="text-[#713718] text-xs mb-1">Deal Instinct</div><div className="font-bold text-[#1F1E1C]">{axes.DI.toFixed(1)}</div></div>
          <div className="bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-sm"><div className="text-[#713718] text-xs mb-1">Operator Depth</div><div className="font-bold text-[#1F1E1C]">{axes.OD.toFixed(1)}</div></div>
          <div className="bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-sm"><div className="text-[#713718] text-xs mb-1">Capital Readiness</div><div className="font-bold text-[#1F1E1C]">{axes.CR.toFixed(1)}</div></div>
          <div className="bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-sm"><div className="text-[#713718] text-xs mb-1">Risk Tolerance</div><div className="font-bold text-[#1F1E1C]">{axes.RT.toFixed(1)}</div></div>
          <div className="bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-sm col-span-2 md:col-span-1"><div className="text-[#713718] text-xs mb-1">Strategic Vision</div><div className="font-bold text-[#1F1E1C]">{axes.SV.toFixed(1)}</div></div>
        </div>
      </div>

      <hr className="border-[#E5E0D8] my-12" />

      {/* Axis Breakdown */}
      <h3 className="text-2xl font-display font-bold mb-6 text-[#1F1E1C]">Your Five Dimensions</h3>
      <div className="space-y-6 mb-12">
        {Object.entries(axes).map(([axis, score]) => {
          const names: Record<string, string> = { DI: 'Deal Instinct', OD: 'Operator Depth', CR: 'Capital Readiness', RT: 'Risk Tolerance', SV: 'Strategic Vision' };
          const content = axisContent[axis as keyof typeof axisContent];
          
          return (
            <div key={axis} className="bg-white border border-[#E5E0D8] rounded-xl p-5 md:p-6 relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg text-[#1F1E1C]">{names[axis]}</h4>
                <div className="text-[#52130C] font-mono font-bold bg-[#52130C]/10 px-3 py-1 rounded-md">{score.toFixed(1)} / 10</div>
              </div>
              <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full mb-4 overflow-hidden">
                <div className="bg-[#52130C] h-full rounded-full" style={{ width: `${(score / 10) * 100}%` }} />
              </div>
              <p className="text-[#1F1E1C]/80 text-sm md:text-base leading-relaxed">{content}</p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#E5E0D8] my-12" />

      {/* Blueprint Summary */}
      <h3 className="text-2xl font-display font-bold mb-6 text-[#1F1E1C]">Your Blueprint</h3>
      
      <div className="prose prose-slate max-w-none mb-8">
        <p className="text-lg leading-relaxed text-[#1F1E1C]/90">{archetypeSummary.narrative}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[#52130C]">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="font-bold">Biggest Opportunity</h4>
          </div>
          <p className="text-sm text-[#1F1E1C]/80">{archetypeSummary.opportunity}</p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[#B5605A]">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold">Most Common Mistake</h4>
          </div>
          <p className="text-sm text-[#1F1E1C]/80">{archetypeSummary.mistake}</p>
        </div>
      </div>

      <div className="bg-[#1F1E1C] border border-[#1F1E1C] rounded-xl p-6 mb-8 text-[#F0EDE4]">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-[#B5C0C3]" />
          <h4 className="font-bold text-lg text-white">Your 90-Day Focus</h4>
        </div>
        <p className="text-[#F0EDE4]/90">{archetypeSummary.focus}</p>
      </div>

      <div className="border-l-4 border-[#52130C] pl-6 py-2 mb-12">
        <div className="flex items-center gap-2 mb-2 text-[#713718] text-sm font-medium">
          <HelpCircle className="w-4 h-4" />
          <span>One Question to Sit With</span>
        </div>
        <p className="text-xl font-serif italic text-[#1F1E1C] leading-relaxed">
          "{archetypeSummary.question}"
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#52130C] to-[#713718] rounded-2xl p-8 text-center text-white shadow-xl">
        <h4 className="text-2xl font-bold font-display mb-4">The Next Step</h4>
        <p className="text-[#F0EDE4]/90 mb-6 max-w-md mx-auto">
          {['Acquirer', 'Operator'].includes(primaryArchetype) 
            ? "This is exactly the kind of work we go deep on inside the Academy — the deal process, the evaluation framework, the community of people actively closing."
            : "BoardRoom was built for owners at your stage. Real advisors. Real peers. The board of directors your business deserves but has probably never had."}
        </p>
        <button className="bg-[#F0EDE4] hover:bg-white text-[#52130C] font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-all hover:scale-105 shadow-md">
          Learn More <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-sm text-[#713718] mt-12 font-medium">
        Your full report has been sent to {userData?.email}.
      </p>
    </div>
  );
}
