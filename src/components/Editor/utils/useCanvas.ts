import { useEffect, useRef } from "react";

export default function useCanvas(callback: (args: [HTMLCanvasElement, CanvasRenderingContext2D]) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    callback([canvas, ctx]);
  }, [callback]);

  return canvasRef;
}
