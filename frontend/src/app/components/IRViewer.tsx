import React from 'react';

export const IRViewer: React.FC<{ ir: string[] }> = ({ ir }) => {
  return (
    <div className="p-3 bg-[#0b1220] text-slate-100 h-full overflow-auto">
      <div className="font-mono text-sm">
        {(!ir || ir.length === 0) && <div className="text-slate-400">No IR generated.</div>}
        {ir && ir.length > 0 && (
          <ol className="list-decimal pl-6">
            {ir.map((ins, i) => (
              <li key={i} className="leading-6 text-slate-200">
                <span className="text-slate-400 mr-3">{String(i + 1).padStart(2, ' ')}:</span>
                <span className="font-mono">{ins}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default IRViewer;
