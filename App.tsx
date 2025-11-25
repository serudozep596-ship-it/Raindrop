import React, { useState, useEffect, useRef } from 'react';
import { Region, RaindropMark } from './types';
import { generateRandomRegions } from './utils/geometry';
import ImageUploader from './components/ImageUploader';
import ZoomEditor from './components/ZoomEditor';
import ResultsPanel from './components/ResultsPanel';
import ReportModal from './components/ReportModal';
import { Maximize2, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{width: number, height: number} | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [activeRegionIndex, setActiveRegionIndex] = useState<number>(0);
  const [marks, setMarks] = useState<{[key: number]: RaindropMark[]}>({});
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Container ref for the main image to calculate responsive scaling
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleImageSelected = (url: string, width: number, height: number) => {
    setImageUrl(url);
    setImgDimensions({ width, height });
    const newRegions = generateRandomRegions(width, height);
    setRegions(newRegions);
    // Initialize marks for each region
    const initialMarks: {[key: number]: RaindropMark[]} = {};
    newRegions.forEach(r => initialMarks[r.id] = []);
    setMarks(initialMarks);
    setActiveRegionIndex(0);
  };

  const handleUpdateMarks = (regionId: number, newMarks: RaindropMark[]) => {
    setMarks(prev => ({
      ...prev,
      [regionId]: newMarks
    }));
  };

  const handleConfirmRegion = () => {
    if (activeRegionIndex < regions.length - 1) {
      setActiveRegionIndex(prev => prev + 1);
    } else {
      // Finished all regions
      // alert("所有区域标记完成！您可以查看下方的统计数据或生成报告。"); // Commented out alert to avoid blocking
    }
  };

  const reset = () => {
    // Removed confirm to ensure immediate response
    setImageUrl(null);
    setRegions([]);
    setMarks({});
    setIsReportOpen(false);
  };

  // Reroll regions if user dislikes the random selection
  const rerollRegions = () => {
    if (imgDimensions) {
      // Removed confirm to ensure immediate response
      const newRegions = generateRandomRegions(imgDimensions.width, imgDimensions.height);
      setRegions(newRegions);
      const initialMarks: {[key: number]: RaindropMark[]} = {};
      newRegions.forEach(r => initialMarks[r.id] = []);
      setMarks(initialMarks);
      setActiveRegionIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.88a5.95 5.95 0 0 1-8.48 8.48A5.95 5.95 0 0 1 3.26 8.57L9 2.69a4.23 4.23 0 0 1 3 0Z"/></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">RainDrop Analytics</h1>
          </div>
          
          {imageUrl && (
            <div className="flex items-center gap-3">
              <button 
                onClick={rerollRegions} 
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
              >
                <RotateCcw size={16} /> 重新采样
              </button>
              <div className="h-4 w-px bg-slate-300"></div>
              <button 
                onClick={reset} 
                className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors cursor-pointer px-2 py-1"
              >
                重新上传
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {!imageUrl ? (
          <ImageUploader onImageSelected={handleImageSelected} />
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px-200px)] lg:h-[calc(100vh-64px-180px)] overflow-hidden">
            
            {/* Left Column: Image Overview */}
            <div className="flex-1 bg-slate-900/95 relative flex items-center justify-center p-4 lg:p-8 overflow-auto">
              {imgDimensions && (
                <div 
                  className="relative shadow-2xl border-4 border-slate-800 rounded-sm"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    aspectRatio: `${imgDimensions.width} / ${imgDimensions.height}`
                  }}
                  ref={imageContainerRef}
                >
                  <img 
                    src={imageUrl} 
                    alt="Windshield" 
                    className="block w-full h-full object-contain pointer-events-none opacity-80" 
                  />
                  
                  {/* Overlay Regions on the Master Image */}
                  <div className="absolute inset-0">
                    {/* SVG overlay for rendering boxes relatively */}
                    <svg className="w-full h-full" viewBox={`0 0 ${imgDimensions.width} ${imgDimensions.height}`}>
                      {regions.map((region, idx) => (
                        <g 
                          key={region.id} 
                          onClick={() => setActiveRegionIndex(idx)}
                          className={`cursor-pointer transition-all duration-200 hover:opacity-100 ${idx === activeRegionIndex ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
                        >
                          <rect
                            x={region.x}
                            y={region.y}
                            width={region.width}
                            height={region.height}
                            fill="none"
                            stroke={idx === activeRegionIndex ? "#ef4444" : "#fbbf24"} // Red for active, yellow for inactive
                            strokeWidth={idx === activeRegionIndex ? Math.max(4, imgDimensions.width * 0.005) : Math.max(2, imgDimensions.width * 0.003)}
                            strokeDasharray={idx === activeRegionIndex ? "" : "20,10"}
                          />
                          {/* Label background */}
                          <rect 
                            x={region.x} 
                            y={Math.max(0, region.y - (imgDimensions.width * 0.04))} 
                            width={imgDimensions.width * 0.05} 
                            height={imgDimensions.width * 0.04} 
                            fill={idx === activeRegionIndex ? "#ef4444" : "#fbbf24"} 
                          />
                          <text 
                            x={region.x + (imgDimensions.width * 0.025)} 
                            y={Math.max(0, region.y - (imgDimensions.width * 0.015))} 
                            textAnchor="middle" 
                            fill="white" 
                            fontSize={imgDimensions.width * 0.02} 
                            fontWeight="bold"
                          >
                            #{idx + 1}
                          </text>
                          
                          {/* Mini visual indicator of marks inside the big box */}
                          {marks[region.id]?.map(m => (
                            <circle 
                              key={m.id} 
                              cx={region.x + m.x} 
                              cy={region.y + m.y} 
                              r={Math.max(10, m.radius * 2)} // Visual boost for overview
                              fill={m.color === 'red' ? "#ef4444" : "#60a5fa"}
                            />
                          ))}
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm flex items-center gap-2">
                <Maximize2 size={16} />
                点击黄色框选区域进行放大标记
              </div>
            </div>

            {/* Right Column: Workstation / Zoom Editor */}
            <div className="w-full lg:w-[450px] bg-white border-l border-slate-200 z-10 flex flex-col shadow-xl">
              <div className="p-4 flex-1 flex flex-col min-h-0">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>标记工作台</span>
                  <span className="text-xs font-normal text-slate-400">区域 {activeRegionIndex + 1} / {regions.length}</span>
                </h2>
                
                {regions.length > 0 && imgDimensions && (
                  <div className="flex-1 min-h-0">
                    <ZoomEditor
                      imageSrc={imageUrl}
                      region={regions[activeRegionIndex]}
                      imgDimensions={imgDimensions}
                      marks={marks[regions[activeRegionIndex].id] || []}
                      onUpdateMarks={(newMarks) => handleUpdateMarks(regions[activeRegionIndex].id, newMarks)}
                      onConfirm={handleConfirmRegion}
                      isLastRegion={activeRegionIndex === regions.length - 1}
                      isActive={true}
                    />
                  </div>
                )}
                
                {/* Quick Navigation Dots */}
                <div className="mt-4 flex justify-center gap-2">
                   {regions.map((r, i) => (
                     <button
                       key={r.id}
                       onClick={() => setActiveRegionIndex(i)}
                       className={`w-3 h-3 rounded-full transition-all ${i === activeRegionIndex ? 'bg-red-500 scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
                       title={`切换到区域 ${i + 1}`}
                     />
                   ))}
                </div>
              </div>
            </div>

          </div>
        )}
        
        {/* Bottom Panel: Statistics */}
        {imageUrl && regions.length > 0 && (
          <ResultsPanel 
            regions={regions} 
            allMarks={marks} 
            onGenerateReport={() => setIsReportOpen(true)}
          />
        )}

        {/* Report Modal */}
        {imageUrl && (
          <ReportModal
            isOpen={isReportOpen}
            onClose={() => setIsReportOpen(false)}
            onReset={reset}
            imageUrl={imageUrl}
            imgDimensions={imgDimensions}
            regions={regions}
            marks={marks}
          />
        )}
      </main>
    </div>
  );
};

export default App;