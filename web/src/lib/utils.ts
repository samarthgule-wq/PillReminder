export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function generateQrPlaceholderSvg(): string {
  // A clean QR representation data-uri or SVG path
  return 'QR_REFERENCE_READY';
}
