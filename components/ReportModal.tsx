import React, { useMemo } from 'react';
import { X, Printer, FileText, Home, ArrowLeft } from 'lucide-react';
import { RaindropMark, Region, RegionStats } from '../types';
import { analyzeRegion } from '../utils/geometry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  imageUrl: string;
  imgDimensions: { width: number; height: number } | null;
  regions: Region[];
  marks: { [key: number]: RaindropMark[] };
}

const ReportModal: React.FC<Props> = ({ isOpen, onClose, onReset, imageUrl, imgDimensions, regions, marks }) => {
  if (!isOpen || !imgDimensions) return null;

  // Calculate stats logic reused here for the report
  const stats: RegionStats[] = useMemo(() => {
    return regions.map(r => analyzeRegion(marks[r.id] || [], r.width, r.height, r.id));
  }, [regions, marks]);

  const averages = useMemo(() => {
    const totalCount = stats.reduce((acc, s) => acc + s.count, 0);
    const totalPerc = stats.reduce((acc, s) => acc + s.percentageArea, 0);
    const validMinDists = stats.map(s => s.minDistance).filter((d): d is number => d !== null);
    const validMaxDists = stats.map(s => s.maxDistance).filter((d): d is number => d !== null);

    return {
      avgCount: totalCount / regions.length,
      avgPercentage: totalPerc / regions.length,
      avgMinDist: validMinDists.length ? validMinDists.reduce((a, b) => a + b, 0) / validMinDists.length : 0,
      avgMaxDist: validMaxDists.length ? validMaxDists.reduce((a, b) => a + b, 0) / validMaxDists.length : 0
    };
  }, [stats, regions.length]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleString('zh-CN', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm overflow-y-auto print:bg-white print:overflow-visible">
      {/* Container - Acts as the 'Paper' */}
      <div className="bg-white w-full max-w-5xl min-h-[90vh] my-4 md:rounded-xl shadow-2xl flex flex-col print:w-full print:max-w-none print:shadow-none print:m-0 print:h-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header - No print for close button */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <FileText className="text-blue-600" /> 分析报告预览
          </div>
          <div className="flex gap-3">
             <button 
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <Home size={18} /> <span className="hidden sm:inline">返回主页</span>
            </button>
            <div className="w-px h-8 bg-slate-200"></div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Printer size={18} /> <span className="hidden sm:inline">打印 / 存为PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              title="关闭报告"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-8 print:p-0">
          
          {/* Report Title Section */}
          <div className="mb-8 border-b-2 border-slate-800 pb-4">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">雨滴密度分析报告</h1>
                <p className="text-slate-500 mt-2">RainDrop Analytics Professional Report</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>生成时间: {currentDate}</p>
                <p>采样区域数: {regions.length}</p>
              </div>
            </div>
          </div>

          {/* Image Comparison Section */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              视觉采样对比
            </h3>
            
            <div className="grid grid-cols-2 gap-6 print:gap-4">
              {/* Original Image */}
              <div className="space-y-2">
                <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                  <img 
                    src={imageUrl} 
                    className="w-full h-full object-contain"
                    alt="Original"
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    原始图像
                  </div>
                </div>
              </div>

              {/* Analyzed Image */}
              <div className="space-y-2">
                <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-900/5">
                    {/* Reusing the responsive SVG logic */}
                    <img 
                      src={imageUrl} 
                      className="max-w-full max-h-full object-contain opacity-60"
                      alt="Analyzed"
                    />
                    <div className="absolute inset-0">
                      <svg className="w-full h-full" viewBox={`0 0 ${imgDimensions.width} ${imgDimensions.height}`}>
                        {regions.map((region, idx) => (
                          <g key={region.id}>
                            <rect
                              x={region.x}
                              y={region.y}
                              width={region.width}
                              height={region.height}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth={Math.max(4, imgDimensions.width * 0.005)}
                            />
                            <text 
                              x={region.x + (imgDimensions.width * 0.02)} 
                              y={Math.max(0, region.y - (imgDimensions.width * 0.015))} 
                              fill="#ef4444" 
                              fontSize={imgDimensions.width * 0.03} 
                              fontWeight="bold"
                            >
                              #{idx + 1}
                            </text>
                            {marks[region.id]?.map(m => (
                              <circle 
                                key={m.id} 
                                cx={region.x + m.x} 
                                cy={region.y + m.y} 
                                r={Math.max(12, m.radius * 3)} // Increased size for visibility in report
                                fill={m.color === 'red' ? "#ef4444" : "#3b82f6"}
                              />
                            ))}
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs px-2 py-1 rounded print:text-black print:border print:bg-transparent">
                    标记分析图
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Summary Section */}
          <div className="mb-10 break-inside-avoid">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              综合数据概览
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
                <div className="text-slate-500 text-sm mb-1">平均数量</div>
                <div className="text-2xl font-bold text-slate-900">{averages.avgCount.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 框</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
                <div className="text-slate-500 text-sm mb-1">平均覆盖率</div>
                <div className="text-2xl font-bold text-slate-900">{averages.avgPercentage.toFixed(2)}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
                <div className="text-slate-500 text-sm mb-1">最小间距(均值)</div>
                <div className="text-2xl font-bold text-slate-900">{averages.avgMinDist > 0 ? averages.avgMinDist.toFixed(1) : '-'} <span className="text-xs font-normal text-slate-400">px</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 print:border-slate-300">
                <div className="text-slate-500 text-sm mb-1">最大间距(均值)</div>
                <div className="text-2xl font-bold text-slate-900">{averages.avgMaxDist > 0 ? averages.avgMaxDist.toFixed(1) : '-'} <span className="text-xs font-normal text-slate-400">px</span></div>
              </div>
            </div>
          </div>

          {/* Detailed Table Section */}
          <div className="break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              区域详细数据
            </h3>
            <table className="w-full text-sm text-left text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100 border-b border-slate-200 print:bg-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-700">区域编号</th>
                  <th className="px-6 py-4 font-bold text-slate-700">雨点数量</th>
                  <th className="px-6 py-4 font-bold text-slate-700">像素覆盖率</th>
                  <th className="px-6 py-4 font-bold text-slate-700">最小间距 (px)</th>
                  <th className="px-6 py-4 font-bold text-slate-700">最大间距 (px)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.map((s) => (
                  <tr key={s.regionId} className="bg-white print:border-b print:border-slate-200">
                    <td className="px-6 py-4 font-medium text-slate-900">区域 #{s.regionId + 1}</td>
                    <td className="px-6 py-4">{s.count}</td>
                    <td className="px-6 py-4">{s.percentageArea.toFixed(3)}%</td>
                    <td className="px-6 py-4">{s.minDistance !== null ? s.minDistance.toFixed(1) : '-'}</td>
                    <td className="px-6 py-4">{s.maxDistance !== null ? s.maxDistance.toFixed(1) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Actions (Visible only on Screen) */}
          <div className="mt-12 flex justify-center gap-6 print:hidden border-t border-slate-100 pt-8 pb-4">
             <button 
              onClick={onClose}
              className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
            >
              <ArrowLeft size={20} /> 关闭报告
            </button>
            <button 
              onClick={onReset}
              className="flex items-center gap-2 px-8 py-3 bg-red-50 border border-red-100 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all shadow-sm"
            >
              <Home size={20} /> 返回主页 (重新开始)
            </button>
          </div>

          {/* Footer Copyright */}
          <div className="mt-6 text-center text-xs text-slate-400">
            RainDrop Analytics &copy; {new Date().getFullYear()} - Automated Windshield Rain Distribution System
          </div>

        </div>
      </div>
      
      {/* Print Styles Helper */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          @page { margin: 0; size: auto; }
        }
      `}</style>
    </div>
  );
};

export default ReportModal;