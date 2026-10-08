export function BrandLogo({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  if (onDark) {
    return (
      <span className={`yooco-brand yooco-brand--dark${compact ? " yooco-brand--compact" : ""}`}>
        <span className="yooco-brand-mark" aria-hidden="true">Y</span>
        <span className="yooco-brand-word">Yooco</span>
      </span>
    );
  }

  return (
    <span className={`yooco-brand${compact ? " yooco-brand--compact" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/yooco-logo.svg?v=bubble-c-v1" alt="Yooco" width="580" height="144" />
    </span>
  );
}
