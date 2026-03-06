import React, { useEffect, useRef, useState } from 'react';

export const DeploymentLogs: React.FC<{ logs: string[]; animate?: boolean; status?: string }> = ({ logs = [], animate = true, status }) => {
  const [visible, setVisible] = useState<string[]>([]);
  const idxRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible([]);
    idxRef.current = 0;
    if (!animate) {
      setVisible(logs);
      return;
    }
    const t = setInterval(() => {
      if (idxRef.current >= logs.length) {
        clearInterval(t);
        return;
      }
      setVisible((s) => [...s, logs[idxRef.current]]);
      idxRef.current++;
    }, 400);
    return () => clearInterval(t);
  }, [logs, animate]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visible]);

  return (
    <div className="p-3 bg-[#0a0b0f] text-slate-100 font-mono h-72 overflow-auto border-t border-[#1f2937]" ref={containerRef}>
      {visible.map((l, i) => (
        <div key={i} className="text-sm leading-6 text-slate-200">{l}</div>
      ))}
      <div className="mt-2">
        {status === 'DEPLOYED' && <span className="text-green-400">🟢 DEPLOYED</span>}
        {status === 'BLOCKED' && <span className="text-red-400">🔴 BLOCKED</span>}
      </div>
    </div>
  );
}

export default DeploymentLogs;
