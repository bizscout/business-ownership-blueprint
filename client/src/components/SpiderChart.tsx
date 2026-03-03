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
        backgroundColor: 'rgba(82, 19, 12, 0.15)', // #52130C fill
        borderColor: '#52130C',
        borderWidth: 2,
        pointBackgroundColor: '#52130C',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#52130C',
      },
      {
        label: 'Benchmark',
        data: [8, 8, 8, 8, 8],
        backgroundColor: 'transparent',
        borderColor: 'rgba(31, 30, 28, 0.2)', // #1F1E1C
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
        grid: { color: 'rgba(31, 30, 28, 0.1)' },
        angleLines: { color: 'rgba(31, 30, 28, 0.1)' },
        pointLabels: {
          color: '#1F1E1C',
          font: { 
            size: 11,
            family: "'Inter', sans-serif",
            weight: 600 as const
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(31, 30, 28, 0.9)',
        titleColor: '#F0EDE4',
        bodyColor: '#F0EDE4',
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
    <div className="w-full aspect-square relative bg-white rounded-xl p-4 shadow-sm border border-[#E5E0D8]">
      <Radar data={data} options={options} />
    </div>
  );
}
