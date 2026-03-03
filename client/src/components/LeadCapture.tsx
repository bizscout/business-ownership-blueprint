import { useState } from "react";
import { useQuizStore } from "@/store/useQuizStore";
import { Loader2 } from "lucide-react";

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
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 font-display text-[#1F1E1C]">
          Your Blueprint is ready.
        </h2>
        <p className="text-[#713718]">
          Enter your info below to see your results and get the full report sent to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm font-medium text-[#1F1E1C]/80">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-white border border-[#E5E0D8] rounded-lg px-4 py-3 text-[#1F1E1C] focus:outline-none focus:ring-2 focus:ring-[#52130C] focus:border-transparent transition-all shadow-sm"
            placeholder="Jane"
          />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="email" className="text-sm font-medium text-[#1F1E1C]/80">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border border-[#E5E0D8] rounded-lg px-4 py-3 text-[#1F1E1C] focus:outline-none focus:ring-2 focus:ring-[#52130C] focus:border-transparent transition-all shadow-sm"
            placeholder="jane@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !firstName || !email}
          className="w-full bg-[#52130C] hover:bg-[#713718] text-[#F0EDE4] font-semibold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-md shadow-[#52130C]/20"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating your Blueprint...
            </>
          ) : (
            "See My Results"
          )}
        </button>
        <p className="text-center text-xs text-[#713718] mt-2 font-medium">
          No spam. Just your report.
        </p>
      </form>
    </div>
  );
}
