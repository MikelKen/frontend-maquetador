export function generateColorFromString(str: string): string {
  const COLORS = [
    "#94a3b8",
    "#cbd5e1",
    "#e2e8f0",
    "#d1d5db",
    "#a5b4fc",
    "#93c5fd",
    "#99f6e4",
    "#fcd34d",
    "#f9a8d4",
    "#fda4af",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
