export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`yooco-brand${compact ? " yooco-brand--compact" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/yooco-mark.svg" alt="" aria-hidden="true" width="36" height="36" />
      <span>Yooco</span>
    </span>
  );
}
