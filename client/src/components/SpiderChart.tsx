import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

interface SpiderChartProps {
  axes: {
    DI: number;
    OD: number;
    CR: number;
    RT: number;
    SV: number;
  };
}

export default function SpiderChart({ axes }: SpiderChartProps) {
  const data = {
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
        data: [axes.DI, axes.OD, axes.CR, axes.RT, axes.SV],
        backgroundColor: 'rgba(20, 184, 166, 0.25)', // teal fill
        borderColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(20, 184, 166, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(20, 184, 166, 1)',
      },
      {
        label: 'Benchmark',
        data: [8, 8, 8, 8, 8],
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ]
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: { display: false, stepSize: 2 },
        grid: { color: 'rgba(255,255,255,0.1)' },
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: {
          color: '#ffffff',
          font: { 
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { family: "'Inter', sans-serif" },
        bodyFont: { family: "'Inter', sans-serif" },
        callbacks: {
          label: (context: any) => {
            if (context.dataset.label === 'Benchmark') return null;
            return `Score: ${context.parsed.r.toFixed(1)}`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full aspect-square relative bg-[#111] rounded-xl p-4 border border-[#222]">
      <Radar data={data} options={options} />
    </div>
  );
}
