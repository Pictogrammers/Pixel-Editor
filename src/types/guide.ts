export type Guide = {
  name: string;
  width?: number;
  height?: number;
  color: string;
  opacity: number;
  lines: number[][];
  dashed?: number[];
  dashOffset?: number;
}