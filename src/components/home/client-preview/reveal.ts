/**
 * Shared entrance animation for every dashboard widget. `index` is the widget's position across
 * all rows (row by row, left to right), so the stagger runs through the whole dashboard.
 */
export const revealMotion = (index: number, reduceMotion: boolean) => ({
  initial: reduceMotion ? (false as const) : { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: reduceMotion ? 0 : 0.35, delay: index * 0.035 },
});
