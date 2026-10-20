"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const SLICES = 16;
const CAMERA = 1.6;
const MAX_WIDTH = 55;

export type TiltedGridImage = {
  src: string;
  alt: string;
};

type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  /** 一张图滚过自己宽度要用的秒数。越大越慢。 */
  speed?: number;
  /** 图块高度，单位 rem。 */
  tileHeight?: number;
  aspectRatio?: number;
  /** 图块间距，单位 px。 */
  gap?: number;
  /** 整条图带绕横轴的倾角，单位度。 */
  axis?: number;
  /** 每张图弯向镜头的程度。 */
  curve?: number;
  /** 左右两端渐隐的宽度，单位百分比。 */
  fade?: number;
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 26,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  ...rest
}: TiltedGridHeroProps) {
  const [width, setWidth] = useState(0);
  const [rem, setRem] = useState(16);
  const [offset, setOffset] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = rootRef.current;
    if (!target) return;
    const read = () => {
      const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      setRem(Number.isFinite(root) && root > 0 ? root : 16);
      setWidth(target.clientWidth);
      setNarrow(target.clientWidth > 0 && target.clientWidth < 720);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const heightRem = tileHeight * (narrow ? 0.62 : 1);
  const tileWidthRem = Math.min(heightRem * aspectRatio, MAX_WIDTH);
  const tileWidthPx = tileWidthRem * rem;
  const tileHeightPx = heightRem * rem;
  const stepPx = tileWidthPx + gap;
  const sliceWidth = tileWidthPx / SLICES;
  const stepDeg = curve / SLICES;
  const halfRad = ((stepDeg / 2) * Math.PI) / 180;
  const radius = halfRad > 0 ? sliceWidth / 2 / Math.tan(halfRad) : 0;
  const edgeRad = (((SLICES - 1) / 2) * stepDeg * Math.PI) / 180;
  const curveDepth = radius * (1 - Math.cos(edgeRad));
  const axisRad = (axis * Math.PI) / 180;
  const visualHeight = tileHeightPx * Math.abs(Math.cos(axisRad)) + curveDepth * Math.abs(Math.sin(axisRad)) + rem;
  const count = Math.max(images.length, 1);
  const visible = stepPx > 0 ? Math.ceil((width || tileWidthPx) / stepPx) + 2 : 4;
  const tiles = useMemo(() => Array.from({ length: Math.max(visible, 2) }, (_, index) => index), [visible]);
  const mask = `linear-gradient(90deg, transparent, #000 ${fade}%, #000 ${100 - fade}%, transparent)`;
  const perspective = Math.max(tileWidthPx * CAMERA, 320);

  if (images.length === 0) return null;

  return (
    <section
      {...rest}
      ref={rootRef}
      className={cn("relative isolate overflow-hidden bg-transparent text-[#ebebeb]", className)}
      style={{
        height: `${Math.max(visualHeight, rem * 7)}px`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <div
        className="flex h-full items-center"
        style={{ perspective: `${perspective}px` }}
      >
        <div
          className="tgh-track flex items-center"
          onAnimationIteration={() => {
            if (reduced) return;
            setOffset((value) => (value + 1) % count);
          }}
          style={{
            gap: `${gap}px`,
            transformStyle: "preserve-3d",
            ["--tgh-axis" as string]: `${axis}deg`,
            ["--tgh-step" as string]: `${stepPx}px`,
            animation: reduced ? "none" : `tgh-shift ${Math.max(speed, 0.8)}s linear infinite`,
          }}
        >
          {tiles.map((tile) => {
            const image = images[(offset + tile) % count];
            return (
              <div
                key={tile}
                className="relative shrink-0"
                style={{
                  width: `${tileWidthPx}px`,
                  height: `${tileHeightPx}px`,
                  transform: `translateZ(${-radius}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {Array.from({ length: SLICES }, (_, slice) => {
                  const angle = ((SLICES - 1) / 2 - slice) * stepDeg;
                  return (
                    <div
                      key={slice}
                      className="absolute top-0 overflow-hidden"
                      style={{
                        left: "50%",
                        width: `${sliceWidth + 1}px`,
                        height: "100%",
                        marginLeft: `${-(sliceWidth + 1) / 2}px`,
                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <img
                        src={image.src}
                        alt=""
                        draggable={false}
                        className="absolute top-0 h-full max-w-none object-cover"
                        style={{
                          width: `${tileWidthPx}px`,
                          left: `${-slice * sliceWidth}px`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {children ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {children}
        </div>
      ) : null}
      <style>{`
        @keyframes tgh-shift {
          from { transform: rotateX(var(--tgh-axis)) translate3d(0, 0, 0); }
          to { transform: rotateX(var(--tgh-axis)) translate3d(calc(-1 * var(--tgh-step)), 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tgh-track { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
