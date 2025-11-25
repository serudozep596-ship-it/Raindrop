import React, { useMemo } from 'react';
import { RaindropMark, Region, RegionStats } from '../types';
import { analyzeRegion } from '../utils/geometry';
import { BarChart, Droplets, Ruler, Percent, FileText } from 'lucide-react';

interface Props {
  regions: Region[];
  allMarks: { [regionId: number]: RaindropMark[] };
  onGenerateReport: () => void;
}

const ResultsPanel: React.FC<Props> = ({ regions, allMarks, onGenerateReport }) => {
  const stats: RegionStats[] = useMemo(() => {
    return regions.map(r => analyzeRegion(allMarks[r.id] || [], r.width, r.height, r.id));
  }, [regions, allMarks]);

  const averages = useMemo(() => {
    const totalCount = stats.reduce((acc, s) => acc + s.count, 0);
    const totalPerc = stats.reduce((acc, s) => acc + s.percentageArea, 0);
    
    // For distances, we only consider regions that actually have distances calculated
    const validMinDists = stats.map(s => s.minDistance).filter((d): d is number => d !== null);
    const validMaxDists = stats.map(s => s.maxDistance).filter((d): d is number => d !== null);

    const avgMin = validMinDists.length ? validMinDists.reduce((a, b) => a + b, 0) / validMinDists.length : 0;
    const avgMax = validMaxDists.length ? validMaxDists.reduce((a, b) => a + b, 0) / validMaxDists.length : 0;

    return {
      avgCount: totalCount / regions.length,
      avgPercentage: totalPerc / regions.length,
      avgMinDist: avgMin,
      avgMaxDist: avgMax
    };
  }, [stats, regions.length]);

  return (
    <div className="bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col gap-6">
          
          {/* Header Row with Stats and Action Button */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
             {/* Summary Cards */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Droplets size={18} />
                  <span className="text-sm font-semibold">平均数量</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{averages.avgCount.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 框</span></div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Percent size={18} />
                  <span className="text-sm font-semibold">平均覆盖率</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">{averages.avgPercentage.toFixed(2)}%</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-emerald-600 mb-2">
                  <Ruler size={18} />
                  <span className="text-sm font-semibold">最小间距 (均值)</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {averages.avgMinDist > 0 ? averages.avgMinDist.toFixed(1) : '-'} <span className="text-sm font-normal text-slate-500">px</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <BarChart size={18} />
                  <span className="text-sm font-semibold">最大间距 (均值)</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {averages.avgMaxDist > 0 ? averages.avgMaxDist.toFixed(1) : '-'} <span className="text-sm font-normal text-slate-500">px</span>
                </div>
              </div>
            </div>

            {/* Action Column */}
            <div className="lg:w-48 shrink-0 flex items-stretch">
              <button 
                onClick={onGenerateReport}
                className="w-full flex flex-col items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all active:scale-95 p-4"
              >
                <FileText size={28} />
                <span className="font-semibold">生成分析报告</span>
              </button>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">区域 ID</th>
                  <th className="px-4 py-3 font-medium">雨点数</th>
                  <th className="px-4 py-3 font-medium">覆盖率</th>
                  <th className="px-4 py-3 font-medium">最小间距</th>
                  <th className="px-4 py-3 font-medium">最大间距</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.regionId} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">#{s.regionId + 1}</td>
                    <td className="px-4 py-3">{s.count}</td>
                    <td className="px-4 py-3">{s.percentageArea.toFixed(2)}%</td>
                    <td className="px-4 py-3">{s.minDistance !== null ? s.minDistance.toFixed(1) : '-'} px</td>
                    <td className="px-4 py-3">{s.maxDistance !== null ? s.maxDistance.toFixed(1) : '-'} px</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;