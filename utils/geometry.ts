import { Region, RaindropMark, RegionStats } from '../types';

export const NUM_REGIONS = 5;

/**
 * Generates non-overlapping random regions within image bounds.
 * Total area of 5 boxes approx 1/4 of image area.
 */
export const generateRandomRegions = (imgWidth: number, imgHeight: number): Region[] => {
  const regions: Region[] = [];
  
  // Calculate box size: 5 * area = (W * H) / 4
  // area = (W * H) / 20
  // side = sqrt((W * H) / 20)
  const totalPixels = imgWidth * imgHeight;
  const targetBoxArea = totalPixels / 20;
  let boxSize = Math.floor(Math.sqrt(targetBoxArea));
  
  // Safety clamps
  const minSide = Math.min(imgWidth, imgHeight);
  if (boxSize > minSide * 0.9) {
    boxSize = Math.floor(minSide * 0.9);
  }
  // Minimum size for usability (unless image is tiny)
  if (boxSize < 50) boxSize = 50;
  if (boxSize > minSide) boxSize = minSide;

  // Since we need to fit 5 boxes that cover 25% of the total area without overlap,
  // we need a fairly high number of attempts to find a valid configuration.
  const maxAttempts = 5000;
  
  const maxX = Math.max(0, imgWidth - boxSize);
  const maxY = Math.max(0, imgHeight - boxSize);

  for (let i = 0; i < NUM_REGIONS; i++) {
    let attempt = 0;
    let placed = false;

    while (attempt < maxAttempts && !placed) {
      const x = Math.floor(Math.random() * maxX);
      const y = Math.floor(Math.random() * maxY);
      
      const newRegion = { id: i, x, y, width: boxSize, height: boxSize };

      // Overlap check
      const overlaps = regions.some(r => 
        x < r.x + r.width &&
        x + boxSize > r.x &&
        y < r.y + r.height &&
        y + boxSize > r.y
      );

      if (!overlaps) {
        regions.push(newRegion);
        placed = true;
      }
      attempt++;
    }
    
    // Fallback if strict non-overlap fails (rare with 5000 attempts but possible on weird shapes)
    if (!placed) {
       regions.push({ id: i, x: Math.random() * maxX, y: Math.random() * maxY, width: boxSize, height: boxSize });
    }
  }

  return regions.sort((a, b) => a.id - b.id);
};

/**
 * Calculate Euclidean distance between two points
 */
export const getDistance = (p1: RaindropMark, p2: RaindropMark): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Analyze marks within a region
 */
export const analyzeRegion = (marks: RaindropMark[], regionWidth: number, regionHeight: number, regionId: number): RegionStats => {
  const count = marks.length;
  
  // Calculate total area of circles: pi * r^2
  const totalPixelArea = marks.reduce((acc, m) => acc + (Math.PI * Math.pow(m.radius, 2)), 0);
  const regionArea = regionWidth * regionHeight;
  const percentageArea = (totalPixelArea / regionArea) * 100;

  let minDistance: number | null = null;
  let maxDistance: number | null = null;

  if (count >= 2) {
    minDistance = Infinity;
    maxDistance = 0;

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const d = getDistance(marks[i], marks[j]);
        if (d < minDistance) minDistance = d;
        if (d > maxDistance) maxDistance = d;
      }
    }
  }

  return {
    regionId,
    count,
    totalPixelArea,
    percentageArea,
    minDistance: minDistance === Infinity ? null : minDistance,
    maxDistance: maxDistance === 0 ? null : maxDistance
  };
};