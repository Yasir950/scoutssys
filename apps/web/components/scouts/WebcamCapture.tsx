'use client';

import { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, Upload } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (base64: string) => void;
}

export function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'webcam' | 'upload'>('webcam');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const retake = () => setCapturedImage(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setCapturedImage(base64);
      onCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('webcam')} className={`flex-1 py-2 text-sm rounded-lg border transition ${mode === 'webcam' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Camera className="w-4 h-4 inline mr-1.5" /> Webcam
        </button>
        <button type="button" onClick={() => setMode('upload')} className={`flex-1 py-2 text-sm rounded-lg border transition ${mode === 'upload' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Upload className="w-4 h-4 inline mr-1.5" /> Upload File
        </button>
      </div>

      {mode === 'webcam' ? (
        <div className="relative">
          {capturedImage ? (
            <div className="flex flex-col items-center gap-3">
              <img src={capturedImage} alt="Captured" className="w-48 h-60 object-cover rounded-lg border-2 border-green-400" />
              <button type="button" onClick={retake} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-48 h-60 object-cover rounded-lg border border-slate-200"
                videoConstraints={{ facingMode: 'user', width: 400, height: 500 }}
              />
              <button type="button" onClick={capture} className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition">
                <Camera className="w-4 h-4" /> Capture Photo
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {capturedImage ? (
            <div className="flex flex-col items-center gap-3">
              <img src={capturedImage} alt="Uploaded" className="w-48 h-60 object-cover rounded-lg border-2 border-green-400" />
              <button type="button" onClick={() => setCapturedImage(null)} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <RotateCcw className="w-4 h-4" /> Change Photo
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary-400 transition">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-500">Click to upload photo (JPEG/PNG, max 2MB)</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
