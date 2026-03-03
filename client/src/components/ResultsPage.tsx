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
        <h1 className="text-xl text-gray-400 font-medium mb-2">Hi {userData?.firstName},</h1>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-teal-400 mb-4">
          You're The {primaryArchetype}
        </h2>
        <p className="text-lg text-gray-300 font-light italic mb-10 max-w-md mx-auto">
          {archetypeDescriptors[primaryArchetype]}
        </p>

        <div className="mb-6 max-w-md mx-auto">
          <SpiderChart axes={axes} />
          <p className="text-xs text-gray-500 mt-4 italic">No two profiles look the same. Your shape tells the story.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8 max-w-xl mx-auto text-sm">
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a]"><div className="text-gray-400 text-xs mb-1">Deal Instinct</div><div className="font-bold">{axes.DI.toFixed(1)}</div></div>
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a]"><div className="text-gray-400 text-xs mb-1">Operator Depth</div><div className="font-bold">{axes.OD.toFixed(1)}</div></div>
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a]"><div className="text-gray-400 text-xs mb-1">Capital Readiness</div><div className="font-bold">{axes.CR.toFixed(1)}</div></div>
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a]"><div className="text-gray-400 text-xs mb-1">Risk Tolerance</div><div className="font-bold">{axes.RT.toFixed(1)}</div></div>
          <div className="bg-[#161616] p-3 rounded-lg border border-[#2a2a2a] col-span-2 md:col-span-1"><div className="text-gray-400 text-xs mb-1">Strategic Vision</div><div className="font-bold">{axes.SV.toFixed(1)}</div></div>
        </div>
      </div>

      <hr className="border-[#222] my-12" />

      {/* Axis Breakdown */}
      <h3 className="text-2xl font-display font-bold mb-6">Your Five Dimensions</h3>
      <div className="space-y-6 mb-12">
        {Object.entries(axes).map(([axis, score]) => {
          const names: Record<string, string> = { DI: 'Deal Instinct', OD: 'Operator Depth', CR: 'Capital Readiness', RT: 'Risk Tolerance', SV: 'Strategic Vision' };
          const content = axisContent[axis as keyof typeof axisContent];
          
          return (
            <div key={axis} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 md:p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg">{names[axis]}</h4>
                <div className="text-teal-400 font-mono font-bold bg-teal-500/10 px-3 py-1 rounded-md">{score.toFixed(1)} / 10</div>
              </div>
              <div className="w-full bg-[#222] h-1.5 rounded-full mb-4">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(score / 10) * 100}%` }} />
              </div>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">{content}</p>
            </div>
          );
        })}
      </div>

      <hr className="border-[#222] my-12" />

      {/* Blueprint Summary */}
      <h3 className="text-2xl font-display font-bold mb-6">Your Blueprint</h3>
      
      <div className="prose prose-invert max-w-none mb-8">
        <p className="text-lg leading-relaxed text-gray-200">{archetypeSummary.narrative}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3 text-teal-400">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="font-bold">Biggest Opportunity</h4>
          </div>
          <p className="text-sm text-gray-300">{archetypeSummary.opportunity}</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-bold">Most Common Mistake</h4>
          </div>
          <p className="text-sm text-gray-300">{archetypeSummary.mistake}</p>
        </div>
      </div>

      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-3 text-white">
          <Target className="w-5 h-5" />
          <h4 className="font-bold text-lg">Your 90-Day Focus</h4>
        </div>
        <p className="text-gray-300">{archetypeSummary.focus}</p>
      </div>

      <div className="border-l-4 border-teal-500 pl-6 py-2 mb-12">
        <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium">
          <HelpCircle className="w-4 h-4" />
          <span>One Question to Sit With</span>
        </div>
        <p className="text-xl font-serif italic text-white leading-relaxed">
          "{archetypeSummary.question}"
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-teal-900/40 to-[#0f0f0f] border border-teal-500/30 rounded-2xl p-8 text-center">
        <h4 className="text-2xl font-bold font-display mb-4">The Next Step</h4>
        <p className="text-gray-300 mb-6 max-w-md mx-auto">
          {['Acquirer', 'Operator'].includes(primaryArchetype) 
            ? "This is exactly the kind of work we go deep on inside the Academy — the deal process, the evaluation framework, the community of people actively closing."
            : "BoardRoom was built for owners at your stage. Real advisors. Real peers. The board of directors your business deserves but has probably never had."}
        </p>
        <button className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition-all hover:scale-105">
          Learn More <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-12">
        Your full report has been sent to {userData?.email}.
      </p>
    </div>
  );
}
