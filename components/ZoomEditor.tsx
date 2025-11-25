import React, { useRef, useState, useLayoutEffect } from 'react';
import { RaindropMark, Region } from '../types';
import { MousePointer2, Eraser, Trash2, Check, ArrowRight } from 'lucide-react';

interface Props {
  imageSrc: string;
  region: Region;
  imgDimensions: { width: number; height: number };
  marks: RaindropMark[];
  onUpdateMarks: (newMarks: RaindropMark[]) => void;
  onConfirm: () => void;
  isLastRegion: boolean;
  isActive: boolean;
}

const ZoomEditor: React.FC<Props> = ({ 
  imageSrc, 
  region, 
  imgDimensions,
  marks, 
  onUpdateMarks, 
  onConfirm,
  isLastRegion,
  isActive 
}) => {
  const [tool, setTool] = useState<'add' | 'erase'>('add');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [markColor, setMarkColor] = useState<'red' | 'blue'>('red');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({ 
          width: containerRef.current.clientWidth, 
          height: containerRef.current.clientHeight 
        });
      }
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    updateSize(); // Initial call
    
    return () => observer.disconnect();
  }, []);

  // Calculate scaling to fit the selected region into the container
  const scale = React.useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0 || region.width === 0) return 1;
    const scaleX = containerSize.width / region.width;
    const scaleY = containerSize.height / region.height;
    return Math.min(scaleX, scaleY);
  }, [containerSize, region]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    // Get click coordinates relative to the container DOM element
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert container coordinates to LOCAL region coordinates
    // Since CSS transform translates (-region.x, -region.y), the container (0,0) 
    // effectively aligns with the Region's top-left in the image.
    // We just need to divide by scale.
    const localX = clickX / scale;
    const localY = clickY / scale;

    // Boundary check using local coordinates
    if (
      localX < 0 || 
      localX > region.width ||
      localY < 0 || 
      localY > region.height
    ) {
      return;
    }

    if (tool === 'add') {
      const newMark: RaindropMark = {
        x: localX, // Store as Local Coordinate
        y: localY, // Store as Local Coordinate
        id: Math.random().toString(36).substr(2, 9),
        radius: brushSize,
        color: markColor
      };
      onUpdateMarks([...marks, newMark]);
    } else {
      // Eraser logic: compare local coordinates
      const eraseRadius = Math.max(20, brushSize * 2); 
      const filtered = marks.filter(m => {
        // Calculate distance between click (local) and mark (local)
        const dist = Math.sqrt(Math.pow(m.x - localX, 2) + Math.pow(m.y - localY, 2));
        return dist > eraseRadius;
      });
      onUpdateMarks(filtered);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Toolbar */}
      <div className="p-3 bg-white border-b border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between shrink-0">
        
        <div className="flex items-center gap-3">
          {/* Tools Group */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setTool('add')}
              className={`p-2 rounded-md transition-all ${tool === 'add' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="添加标记"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              onClick={() => setTool('erase')}
              className={`p-2 rounded-md transition-all ${tool === 'erase' ? 'bg-white shadow text-red-500' : 'text-slate-500 hover:text-slate-700'}`}
              title="擦除标记"
            >
              <Eraser size={18} />
            </button>
          </div>

          {/* Color & Size Controls (Only when adding) */}
          {tool === 'add' && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
              {/* Color Picker */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setMarkColor('red')}
                  className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${markColor === 'red' ? 'border-slate-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: '#ef4444' }}
                  title="红色标记"
                >
                  {markColor === 'red' && <Check size={14} className="text-white" />}
                </button>
                <button
                  onClick={() => setMarkColor('blue')}
                  className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all ${markColor === 'blue' ? 'border-slate-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: '#3b82f6' }}
                  title="蓝色标记"
                >
                  {markColor === 'blue' && <Check size={14} className="text-white" />}
                </button>
              </div>

              {/* Brush Size Slider */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 px-3 rounded-lg h-[42px]">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">大小</span>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-600"
                  title={`当前半径: ${brushSize}px`}
                />
                <div className="w-6 h-6 flex items-center justify-center">
                  <div 
                    className="rounded-full shadow-sm" 
                    style={{ 
                      width: Math.min(24, brushSize * 1.5), // Visual preview scale
                      height: Math.min(24, brushSize * 1.5),
                      backgroundColor: markColor === 'red' ? '#ef4444' : '#3b82f6'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-slate-300"></div>

          {/* Clear All */}
          <button
            onClick={() => {
              if(confirm('确定清除当前区域的所有标记吗?')) onUpdateMarks([]);
            }}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="清空当前区域"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-200 select-none">
        <div 
          ref={containerRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
        >
          {/* 
            Transformation Layer 
            We translate the entire image so the top-left of the region is at (0,0),
            then scale it up to fit the container.
          */}
          <div
            style={{
              transform: `scale(${scale}) translate(-${region.x}px, -${region.y}px)`,
              transformOrigin: 'top left',
              width: imgDimensions.width,
              height: imgDimensions.height,
              position: 'absolute',
              top: 0,
              left: 0,
              willChange: 'transform' // Performance optimization
            }}
          >
            {/* Base Image */}
            <img 
              src={imageSrc} 
              alt="Workstation" 
              className="absolute top-0 left-0 max-w-none pointer-events-none select-none"
              style={{ width: imgDimensions.width, height: imgDimensions.height }}
              draggable={false}
            />

            {/* SVG Layer for Marks */}
            <svg 
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ width: imgDimensions.width, height: imgDimensions.height }}
            >
              {/* 
                 CRITICAL: Transparent capture layer 
              */}
              <rect 
                width="100%" 
                height="100%" 
                fill="rgba(0,0,0,0)" 
                className="pointer-events-auto"
              />

              {marks.map(mark => (
                <circle
                  key={mark.id}
                  // VISUAL RENDER: Map Local Coordinate back to Global SVG space for display
                  cx={mark.x + region.x}
                  cy={mark.y + region.y}
                  r={mark.radius}
                  fill={mark.color === 'red' ? '#ef4444' : '#3b82f6'}
                  stroke="white"
                  strokeWidth={1.5 / scale} // Keep stroke thin visually regardless of zoom
                  className="shadow-sm"
                />
              ))}

              {/* Helper Outline for the current region boundary */}
              <rect
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                fill="none"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={2 / scale}
                strokeDasharray={`${10/scale}, ${5/scale}`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between">
        <div className="text-xs text-slate-500">
           当前标记: <span className="font-bold text-slate-700 text-sm">{marks.length}</span> 个
        </div>

        <button
          onClick={onConfirm}
          className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-md transition-all active:scale-95"
        >
          {isLastRegion ? (
            <>
              <Check size={18} /> 完成分析
            </>
          ) : (
            <>
              下一区域 <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ZoomEditor;