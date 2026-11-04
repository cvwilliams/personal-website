/** Hours at which each Dreaming Spanish level starts, for an English speaker (levels 1–7). */
export const LEVEL_STARTS = [0, 50, 150, 300, 600, 1000, 1500] as const;

export interface SpanishProgress {
  hours: number;
  level: number;
  levelStart: number;
  nextLevelStart?: number;
  /** 0–1 progress through the current level (1 at level 7). */
  progress: number;
}

export function spanishProgress(hours: number): SpanishProgress {
  const index = LEVEL_STARTS.findLastIndex((start) => hours >= start);
  const levelStart = LEVEL_STARTS[index];
  const nextLevelStart = LEVEL_STARTS[index + 1];
  return {
    hours,
    level: index + 1,
    levelStart,
    nextLevelStart,
    progress: nextLevelStart ? (hours - levelStart) / (nextLevelStart - levelStart) : 1,
  };
}
