# Replit Build Prompt: Business Ownership Blueprint Quiz

## What We're Building

A mobile-first quiz web app that takes a user through 15 questions, captures their email, scores their answers across 5 axes, assigns them a business ownership archetype, and delivers a personalized report with a spider chart and detailed written breakdown.

This will be used as a lead magnet — people access it via QR code at live events, take it on their phones in real time, and receive their report via email.

---

## Tech Stack

- **Frontend:** React (single page app, no routing needed beyond quiz flow)
- **Backend:** Node.js + Express
- **Email delivery:** Resend (resend.com) for transactional email — simple API, free tier covers this use case
- **PDF generation:** Puppeteer or html-pdf-node to render the report page as a PDF and attach to the email
- **Spider chart:** Chart.js with the radar chart type — render client-side on the results page, capture as image for PDF
- **Styling:** Tailwind CSS
- **No database required** — all scoring and report assembly happens server-side per request, stateless

---

## App Flow

```
Landing Page
    ↓
[Start Quiz Button]
    ↓
Question 1 of 15 (one question per screen, mobile card UI)
    ↓ (progress bar at top)
Question 15 of 15
    ↓
Lead Capture Screen (First Name + Email — required before results)
    ↓
Results Page (spider chart + archetype identity + "Full report sent to your email")
    ↓
[Background: generate PDF report + send via Resend]
```

---

## Landing Page

- Full screen mobile layout
- Headline: **"The Business Ownership Blueprint"**
- Subheadline: *"Discover exactly where you stand — and what to do next."*
- Brief description (2–3 lines): "15 questions. Instant results. Used by the Contrarian Thinking community to help owners and acquirers understand exactly where they are and what to do next."
- Single CTA button: **"Get Your Blueprint"**
- Clean, dark background. Professional but not corporate. Think Contrarian Thinking brand aesthetic — dark, bold, minimal.

---

## Quiz Screen (Questions 1–15)

