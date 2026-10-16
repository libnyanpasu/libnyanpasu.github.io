import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

interface FrameState {
  inner: RefObject<HTMLDivElement | null>;
  /** In view, motion allowed, and the visitor is not using the demo themselves. */
  playing: boolean;
}

const FrameContext = createContext<FrameState | null>(null);

/**
 * A fixed-height window onto a demo (each card sets `--frame-h`), so nothing inside can change
 * the card's height: tabs, added widgets or a longer diff scroll within the frame instead.
 *
 * It also decides when the demo may play itself (see `Autoplay`): while at least half of it is
 * on screen, and not while the visitor points at, touches or tabs into it.
 */
export function Frame({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [busy, setBusy] = useState(false);
  const reduced = useReducedMotion();
  const resume = useRef(0);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.5,
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearTimeout(resume.current);
    };
  }, []);

  const hold = () => {
    window.clearTimeout(resume.current);
    setBusy(true);
  };
  const release = (after: number) => {
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setBusy(false), after);
  };

  return (
    <div
      ref={host}
      className="m3f-frame"
      onPointerEnter={(event) => event.pointerType === "mouse" && hold()}
      onPointerLeave={(event) => event.pointerType === "mouse" && release(2500)}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") return;
        hold();
        release(8000);
      }}
      onFocus={(event) => event.target.matches(":focus-visible") && hold()}
      onBlur={() => release(2500)}
    >
      <div ref={inner} className="m3f-frame-inner">
        <FrameContext.Provider value={{ inner, playing: inView && !busy && !reduced }}>
          {children}
        </FrameContext.Provider>
      </div>
    </div>
  );
}

/** Whether the surrounding frame is playing its demo. */
export function useFramePlaying() {
  return useContext(FrameContext)?.playing ?? false;
}

export interface Cue {
  /** CSS selector inside the frame; the cue is skipped while nothing matches. */
  at: string;
  run?: () => void;
  /** Typed into a field one character at a time after the click. */
  type?: { text: string; set: (value: string) => void };
  /** Time to look at the result before the next cue, in ms. */
  hold?: number;
}

/**
 * Scroll `target` into view inside the frame's own scroll areas (never the page), so the pointer
 * never clicks something hidden. Returns whether anything had to move.
 */
function reveal(target: Element, frame: HTMLElement) {
  let moved = false;
  for (let node = target.parentElement; node && node !== frame; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (!/auto|scroll/.test(overflowY) || node.scrollHeight <= node.clientHeight) continue;
    const box = node.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const pad = 24;
    let delta = 0;
    if (rect.top < box.top + pad) delta = rect.top - box.top - pad;
    else if (rect.bottom > box.bottom - pad - 48) delta = rect.bottom - box.bottom + pad + 48;
    if (delta) {
      node.scrollBy({ top: delta, behavior: "smooth" });
      moved = true;
    }
  }
  return moved;
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(signal.reason);
    });
  });

/**
 * A pretend mouse that walks a demo through `script`, looping. Each cue moves the pointer to its
 * target, presses, then runs the cue's state change, so the demo switches exactly as if clicked.
 * `reset` returns the demo to its first state before every loop. When the frame stops playing
 * the pointer fades out and picks up from the same cue later.
 */
export function Autoplay({ script, reset }: { script: Cue[]; reset?: () => void }) {
  const frame = useContext(FrameContext);
  const playing = frame?.playing ?? false;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [press, setPress] = useState(0);
  const latest = useRef({ script, reset });
  const step = useRef(0);
  latest.current = { script, reset };

  useEffect(() => {
    const inner = frame?.inner.current;
    if (!playing || !inner) return;
    const controller = new AbortController();
    const { signal } = controller;

    const locate = (element: Element) => {
      const box = inner.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2 - box.left, y: rect.top + rect.height / 2 - box.top };
    };

    (async () => {
      setPos((current) => current ?? { x: inner.offsetWidth * 0.82, y: inner.offsetHeight * 0.9 });
      await sleep(900, signal);
      for (;;) {
        const { script: cues, reset: restart } = latest.current;
        if (step.current === 0) {
          restart?.();
          inner.querySelectorAll("*").forEach((node) => {
            if (node.scrollTop > 0) node.scrollTo({ top: 0, behavior: "smooth" });
          });
          await sleep(500, signal);
        }
        const cue = cues[step.current];
        const target = inner.querySelector(cue.at);
        if (target) {
          if (reveal(target, inner)) await sleep(380, signal);
          setPos(locate(target));
          await sleep(820, signal);
          setPress((n) => n + 1);
          await sleep(160, signal);
          cue.run?.();
          if (cue.type) {
            for (let i = 1; i <= cue.type.text.length; i++) {
              cue.type.set(cue.type.text.slice(0, i));
              await sleep(90, signal);
            }
          }
          await sleep(cue.hold ?? 1600, signal);
        }
        step.current = (step.current + 1) % cues.length;
      }
    })().catch(() => undefined);

    return () => controller.abort();
  }, [playing, frame]);

  return (
    <AnimatePresence>
      {playing && pos && (
        <motion.div
          className="m3f-cursor"
          aria-hidden="true"
          initial={{ opacity: 0, x: pos.x, y: pos.y }}
          animate={{ opacity: 1, x: pos.x, y: pos.y }}
          exit={{ opacity: 0 }}
          transition={{
            x: { type: "spring", stiffness: 90, damping: 18, mass: 0.9 },
            y: { type: "spring", stiffness: 90, damping: 18, mass: 0.9 },
            opacity: { duration: 0.3 },
          }}
        >
          <AnimatePresence>
            {press > 0 && (
              <motion.span
                key={press}
                className="m3f-cursor-ring"
                initial={{ opacity: 0.55, scale: 0.3 }}
                animate={{ opacity: 0, scale: 1.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
              />
            )}
          </AnimatePresence>
          <motion.svg
            key={`arrow-${press}`}
            viewBox="0 0 24 24"
            initial={{ scale: 0.82 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <path d="M5 2.5v17.2l4.4-4.1 2.8 6.4 3-1.3-2.8-6.3H18L5 2.5Z" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
