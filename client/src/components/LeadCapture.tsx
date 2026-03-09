import { useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Loader2, ArrowRight } from "lucide-react";

export default function LeadCapture() {
  const submitLead = useQuizStore((state) => state.submitLead);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email) return;
    
    setIsSubmitting(true);
    // Simulate loading for report generation
    setTimeout(() => {
      submitLead(firstName, email);
    }, 1500);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-lg mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-display mb-4 text-[#1F1E1C] leading-tight">
          Drop your email <br/>
          <span className="italic font-light text-[#52130C]">to see your results.</span>
        </h2>
        <p className="text-lg text-[#1F1E1C]/70 font-serif">
          Enter your details below to instantly view your custom blueprint and get the full strategic report sent to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-xs font-bold tracking-widest uppercase text-[#1F1E1C]/60">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-transparent border-b border-[#1F1E1C]/20 rounded-none px-0 py-3 text-[#1F1E1C] text-lg focus:outline-none focus:border-[#52130C] transition-all placeholder:text-[#1F1E1C]/30"
            placeholder="Your first name"
          />
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <label htmlFor="email" className="text-xs font-bold tracking-widest uppercase text-[#1F1E1C]/60">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border-b border-[#1F1E1C]/20 rounded-none px-0 py-3 text-[#1F1E1C] text-lg focus:outline-none focus:border-[#52130C] transition-all placeholder:text-[#1F1E1C]/30"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !firstName || !email}
          className="group w-full bg-[#1F1E1C] hover:bg-[#52130C] text-[#F0EDE4] font-medium py-5 px-8 flex items-center justify-center gap-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#52130C]/10"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="tracking-wide text-sm uppercase font-bold">Generating...</span>
            </>
          ) : (
            <>
              <span className="tracking-wide text-sm uppercase font-bold">See My Results</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
        <p className="text-center text-xs text-[#1F1E1C]/50 mt-2 uppercase tracking-widest font-medium">
          No spam. Just your report.
        </p>
      </form>
    </div>
  );
}
