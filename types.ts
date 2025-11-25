export interface Point {
  x: number;
  y: number;
  id: string;
}

export interface RaindropMark extends Point {
  radius: number; // radius in pixels
  color: string; // 'blue' | 'red'
}

export interface Region {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionStats {
  regionId: number;
  count: number;
  totalPixelArea: number;
  percentageArea: number;
  minDistance: number | null; // null if < 2 points
  maxDistance: number | null; // null if < 2 points
}

export interface GlobalStats {
  avgCount: number;
  avgPercentage: number;
  avgMinDist: number;
  avgMaxDist: number;
}