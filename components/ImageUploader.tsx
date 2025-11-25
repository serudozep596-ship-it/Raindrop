import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface Props {
  onImageSelected: (url: string, width: number, height: number) => void;
}

const ImageUploader: React.FC<Props> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onImageSelected(result, img.width, img.height);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <div 
        className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <Upload className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">上传前挡风玻璃照片</h3>
        <p className="text-slate-500 text-center mb-6">
          支持 JPG, PNG 格式。系统将自动生成采样区域。
        </p>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          选择文件
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="font-semibold text-slate-700">1. 上传图片</div>
          <div className="text-xs text-slate-400 mt-1">清晰的前挡风玻璃雨滴图</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="font-semibold text-slate-700">2. 智能采样</div>
          <div className="text-xs text-slate-400 mt-1">自动锁定5个分析区域</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
          <div className="font-semibold text-slate-700">3. 标记分析</div>
          <div className="text-xs text-slate-400 mt-1">手动标记，即时计算</div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;