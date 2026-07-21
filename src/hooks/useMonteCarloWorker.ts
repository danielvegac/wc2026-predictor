import { useState, useCallback, useRef, useEffect } from "react";
import type { MonteCarloResults } from "../types";
import type { WorkerResponse } from "../workers/monteCarloWorker";

interface WorkerState {
  results: MonteCarloResults | null;
  running: boolean;
  progress: { completed: number; total: number } | null;
  error: string | null;
}

export function useMonteCarloWorker() {
  const [state, setState] = useState<WorkerState>({
    results: null,
    running: false,
    progress: null,
    error: null,
  });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const run = useCallback((numSimulations: number = 10_000) => {
    // Terminate previous worker if still running
    workerRef.current?.terminate();

    setState({
      results: null,
      running: true,
      progress: { completed: 0, total: numSimulations },
      error: null,
    });

    const worker = new Worker(
      new URL("../workers/monteCarloWorker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    const fail = (message: string) => {
      console.error("[useMonteCarloWorker] simulation failed:", message);
      setState((prev) => ({ ...prev, running: false, progress: null, error: message }));
      worker.terminate();
    };

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === "progress") {
        setState((prev) => ({
          ...prev,
          progress: { completed: e.data.completed!, total: e.data.total! },
        }));
      } else if (e.data.type === "result") {
        setState({
          results: e.data.results!,
          running: false,
          progress: null,
          error: null,
        });
        worker.terminate();
      } else if (e.data.type === "error") {
        fail(e.data.error ?? "Simulation failed");
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      fail(e.message || "Simulation worker crashed");
    };

    worker.onmessageerror = () => {
      fail("Failed to deserialize simulation results");
    };

    worker.postMessage({ type: "run", numSimulations });
  }, []);

  return { ...state, run };
}
