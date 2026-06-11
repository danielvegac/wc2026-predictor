import { useState, useCallback, useRef, useEffect } from "react";
import type { MonteCarloResults } from "../types";
import type { WorkerResponse } from "../workers/monteCarloWorker";

interface WorkerState {
  results: MonteCarloResults | null;
  running: boolean;
  progress: { completed: number; total: number } | null;
}

export function useMonteCarloWorker() {
  const [state, setState] = useState<WorkerState>({
    results: null,
    running: false,
    progress: null,
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

    setState({ results: null, running: true, progress: { completed: 0, total: numSimulations } });

    const worker = new Worker(
      new URL("../workers/monteCarloWorker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

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
        });
        worker.terminate();
      }
    };

    worker.onerror = () => {
      setState((prev) => ({ ...prev, running: false, progress: null }));
      worker.terminate();
    };

    worker.postMessage({ type: "run", numSimulations });
  }, []);

  return { ...state, run };
}
