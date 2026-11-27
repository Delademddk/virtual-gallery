"use client";
import { useRef, type RefObject, type PointerEvent } from "react";
import type { NavigationInput } from "../three/controls/FirstPerson";

export default function TouchMovement({
  input,
}: {
  input: RefObject<NavigationInput>;
}) {
  const held = useRef(new Set<string>());
  function update() {
    input.current.move.x =
      Number(held.current.has("right")) - Number(held.current.has("left"));
    input.current.move.y =
      Number(held.current.has("back")) - Number(held.current.has("forward"));
  }
  function release(name: string) {
    held.current.delete(name);
    update();
  }
  const directions = [
    { name: "forward", label: "Walk forward", text: "↑" },
    { name: "left", label: "Walk left", text: "←" },
    { name: "back", label: "Walk backward", text: "↓" },
    { name: "right", label: "Walk right", text: "→" },
  ];
  return (
    <div
      className="touch-movement"
      role="group"
      aria-label="Touch movement controls"
    >
      <span>MOVE</span>
      <div>
        {directions.map(({ name, label, text }) => (
          <button
            key={name}
            className={`touch-${name}`}
            aria-label={label}
            onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              held.current.add(name);
              update();
            }}
            onPointerUp={() => release(name)}
            onPointerCancel={() => release(name)}
            onLostPointerCapture={() => release(name)}
            onBlur={() => release(name)}
            onKeyDown={(e) => {
              if (e.code === "Space" || e.code === "Enter") {
                e.preventDefault();
                held.current.add(name);
                update();
              }
            }}
            onKeyUp={() => release(name)}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
