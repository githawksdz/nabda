import { Share2 } from "lucide-react";

export function SlideTwoVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <article className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-surface-container-high opacity-60 blur-2xl"
        />

        <div className="z-10 flex w-full items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-medium tracking-wide text-on-surface-variant">
              Algorithme dynamique
            </span>
          </div>
          <Share2
            className="size-4 text-on-surface-variant/70"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>

        <div className="relative my-2 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
          <svg
            aria-hidden
            className="h-auto w-[82%] max-h-[200px] text-on-surface"
            viewBox="-28 -8 336 256"
            preserveAspectRatio="xMidYMid meet"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M140 44V76"
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity="0.15"
              strokeWidth="1.5"
            />
            <path
              d="M140 76C140 92 78 96 78 116V130"
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity="0.15"
              strokeWidth="1.5"
            />
            <path
              d="M140 76C140 92 202 96 202 116V130"
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />
            <path
              d="M202 162V184"
              stroke="currentColor"
              strokeLinecap="round"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />

            <rect fill="#F0EDF0" height="28" rx="14" width="96" x="92" y="16" />
            <circle cx="106" cy="30" fill="#1C1B1D" r="4" />
            <rect
              fill="#1C1B1D"
              fillOpacity="0.75"
              height="6"
              rx="3"
              width="55"
              x="117"
              y="27"
            />

            <circle cx="140" cy="76" fill="#77767B" r="3" />

            <g opacity="0.6">
              <rect
                fill="#F6F2F5"
                height="32"
                rx="10"
                width="96"
                x="30"
                y="130"
              />
              <rect
                fill="#77767B"
                fillOpacity="0.5"
                height="5"
                rx="2.5"
                width="42"
                x="42"
                y="141"
              />
              <rect
                fill="#77767B"
                fillOpacity="0.3"
                height="4"
                rx="2"
                width="60"
                x="42"
                y="149"
              />
            </g>

            <rect
              fill="#1C1B1D"
              height="32"
              rx="10"
              width="96"
              x="154"
              y="130"
            />
            <circle cx="168" cy="146" fill="#FFFFFF" r="3.5" />
            <rect fill="#FFFFFF" height="6" rx="3" width="54" x="178" y="143" />

            <rect
              fill="#F0EDF0"
              height="44"
              rx="12"
              width="116"
              x="144"
              y="184"
            />
            <path
              d="M158 206L169 206L173 198L177 214L181 202L184 206L200 206"
              stroke="#1C1B1D"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <rect
              fill="#1C1B1D"
              fillOpacity="0.8"
              height="5"
              rx="2.5"
              width="38"
              x="208"
              y="201"
            />
            <rect
              fill="#77767B"
              fillOpacity="0.5"
              height="4"
              rx="2"
              width="24"
              x="208"
              y="209"
            />
          </svg>
        </div>

        <div className="flex w-full items-center justify-between pt-2">
          <span className="text-[11px] font-medium tracking-wide text-on-surface-variant">
            Temps d&apos;accès
          </span>
          <span className="text-[11px] font-semibold tracking-tight text-on-surface">
            &lt; 1.8s
          </span>
        </div>
      </article>
    </div>
  );
}
