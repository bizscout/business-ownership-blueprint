export function calculateAxisScores(answers: number[]) {
  const average = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    DI: average([answers[0], answers[1], answers[2]]),
    OD: average([answers[3], answers[4], answers[5]]),
    CR: average([answers[6], answers[7], answers[8]]),
    RT: average([answers[9], answers[10], answers[11]]),
    SV: average([answers[12], answers[13], answers[14]])
  };
}

export function calculateArchetypes(axes: { DI: number; OD: number; CR: number; RT: number; SV: number }) {
  return {
    Acquirer:  (axes.DI * 0.40) + (axes.SV * 0.35) + (axes.RT * 0.25),
    Operator:  (axes.OD * 0.40) + (axes.DI * 0.35) + (axes.RT * 0.25),
    Builder:   (axes.OD * 0.40) + (axes.SV * 0.35) + (axes.CR * 0.25),
    Architect: (axes.SV * 0.40) + (axes.CR * 0.35) + (axes.OD * 0.25)
  };
}

export function getScoreRange(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score <= 3.5) return "LOW";
  if (score <= 6.5) return "MEDIUM";
  return "HIGH";
}
