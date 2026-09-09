import { useEffect, useRef } from 'react';
import { Eraser } from 'lucide-react';

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const previous = canvas.width ? canvas.toDataURL() : null;
  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  const context = canvas.getContext('2d');
  context.scale(ratio, ratio);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = 2.2;
  context.strokeStyle = '#0f172a';
  if (previous) {
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
    image.src = previous;
  }
}

function cropSignature(canvas) {
  const context = canvas.getContext('2d');
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (pixels.data[(y * canvas.width + x) * 4 + 3] > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < 0) return '';
  const padding = Math.max(12, Math.round(Math.min(canvas.width, canvas.height) * 0.04));
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropWidth = Math.min(canvas.width - cropX, maxX - minX + padding * 2);
  const cropHeight = Math.min(canvas.height - cropY, maxY - minY + padding * 2);
  const cropped = document.createElement('canvas');
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  cropped.getContext('2d').drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return cropped.toDataURL('image/png');
}

export default function SignaturePad({ onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const hasInkRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    setupCanvas(canvas);
    const observer = new ResizeObserver(() => setupCanvas(canvas));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  };

  const start = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = canvasRef.current.getContext('2d');
    const [x, y] = point(event);
    context.beginPath();
    context.moveTo(x, y);
  };

  const move = (event) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext('2d');
    const [x, y] = point(event);
    context.lineTo(x, y);
    context.stroke();
    hasInkRef.current = true;
  };

  const stop = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (!hasInkRef.current) return;
    onChange(cropSignature(canvasRef.current));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    hasInkRef.current = false;
    onChange('');
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full touch-none cursor-crosshair"
          aria-label="Quadro para desenhar sua assinatura"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          onPointerLeave={stop}
        />
      </div>
      <button type="button" onClick={clear} className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100">
        <Eraser size={14} /> Limpar assinatura
      </button>
    </div>
  );
}