- One question per screen
- Progress bar at top showing X of 15
- Question text large and readable on mobile
- Four answer options displayed as tappable cards (full width)
- Selected card highlights immediately
- "Next" button appears after selection (or auto-advance after 400ms delay — designer's call)
- No back button (keeps flow clean and prevents score gaming)
- Smooth slide transition between questions

**Question data structure:**

```javascript
const questions = [
  {
    id: 1,
    axis: "DI", // Deal Instinct
    text: "When you hear that a local business owner is thinking about selling, what's your first reaction?",
    options: [
      { text: "I feel bad for them — it probably means something went wrong.", score: 2 },
      { text: "I'm curious, but I wouldn't know where to start.", score: 4 },
      { text: "I want to know the numbers and understand why they're selling.", score: 7 },
      { text: "I'm already thinking about whether I should look at it myself.", score: 9 }
    ]
  },
  // ... (full question list in the attached markdown file)
]
```

All 15 questions and their answer/score mappings are in the attached markdown file. Import them exactly as written.

---

## Lead Capture Screen

Shown after question 15, before results.

- Headline: **"Your Blueprint is ready."**
- Subheadline: *"Enter your info below to see your results and get the full report sent to your inbox."*
- Fields:
  - First Name (required)
  - Email (required, validated)
- CTA Button: **"See My Results"**
- Small print below button: *"No spam. Just your report."*

On submit: show a brief loading state ("Generating your Blueprint...") while the backend scores, assembles the report, and queues the email. Then navigate to results page.

---

## Scoring Logic (Server-Side)

```javascript
// Axis scores: average of 3 question scores per axis
// Questions per axis:
//   Deal Instinct (DI): Q1, Q2, Q3
//   Operator Depth (OD): Q4, Q5, Q6
//   Capital Readiness (CR): Q7, Q8, Q9
//   Risk Tolerance (RT): Q10, Q11, Q12
//   Strategic Vision (SV): Q13, Q14, Q15

function calculateAxisScores(answers) {
  const axes = {
    DI: average([answers[0], answers[1], answers[2]]),
    OD: average([answers[3], answers[4], answers[5]]),
    CR: average([answers[6], answers[7], answers[8]]),
    RT: average([answers[9], answers[10], answers[11]]),
    SV: average([answers[12], answers[13], answers[14]])
  };
  return axes;
}

// Score ranges for text variation selection:
// Low: 1.0 – 3.5
// Medium: 3.6 – 6.5
// High: 6.6 – 10.0

// Archetype weighted formulas:
function calculateArchetypes(axes) {
  return {
    Acquirer:  (axes.DI * 0.40) + (axes.SV * 0.35) + (axes.RT * 0.25),
    Operator:  (axes.OD * 0.40) + (axes.DI * 0.35) + (axes.RT * 0.25),
    Builder:   (axes.OD * 0.40) + (axes.SV * 0.35) + (axes.CR * 0.25),
    Architect: (axes.SV * 0.40) + (axes.CR * 0.35) + (axes.OD * 0.25)
  };
}

// Primary archetype = highest weighted score
// Secondary archetype = second highest weighted score
// Both are used in report assembly (see markdown doc for logic)
```

---

## Text Variation Selection Logic

All text variations are in the attached markdown file (Section 7 for axis subsections, Section 8 for archetype summaries).

```javascript
function getScoreRange(score) {
  if (score <= 3.5) return "LOW";
  if (score <= 6.5) return "MEDIUM";
  return "HIGH";
}

// For each axis, randomly select one of the 4 text variations 
// matching the score range. Seed the random selection with a 
// hash of the user's full answer array so the same user always 
// gets the same report if they retake it.

// For archetype summary, select variation based on:
//   - If secondary archetype is clearly defined (gap > 0.5), 
//     use it to index variation (Acquirer=0, Operator=1, Builder=2, Architect=3) mod 3
//   - Otherwise randomize among the 3 variations
```

---

## Results Page

This is the page the user sees immediately after lead capture.

**Layout (mobile-first, scrollable):**

**Section 1 — Hero**
- "Hi [First Name],"
- Large archetype name: e.g., **"You're The Acquirer"**
- One-line archetype descriptor (from markdown Section 4)
- Spider chart (see below)
- Axis score callout below chart: list all 5 axes with score, e.g.:
  - Deal Instinct: 7.3
  - Operator Depth: 5.1
  - Capital Readiness: 6.7
  - Risk Tolerance: 8.2
  - Strategic Vision: 9.0

**Section 2 — Your Five Dimensions**
Five cards, one per axis. Each card shows:
- Axis name + score + score bar (visual fill)
- Selected text variation (100–150 words) from markdown Section 7

**Section 3 — Your Blueprint**
Full archetype summary from markdown Section 8 (selected variation). Broken into visual subsections:
- Archetype narrative paragraph
- "Biggest Opportunity" callout box
- "Most Common Mistake" callout box
- "Your 90-Day Focus" callout box
- "One Question to Sit With" styled as a pull quote

**Section 4 — CTA**
Academy or BoardRoom CTA text from markdown Section 9, based on archetype routing.
Simple text + a button: **"Learn More"** (link to be provided by client — placeholder for now)

**Bottom of page:**
"Your full report has been sent to [email]."

---

## Spider Chart Specs

Use Chart.js radar chart.

```javascript
const chartData = {
  labels: [
    'Deal Instinct',
    'Operator Depth', 
    'Capital Readiness',
    'Risk Tolerance',
    'Strategic Vision'
  ],
  datasets: [
    {
      label: 'Your Profile',
      data: [DI, OD, CR, RT, SV], // user's scores
      backgroundColor: 'rgba(20, 184, 166, 0.25)', // teal fill
      borderColor: 'rgba(20, 184, 166, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(20, 184, 166, 1)',
    },
    {
      label: 'Benchmark',
      data: [8, 8, 8, 8, 8], // benchmark ring
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
    }
  ]
};

const chartOptions = {
  scales: {
    r: {
      min: 0,
      max: 10,
      ticks: { display: false },
      grid: { color: 'rgba(255,255,255,0.1)' },
      pointLabels: {
        color: '#ffffff',
        font: { size: 13, weight: 'bold' }
      }
    }
  },
  plugins: {
    legend: { display: false }
  }
};
```

Render chart on a dark background card. Show each axis label + score at the vertex. Include small caption below chart: *"No two profiles look the same. Your shape tells the story."*

---

## PDF Report Generation

The PDF is a server-side render of the full results page content (not a screenshot of the live page).

Build a separate HTML template (`report-template.html`) that renders all report sections cleanly for PDF:
- A4 / Letter portrait format
- 4 pages roughly:
  - Page 1: Hero (name, archetype, spider chart as embedded image)
  - Page 2: Five axis breakdown
  - Page 3: Archetype summary (opportunity, mistake, 90-day focus, question)
  - Page 4: CTA section + "Generated by the Contrarian Thinking Business Ownership Blueprint"

Use Puppeteer to render this template to PDF server-side. The spider chart needs to be captured as a base64 PNG client-side and sent to the server with the form submission so it can be embedded in the PDF template.

```javascript
// Client sends to /api/submit:
{
  firstName: "Bobby",
  email: "bobby@example.com",
  answers: [9, 7, 7, 9, 7, 9, 7, 4, 7, 9, 7, 9, 9, 9, 9],
  chartImageBase64: "data:image/png;base64,..."
}
```

---

## Email Delivery (Resend)

After generating the PDF, send via Resend:

```javascript
await resend.emails.send({
  from: 'blueprint@contrarianthinking.co', // configure in Resend
  to: email,
  subject: 'Your Business Ownership Blueprint is ready.',
  html: `
    <p>Hi ${firstName},</p>
    <p>You're <strong>The ${archetype}</strong>.</p>
    <p>Your full Business Ownership Blueprint is attached. It includes your spider chart, a breakdown of all five dimensions, and your personalized strategic summary.</p>
    <p>— Codie & the Contrarian Thinking team</p>
  `,
  attachments: [
    {
      filename: 'Business-Ownership-Blueprint.pdf',
      content: pdfBuffer.toString('base64')
    }
  ]
});
```

---

## Environment Variables Needed

```
RESEND_API_KEY=your_resend_api_key
```

---

## File Structure

```
/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── QuizScreen.jsx
│   │   │   ├── LeadCapture.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── SpiderChart.jsx
│   │   └── data/
│   │       └── questions.js       ← all 15 questions + scores
├── server/
│   ├── index.js                   ← Express server
│   ├── scoring.js                 ← axis + archetype scoring logic
│   ├── reportContent.js           ← all text variations from markdown doc
│   ├── reportAssembly.js          ← selects correct variations per user
│   ├── pdfGenerator.js            ← Puppeteer PDF render
│   ├── emailSender.js             ← Resend integration
│   └── templates/
│       └── report-template.html   ← HTML template for PDF
└── package.json
```

---

## Content Source

All question text, answer options, score values, axis text variations, archetype summary variations, and CTA language are in the attached markdown file. Do not rewrite or paraphrase any of this content — import it exactly as written into `reportContent.js` and `questions.js`.

---

## Design Notes

- Dark background throughout (#0f0f0f or similar)
- Teal accent color for highlights, selected states, chart fill
- White primary text, gray secondary text
- Large readable font on mobile (minimum 16px body)
- Rounded cards for question options and report sections
- No stock photos, no illustrations — clean typographic design
- Progress bar at top of quiz screens: thin teal line, animates on advance
- The results page should feel like a premium diagnostic report, not a Buzzfeed quiz

---

## Out of Scope for V1

- User accounts or saved results
- Admin dashboard
- Analytics beyond what Resend provides
- A/B testing
- Multiple languages
- Social sharing of results (can add later)

---

## Definition of Done

- [ ] Landing page renders on mobile, QR-code accessible
- [ ] Quiz flow completes 15 questions with progress bar
- [ ] Lead capture collects first name + email, validates both
- [ ] Scoring logic runs correctly for all 5 axes and 4 archetypes
- [ ] Results page renders spider chart, archetype, all 5 axis blocks, summary, CTA
- [ ] PDF generates with all content and embedded spider chart
- [ ] Email sends with PDF attached via Resend
- [ ] Works on iOS Safari and Android Chrome (mobile-first)
- [ ] No crashes on any of the 256 possible answer combinations (4^... actually all combos)
