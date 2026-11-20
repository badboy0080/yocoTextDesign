"use client";

import { useEffect, useRef } from "react";
import type { Plate, Specimen } from "@/lib/home-specimens";
import { PlatePage, SpecimenSheet } from "@/components/home-sheet";

function roleOf(bookIndex: number, index: number, direction: 0 | 1 | -1, count: number) {
  if (direction === 1) {
    if (bookIndex === index) return "leaf";
    if (bookIndex === (index + 1) % count) return "under";
    return "hidden";
  }
  if (bookIndex === index) return "front";
  return "hidden";
}

function PlateImg({ plate }: { plate: Plate }) {
  return (
    <img
      src={plate.src}
      alt=""
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: plate.position,
        transform: plate.zoom ? `scale(${plate.zoom})` : undefined,
        transformOrigin: "center bottom",
      }}
    />
  );
}

function SheetLayer({
  book,
  role,
  backPlate,
}: {
  book: Specimen;
  role: string;
  backPlate: Plate | null;
}) {
  const curling = role === "leaf";
  return (
    <div className={`bk-sheet-layer is-${role}`} aria-hidden={role === "hidden" || role === "under" ? true : undefined}>
      <div className="bk-leaf-hinge">
        <div className="bk-half-face is-front">
          <div className="bk-leaf">
            <SpecimenSheet specimen={book} />
          </div>
          <div className="bk-leaf-shade" />
          {curling ? <div className="bk-leaf-curl" aria-hidden="true" /> : null}
        </div>
        {curling && backPlate ? (
          <div className="bk-half-face is-back">
            <PlatePage plate={backPlate} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function HomeFlipBook({
  books,
  index,
  direction,
  onOpen,
  onDone,
}: {
  books: Specimen[];
  index: number;
  direction: 0 | 1 | -1;
  onOpen: () => void;
  onDone: () => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  const finishing = useRef(false);
  doneRef.current = onDone;
  const count = books.length;
  const current = books[index];
  const incoming = direction === 0 ? null : books[(index + direction + count) % count];

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (direction === 0) {
      finishing.current = false;
      scene.style.setProperty("--turn", "0");
      scene.style.setProperty("--bend", "0");
      return;
    }
    let alive = true;
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      if (!alive) return;
      const raw = Math.min(1, (now - start) / duration);
      const turn = raw * raw * (3 - 2 * raw);
      const bend = Math.sin(raw * Math.PI) * 38;
      scene.style.setProperty("--turn", turn.toFixed(4));
      scene.style.setProperty("--bend", bend.toFixed(2));
      if (raw < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }
      if (finishing.current) return;
      finishing.current = true;
      doneRef.current();
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [direction, index]);

  if (!current?.plate) return null;
  const leftPlate = direction === -1 && incoming?.plate ? incoming.plate : current.plate;

  return (
    <div className="bk-flip-wrap">
      <div className="bk-book">
        <div className="bk-volume">
          <div className="bk-flip-scene" ref={sceneRef}>
            <div className="bk-spread">
              <PlatePage plate={leftPlate} />
              <div className="bk-leaf bk-flip-under" />
            </div>
            <div className="bk-flip-pages">
              {books.map((book, bookIndex) => (
                <SheetLayer
                  key={book.id}
                  book={book}
                  role={roleOf(bookIndex, index, direction, count)}
                  backPlate={direction === 1 && bookIndex === index ? incoming?.plate ?? null : null}
                />
              ))}
            </div>
            {direction === -1 && incoming?.plate ? (
              <div className="bk-leaf-turn is-reverse" aria-hidden="true">
                <div className="bk-leaf-hinge">
                  <div className="bk-half-face is-front">
                    <PlateImg plate={current.plate} />
                    <div className="bk-leaf-curl" aria-hidden="true" />
                  </div>
                  <div className="bk-half-face is-back is-sheet">
                    <div className="bk-leaf">
                      <SpecimenSheet specimen={incoming} />
                    </div>
                  </div>
                  <div className="bk-half-face is-back is-plate">
                    <PlateImg plate={incoming.plate} />
                  </div>
                </div>
              </div>
            ) : null}
            <button type="button" className="bk-flip-open" onClick={onOpen} disabled={direction !== 0}>
              打开
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
