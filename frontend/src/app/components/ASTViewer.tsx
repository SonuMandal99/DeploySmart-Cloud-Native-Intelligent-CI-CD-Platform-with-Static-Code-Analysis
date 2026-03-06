import React, { useState } from 'react';

interface ASTNode {
  type: string;
  name?: string;
  value?: any;
  body?: ASTNode[];
  left?: ASTNode;
  right?: ASTNode;
  operator?: string;
}

function NodeView({ node, depth = 0 }: { node: ASTNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  if (!node) return null;

  const indent = { paddingLeft: `${depth * 12}px` };

  return (
    <div>
      <div className="flex items-center gap-2" style={indent}>
        {node.body || node.left || node.right ? (
          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-slate-300 bg-transparent p-0"
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <div className="text-sm text-slate-200">
          <strong>{node.type}</strong>
          {node.name ? <span className="text-slate-400"> — {node.name}</span> : null}
          {node.value && node.value.type === 'Literal' ? (
            <span className="text-slate-400"> : {String(node.value.value)}</span>
          ) : null}
          {node.operator ? <span className="text-slate-400"> ({node.operator})</span> : null}
        </div>
      </div>

      {open && (
        <div>
          {Array.isArray(node.body) && node.body.map((ch, i) => <NodeView key={i} node={ch} depth={depth + 1} />)}
          {node.left ? <NodeView node={node.left as any} depth={depth + 1} /> : null}
          {node.right ? <NodeView node={node.right as any} depth={depth + 1} /> : null}
          {node.value && typeof node.value === 'object' && !node.value.type ? (
            <pre className="text-xs text-slate-400 ml-6">{JSON.stringify(node.value, null, 2)}</pre>
          ) : null}
        </div>
      )}
    </div>
  );
}

export const ASTViewer: React.FC<{ ast: any | null }> = ({ ast }) => {
  if (!ast) {
    return <div className="p-4 text-slate-400">No AST available.</div>;
  }

  return (
    <div className="p-4 text-slate-100 bg-[#0f1720] h-full overflow-auto">
      {Array.isArray(ast.body) ? (
        ast.body.map((node: ASTNode, i: number) => <NodeView key={i} node={node} />)
      ) : (
        <div className="p-2 text-slate-400">Empty program</div>
      )}
    </div>
  );
};

export default ASTViewer;
