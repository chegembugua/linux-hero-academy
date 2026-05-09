import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronDown, Folder, FileText, Terminal } from 'lucide-react';

interface FSNode {
  type: 'file' | 'dir';
  name: string;
  children?: Record<string, FSNode>;
  content?: string;
  permissions?: string;
}

interface FileVisualizerProps {
  fs: Record<string, FSNode>;
  cwd: string;
}

const NodeItem = ({ node, name, depth, isCurrent }: { node: FSNode; name: string; depth: number; isCurrent: boolean; key?: string }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="select-none">
      <motion.div
        whileHover={{ x: 4 }}
        className={`flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer text-sm transition-colors ${
          isCurrent ? 'bg-green-500/10 text-green-400 font-bold' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={() => node.type === 'dir' && setIsOpen(!isOpen)}
      >
        <span className="w-4 flex items-center justify-center">
          {node.type === 'dir' ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-1 h-1 rounded-full bg-gray-600" />
          )}
        </span>
        {node.type === 'dir' ? <Folder size={14} className={isCurrent ? 'text-green-500' : 'text-blue-500/70'} /> : <FileText size={14} className="text-gray-500" />}
        <span className="truncate">{name}</span>
        {node.permissions && (
          <span className="text-[10px] text-gray-600 font-mono ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {node.permissions}
          </span>
        )}
      </motion.div>
      
      {node.type === 'dir' && isOpen && node.children && (
        <div>
          {Object.entries(node.children).map(([childName, childNode]) => (
             <NodeItem 
                key={childName} 
                node={childNode} 
                name={childName} 
                depth={depth + 1} 
                isCurrent={false} // Would need recursive path check for true accuracy
             />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileVisualizer({ fs, cwd }: FileVisualizerProps) {
  return (
    <div className="h-full bg-[#0d1117]/50 rounded-xl border border-gray-800 p-4 overflow-y-auto no-scrollbar group">
      <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
        <Terminal size={14} className="text-gray-500" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Filesystem Explorer</h3>
      </div>
      <div className="space-y-0.5">
        {Object.entries(fs).map(([name, node]) => (
          <NodeItem key={name} node={node} name={name} depth={0} isCurrent={cwd.includes(name)} />
        ))}
      </div>
    </div>
  );
}
