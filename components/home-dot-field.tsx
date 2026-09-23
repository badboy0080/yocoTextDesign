"use client";

import { useEffect, useRef } from "react";

import { DotPattern } from "@/components/ui/dot-pattern";

const SPOT_GONE = "radial-gradient(circle at -400px -400px, #000 0%, transparent 200px)";

function spotAt(x: number, y: number) {
  return `radial-gradient(circle at ${x}px ${y}px, #000 0%, transparent 200px)`;
}

export function HomeDotField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const blueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const blue = blueRef.current;
    if (!root || !blue) return;

    blue.style.maskRepeat = "no-repeat";
    blue.style.webkitMaskRepeat = "no-repeat";
    blue.style.maskSize = "100% 100%";
    blue.style.webkitMaskSize = "100% 100%";

    const place = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const mask = spotAt(x, y);
      blue.style.maskImage = mask;
      blue.style.webkitMaskImage = mask;
    };

    const onMove = (event: MouseEvent) => place(event.clientX, event.clientY);
    const onLeave = () => {
      blue.style.maskImage = SPOT_GONE;
      blue.style.webkitMaskImage = SPOT_GONE;
    };

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <DotPattern width={18} height={18} cr={1.35} className="fill-neutral-400/40" />
      <div
        ref={blueRef}
        className="absolute inset-0 [mask-repeat:no-repeat] [mask-size:100%_100%]"
        style={{
          maskImage: SPOT_GONE,
          WebkitMaskImage: SPOT_GONE,
        }}
      >
        <DotPattern width={18} height={18} cr={1.485} className="fill-blue-600" />
      </div>
    </div>
  );
}
