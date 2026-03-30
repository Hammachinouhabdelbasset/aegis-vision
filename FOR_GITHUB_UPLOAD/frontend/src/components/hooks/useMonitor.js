import { useState, useEffect, useRef } from 'react';
import { tickSimulation, initialSimState } from '../../utils/simulation';

export const useMonitor = () => {
  const [simState, setSimState] = useState(initialSimState);
  const [isConnected, setIsConnected] = useState(false);

  // Try to connect to real WebSocket; fall back to simulation
  const wsRef = useRef(null);
  const simIntervalRef = useRef(null);

  useEffect(() => {
    let wsConnected = false;

    try {
      const ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        wsConnected = true;
        setIsConnected(true);
        // Stop simulation when real WS connects
        if (simIntervalRef.current) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
        }
      };

      let lastMessageTime = 0;

      ws.onmessage = (event) => {
        const now = performance.now();
        if (now - lastMessageTime < 80) return; // Cap to ~12.5 FPS for UI stability
        lastMessageTime = now;
        try {
          const msg = JSON.parse(event.data);
          if (msg?.data) setSimState(prev => ({ ...prev, ...msg.data }));
        } catch (_) {}
      };

      ws.onerror = () => {
        // WS failed — use simulation
        startSim();
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (!wsConnected) startSim();
      };
    } catch (_) {
      startSim();
    }

    function startSim() {
      setIsConnected(false);
      simIntervalRef.current = setInterval(() => {
        setSimState(prev => tickSimulation(prev));
      }, 100);
    }

    // Always start sim immediately in case WS doesn't connect quickly
    simIntervalRef.current = setInterval(() => {
      if (!wsConnected) {
        setSimState(prev => tickSimulation(prev));
      }
    }, 100);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  return { state: simState, isConnected };
};
