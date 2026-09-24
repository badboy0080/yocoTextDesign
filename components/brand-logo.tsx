export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`yooco-brand${compact ? " yooco-brand--compact" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/yooco-logo.svg?v=bubble-c-v1" alt="Yooco" width="580" height="144" />
    </span>
  );
}
