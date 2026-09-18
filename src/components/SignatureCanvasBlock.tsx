import React, { useRef, useState, useEffect } from 'react';
import { Upload, Type, PenTool, X, Lock } from 'lucide-react';

interface SignatureCanvasBlockProps {
  initialSignature?: string | null;
  showSaveDefault?: boolean;
  onSaveDefault?: (signature: string) => void;
  onSignatureReady: (signatureDataUrl: string | null) => void;
  label?: string;
}

export function SignatureCanvasBlock({ onSignatureReady, label = "Signature", initialSignature, showSaveDefault = false, onSaveDefault }: SignatureCanvasBlockProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Custom canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Type state
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState("'Dancing Script', cursive");
  
  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Result state
  const [finalSignature, setFinalSignature] = useState<string | null>(initialSignature || null);

  const fonts = [
    { name: 'Dancing Script', value: "'Dancing Script', cursive" },
    { name: 'Great Vibes', value: "'Great Vibes', cursive" },
    { name: 'Brush Script MT', value: "'Brush Script MT', cursive" },
    { name: 'Caveat', value: "'Caveat', cursive" },
    { name: 'Homemade Apple', value: "'Homemade Apple', cursive" },
  ];

  // Load Google fonts dynamically if they don't exist
  useEffect(() => {
    if (!document.getElementById('signature-fonts')) {
      const link = document.createElement('link');
      link.id = 'signature-fonts';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Homemade+Apple&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // Resize canvas to match container size without scaling the drawing context weirdly
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current && !finalSignature) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas physical size to CSS size
        const rect = canvas.parentElement?.getBoundingClientRect();
        if (rect) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'black';
        }
      }
    }
  }, [activeTab, finalSignature]);

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      handleDrawEnd();
    }
  };

  const handleDrawEnd = () => {
    if (canvasRef.current && hasDrawn) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setFinalSignature(dataUrl);
      onSignatureReady(dataUrl);
    }
  };

  const handleClearDraw = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    setFinalSignature(null);
    onSignatureReady(null);
  };

  // Convert typed text to canvas/image
  const handleTypeApply = () => {
    if (!typedName) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.font = `100px ${selectedFont}`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      
      const dataUrl = canvas.toDataURL('image/png');
      setFinalSignature(dataUrl);
      onSignatureReady(dataUrl);
    }
  };

  // Upload image
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].size > 500 * 1024) { alert("Signature is too large. Please upload an image smaller than 500KB."); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedImage(dataUrl);
        setFinalSignature(dataUrl);
        onSignatureReady(dataUrl);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const resetSignature = () => {
    setFinalSignature(null);
    setHasDrawn(false);
    setTypedName('');
    setUploadedImage(null);
    onSignatureReady(null);
    if (activeTab === 'draw') {
      setTimeout(() => {
        handleClearDraw();
      }, 50);
    }
  };

  if (finalSignature) {
    return (
      <div className="relative border-2 border-black bg-white w-full h-40 flex items-center justify-center neu-shadow-sm group">
        <img src={finalSignature} alt="Signature" className="max-h-32 max-w-full object-contain mix-blend-multiply" />
        
        <button 
          onClick={resetSignature}
          className="absolute top-2 right-2 p-1.5 bg-neutral-900 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove signature"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        
        {showSaveDefault && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (onSaveDefault && finalSignature) {
                onSaveDefault(finalSignature);
              } else if (finalSignature) {
                localStorage.setItem('defaultProviderSig', finalSignature);
                alert('Signature saved as default! It will auto-load for future agreements.');
              }
            }}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold uppercase text-[10px] border border-blue-200 transition-colors"
            title="Lock as Default Signature"
          >
            <Lock className="w-3.5 h-3.5" /> Save as Default
          </button>
        )}

      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white w-full neu-shadow-sm flex flex-col">
      {/* Tabs */}
      <div className="flex border-b-2 border-black bg-neutral-50">
        <button 
          onClick={() => setActiveTab('draw')} 
          className={`flex-1 py-2 px-1 sm:px-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wide flex justify-center items-center gap-1 border-r-2 border-black ${activeTab === 'draw' ? 'bg-white' : 'hover:bg-neutral-100'}`}
        >
          <PenTool className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Draw</span>
        </button>
        <button 
          onClick={() => setActiveTab('type')} 
          className={`flex-1 py-2 px-1 sm:px-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wide flex justify-center items-center gap-1 border-r-2 border-black ${activeTab === 'type' ? 'bg-white' : 'hover:bg-neutral-100'}`}
        >
          <Type className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Type</span>
        </button>
        <button 
          onClick={() => setActiveTab('upload')} 
          className={`flex-1 py-2 px-1 sm:px-2 font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wide flex justify-center items-center gap-1 ${activeTab === 'upload' ? 'bg-white' : 'hover:bg-neutral-100'}`}
        >
          <Upload className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Upload</span>
        </button>
      </div>

      <div className="relative bg-white w-full h-40 flex flex-col justify-center items-center overflow-hidden">
        {activeTab === 'draw' && (
          <div className="w-full h-full relative cursor-crosshair">
            <canvas 
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              className="absolute inset-0 w-full h-full z-10 touch-none"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
              <span className="font-headline text-3xl uppercase tracking-widest">{label}</span>
            </div>
            
            <button 
              onClick={handleClearDraw}
              className="absolute bottom-2 right-2 text-[10px] font-bold uppercase underline opacity-50 hover:opacity-100 z-20"
            >
              Clear Canvas
            </button>
          </div>
        )}

        {activeTab === 'type' && (
          <div className="w-full h-full p-4 flex flex-col gap-3 justify-center items-center bg-white z-10">
            <input 
              type="text" 
              placeholder="Type your name..."
              value={typedName}
              onChange={e => setTypedName(e.target.value)}
              className="w-full text-center border-b-2 border-black focus:outline-none text-3xl pb-1 bg-transparent"
              style={{ fontFamily: selectedFont }}
            />
            
            <div className="flex gap-2 flex-wrap justify-center mt-2">
              {fonts.map(font => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(font.value)}
                  className={`w-6 h-6 rounded-full border-2 ${selectedFont === font.value ? 'border-blue-600 bg-blue-50' : 'border-neutral-300 hover:border-black'}`}
                  style={{ fontFamily: font.value, fontSize: '12px' }}
                  title={font.name}
                >
                  A
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleTypeApply}
              disabled={!typedName}
              className="mt-2 px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider disabled:opacity-30"
            >
              Apply Signature
            </button>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="w-full h-full p-4 flex flex-col justify-center items-center">
            <input 
              type="file" 
              id="sig-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleUploadFile}
            />
            <label 
              htmlFor="sig-upload"
              className="w-full h-full border-2 border-dashed border-neutral-300 hover:border-black hover:bg-neutral-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Click to upload image
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
