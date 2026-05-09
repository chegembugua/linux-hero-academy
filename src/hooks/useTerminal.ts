import { useState, useCallback, useMemo } from 'react';
import { MODULES } from '../data/modules';
import { Command } from '../types';

interface FileSystemNode {
  type: 'file' | 'dir';
  name: string;
  children?: Record<string, FileSystemNode>;
  content?: string;
}

const INITIAL_FS: Record<string, FileSystemNode> = {
  home: {
    type: 'dir',
    name: 'home',
    children: {
      user: {
        type: 'dir',
        name: 'user',
        children: {
          projects: { type: 'dir', name: 'projects', children: {} },
          docs: {
            type: 'dir',
            name: 'docs',
            children: {
              'readme.txt': { type: 'file', name: 'readme.txt', content: 'Welcome to the Linux Terminal Simulator!' }
            }
          },
          'todo.sh': { type: 'file', name: 'todo.sh', content: '#!/bin/bash\necho "Learn Linux!"' }
        }
      }
    }
  },
  etc: { type: 'dir', name: 'etc', children: {} },
  var: { type: 'dir', name: 'var', children: {} }
};

export function useTerminal() {
  const [cwd, setCwd] = useState('/home/user');
  const [history, setHistory] = useState<string[]>([]);
  const [output, setOutput] = useState<{ type: 'input' | 'output' | 'info'; text: string; dir?: string; commandData?: Command }[]>([]);
  const [fs, setFs] = useState(INITIAL_FS);

  const allCommands = useMemo(() => {
    const cmds: Record<string, Command> = {};
    MODULES.forEach(m => {
      m.commands.forEach(c => {
        cmds[c.name] = c;
      });
    });
    return cmds;
  }, []);

  const getFsAt = (path: string, currentFs: any = fs) => {
    const parts = path.split('/').filter(p => p !== '');
    let current: any = { children: currentFs };
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const resolvePath = (path: string) => {
    if (path === '~') return '/home/user';
    if (path === '/') return '/';
    if (path.startsWith('/')) return path;
    
    const currentParts = cwd.split('/').filter(p => p !== '');
    const newParts = path.split('/').filter(p => p !== '');
    
    for (const part of newParts) {
      if (part === '..') {
        currentParts.pop();
      } else if (part !== '.') {
        currentParts.push(part);
      }
    }
    return '/' + currentParts.join('/');
  };

  const execute = useCallback((cmdLine: string) => {
    const trimmed = cmdLine.trim();
    if (!trimmed) return;

    setHistory(prev => [...prev, trimmed]);
    const lines: { type: 'input' | 'output' | 'info'; text: string; dir?: string; commandData?: Command }[] = [
      { type: 'input', text: trimmed, dir: cwd }
    ];

    const [cmd, ...args] = trimmed.split(' ');
    const cmdData = allCommands[cmd];

    if (cmdData) {
      lines.push({ type: 'info', text: cmdData.description, commandData: cmdData });
    }

    switch (cmd) {
      case 'pwd':
        lines.push({ type: 'output', text: cwd });
        break;
      case 'whoami':
        lines.push({ type: 'output', text: 'user' });
        break;
      case 'clear':
        setOutput([]);
        return;
      case 'ls': {
        const targetPath = args[0] ? resolvePath(args[0]) : cwd;
        const node = getFsAt(targetPath);
        if (node && node.type === 'dir') {
          const contents = Object.keys(node.children || {}).join('  ');
          lines.push({ type: 'output', text: contents });
        } else {
          lines.push({ type: 'output', text: `ls: cannot access '${args[0]}': No such file or directory` });
        }
        break;
      }
      case 'cd': {
        const target = args[0] || '~';
        const targetPath = resolvePath(target);
        const node = getFsAt(targetPath);
        if (node && node.type === 'dir') {
          setCwd(targetPath);
        } else {
          lines.push({ type: 'output', text: `cd: ${target}: No such file or directory` });
        }
        break;
      }
      case 'echo':
        lines.push({ type: 'output', text: args.join(' ') });
        break;
      case 'mkdir': {
        const folderName = args[0];
        if (!folderName) {
          lines.push({ type: 'output', text: 'mkdir: missing operand' });
        } else {
          const pathParts = resolvePath(folderName).split('/').filter(p => p !== '');
          const newFs = { ...fs };
          let current: any = newFs;
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (current[pathParts[i]] && current[pathParts[i]].children) {
              current = current[pathParts[i]].children;
            }
          }
          const name = pathParts[pathParts.length - 1];
          current[name] = { type: 'dir', name, children: {} };
          setFs(newFs);
        }
        break;
      }
      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
          lines.push({ type: 'output', text: 'touch: missing file operand' });
        } else {
          const pathParts = resolvePath(fileName).split('/').filter(p => p !== '');
          const newFs = { ...fs };
          let current: any = newFs;
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (current[pathParts[i]] && current[pathParts[i]].children) {
              current = current[pathParts[i]].children;
            }
          }
          const name = pathParts[pathParts.length - 1];
          current[name] = { type: 'file', name, content: '' };
          setFs(newFs);
        }
        break;
      }
      case 'rm': {
        const target = args[0];
        if (!target) {
          lines.push({ type: 'output', text: 'rm: missing operand' });
        } else {
          const pathParts = resolvePath(target).split('/').filter(p => p !== '');
          const newFs = { ...fs };
          let current: any = newFs;
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (current[pathParts[i]] && current[pathParts[i]].children) {
              current = current[pathParts[i]].children;
            }
          }
          const name = pathParts[pathParts.length - 1];
          delete current[name];
          setFs(newFs);
        }
        break;
      }
      case 'help': {
        const targetCmd = args[0];
        if (targetCmd && allCommands[targetCmd]) {
          lines.push({ type: 'info', text: allCommands[targetCmd].description, commandData: allCommands[targetCmd] });
        } else {
          lines.push({ type: 'output', text: 'Available commands: pwd, ls, cd, whoami, echo, mkdir, touch, rm, clear, help' });
          lines.push({ type: 'output', text: "Type 'help <command>' for detailed info on a specific command." });
        }
        break;
      }
      default:
        if (!cmdData) {
          lines.push({ type: 'output', text: `bash: ${cmd}: command not found` });
        }
    }

    setOutput(prev => [...prev, ...lines]);
  }, [cwd, allCommands]);

  return { cwd, history, output, execute, fs, allCommands };
}

