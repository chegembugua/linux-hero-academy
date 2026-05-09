import { Module } from '../types.ts';
import { ADVANCED_MODULES } from './advancedModules.ts';

export const MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Introduction to Linux & Terminal',
    description: 'Learn the fundamentals of Linux, Bash, and why the terminal is the backbone of cloud engineering.',
    shortDescription: 'The "Why" and "What" of Linux.',
    icon: 'Terminal',
    moduleXp: 100,
    lessons: [
      {
        id: 'l1',
        title: 'What is Linux?',
        content: `Linux is an operating system kernel that powers everything from smartphones to supercomputers. Unlike Windows or macOS, Linux is open-source, meaning anyone can see and change its code.

In the cloud, Linux is king. Over 90% of the world's top 1 million servers run on Linux. Whether you're using AWS, Azure, or Google Cloud, you'll be interacting with Linux systems.

**Cloud Engineer Tip:**
In AWS, when you launch an "EC2 Instance", 9 times out of 10, you'll be choosing a Linux distribution like Amazon Linux or Ubuntu.`
      },
      {
        id: 'l2',
        title: 'GUI vs CLI',
        content: `GUI (Graphical User Interface) is what you use most of the time—clicking icons and windows.
CLI (Command Line Interface) is the terminal.

Why use CLI?
1. **Speed**: Many tasks are faster via commands.
2. **Control**: You can do things the GUI doesn't allow.
3. **Automation**: You can write scripts to do repetitive work.
4. **Remote Access**: Cloud servers often don't have a screen; you connect via terminal.

**Interview Prep:**
"Why do we use Linux in the cloud?"
Answer: Because it is lightweight, highly secure, scalable, and most importantly, it can be managed entirely through the command line, which allows for massive automation (DevOps).`
      }
    ],
    commands: [],
    quiz: [
      {
        id: 'q1',
        question: 'What percentage of the world\'s top servers run on Linux?',
        options: ['~20%', '~50%', '~90%', '~10%'],
        correctAnswer: 2,
        explanation: 'Linux dominates the server and cloud world due to its stability, security, and open-source nature.'
      },
      {
        id: 'q2',
        question: 'What does "CLI" stand for?',
        options: ['Command Line Interface', 'Cloud Linux Infrastructure', 'Computer Logic Integration', 'Central Linux Instance'],
        correctAnswer: 0,
        explanation: 'CLI stands for Command Line Interface, where you interact with the computer using text-based commands.'
      }
    ]
  },
  {
    id: 'm2',
    title: 'First Terminal Experience',
    description: 'Get your hands on the terminal. Learn to speak the language of commands.',
    shortDescription: 'Basic commands and terminal structure.',
    icon: 'Code2',
    moduleXp: 150,
    lessons: [
      {
        id: 'l3',
        title: 'The Terminal Shell',
        content: `When you open a terminal, you are interacting with a program called a "shell". The most common shell is **Bash** (Bourne Again SHell).

The prompt (usually ending in '$') means the computer is waiting for your command.`
      }
    ],
    commands: [
      {
        name: 'pwd',
        description: 'Print Working Directory. Shows you where you are.',
        syntax: 'pwd',
        examples: ['pwd'],
        analogy: 'Like looking at a map and seeing the "You Are Here" pin.',
        realWorldUsage: 'If you ever get lost in deep folders on a server, pwd tells you exactly where you are.',
        commonMistakes: ['Typing "pd" instead of "pwd".', 'Typing "PWD" (remember Linux is case-sensitive!)']
      },
      {
        name: 'ls',
        description: 'List contents of the current directory.',
        syntax: 'ls [options]',
        examples: ['ls', 'ls -l', 'ls -a'],
        analogy: 'Opening a drawer to see what\'s inside.',
        realWorldUsage: 'The first thing most engineers do when they enter a new server is type "ls" to see what files are there.',
        commonMistakes: ['Confusing lowercase L (l) with the number 1.', 'Forgetting that "ls -a" shows hidden files.']
      },
      {
        name: 'whoami',
        description: 'Shows the username of the current user.',
        syntax: 'whoami',
        examples: ['whoami'],
        analogy: 'Asking the computer, "Which ID badge am I wearing right now?"',
        realWorldUsage: 'Useful on shared servers to verify if you are logged in as root or a normal user.',
        commonMistakes: ['Typing "who am i" as three separate words (though that is a different valid command on some systems, it works differently).']
      }
    ],
    quiz: [
      {
        id: 'q3',
        question: 'Which command shows you which directory you are currently in?',
        options: ['ls', 'cd', 'pwd', 'whoami'],
        correctAnswer: 2,
        explanation: 'pwd stands for Print Working Directory.'
      }
    ],
    lab: {
      id: 'lab1',
      title: 'The Explorer',
      description: 'Use the terminal to find out where you are and who you are.',
      objective: 'Run "pwd" then "whoami".',
      expectedCommands: ['pwd', 'whoami'],
      validationFn: (state: any) => state.history.includes('pwd') && state.history.includes('whoami')
    }
  },
  {
    id: 'm3',
    title: 'Navigating Linux',
    description: 'Master the art of moving between directories and understanding the file system hierarchy.',
    shortDescription: 'Moving around the file system.',
    icon: 'Navigation',
    moduleXp: 200,
    lessons: [
      {
        id: 'l4',
        title: 'The Root and Home',
        content: `In Linux, everything starts from the Root directory, represented by a single forward slash: / .

Your personal files are kept in your Home directory, usually /home/username or ~ .`
      }
    ],
    commands: [
      {
        name: 'cd',
        description: 'Change Directory. Move to a different folder.',
        syntax: 'cd [path]',
        examples: ['cd Documents', 'cd ..', 'cd ~'],
        analogy: 'Walking from one room to another in a house.'
      }
    ],
    quiz: [],
    lab: {
        id: 'lab2',
        title: 'Moving Around',
        description: 'Navigate to the "projects" directory.',
        objective: 'Use "cd" to enter the "projects" folder.',
        expectedCommands: ['cd projects'],
        validationFn: (state: any) => state.cwd === '/home/user/projects'
      }
  },
  {
    id: 'm4',
    title: 'File Management',
    description: 'Learn to create, copy, move, and delete files like a pro.',
    shortDescription: 'Create, copy, move, delete.',
    icon: 'Folder',
    moduleXp: 250,
    lessons: [
      {
        id: 'l5',
        title: 'File Basics',
        content: `Managing files is the bread and butter of cloud engineering. You'll use these commands daily to organize servers and deploy apps.`
      }
    ],
    commands: [
      { 
        name: 'touch', 
        description: 'Create an empty file.', 
        syntax: 'touch [file]', 
        examples: ['touch app.log'], 
        analogy: 'Placing a blank sheet of paper on a desk.',
        realWorldUsage: 'Used to initialize log files or heartbeat files to verify disk write permissions.',
        commonMistakes: ['Thinking touch works like an editor; it only creates the file.']
      },
      { 
        name: 'mkdir', 
        description: 'Make a new directory.', 
        syntax: 'mkdir [dir]', 
        examples: ['mkdir projects', 'mkdir -p web/src/assets'], 
        analogy: 'Building a new shelf.',
        realWorldUsage: 'Organizing complex application structures in deployment pipelines.',
        commonMistakes: ['Forgetting the -p flag when creating nested directories.']
      },
      { 
        name: 'rm', 
        description: 'Remove files or directories.', 
        syntax: 'rm [file]', 
        examples: ['rm log.txt', 'rm -rf node_modules'], 
        analogy: 'Throwing something into a shredder.',
        realWorldUsage: 'Cleaning up build artifacts or temporary files after a task.',
        commonMistakes: ['Running "rm -rf /" (NEVER do this on a real system!)']
      },
      { 
        name: 'cp', 
        description: 'Copy files.', 
        syntax: 'cp [source] [dest]', 
        examples: ['cp config.env .env'], 
        analogy: 'Using a photocopier.',
        realWorldUsage: 'Backing up configuration files before editing them.'
      }
    ],
    quiz: [],
  },
  {
    id: 'm5',
    title: 'Permissions & Users',
    description: 'Understand the security model of Linux. Who can do what?',
    shortDescription: 'Superusers and permissions.',
    icon: 'Shield',
    moduleXp: 300,
    lessons: [
      {
        id: 'l6',
        title: 'The Root User',
        content: `The "root" user is like the god of the system. They can do anything. Most of the time, you use "sudo" to borrow root powers temporarily.`
      }
    ],
    commands: [
      { name: 'sudo', description: 'Execute as superuser.', syntax: 'sudo [cmd]', examples: ['sudo apt update'], analogy: 'Getting a manager\'s keys to open a locked door.' },
      { name: 'chmod', description: 'Change file permissions.', syntax: 'chmod [mode] [file]', examples: ['chmod +x script.sh'], analogy: 'Changing the locks on your front door.' }
    ],
    quiz: [],
  },
  {
    id: 'm6',
    title: 'System Monitoring',
    description: 'Keep an eye on processes, CPU, and RAM usage.',
    shortDescription: 'Monitoring server health.',
    icon: 'Activity',
    moduleXp: 250,
    lessons: [],
    commands: [
       { name: 'top', description: 'Display Linux processes.', syntax: 'top', examples: ['top'], analogy: 'Opening the Task Manager on a server.' },
       { name: 'df', description: 'Show disk space usage.', syntax: 'df -h', examples: ['df -h'], analogy: 'Checking how much gas is left in the tank.' }
    ],
    quiz: []
  },
  {
    id: 'm7',
    title: 'Networking Commands',
    description: 'Connect to servers and troubleshoot connections.',
    shortDescription: 'IPs, SSH, and downloads.',
    icon: 'Globe',
    moduleXp: 350,
    lessons: [],
    commands: [
       { name: 'ping', description: 'Check network connectivity.', syntax: 'ping [host]', examples: ['ping google.com'], analogy: 'Shouting "Hello?" to see if someone answers.' },
       { name: 'ssh', description: 'Secure Shell connection.', syntax: 'ssh [user]@[host]', examples: ['ssh root@1.1.1.1'], analogy: 'Using a portal to teleport into another building.' }
    ],
    quiz: []
  },
  {
    id: 'm8',
    title: 'Package Management',
    description: 'Install and update software using apt.',
    shortDescription: 'Installing software.',
    icon: 'Package',
    moduleXp: 300,
    lessons: [],
    commands: [
      { name: 'apt', description: 'Advanced Package Tool.', syntax: 'sudo apt install [pkg]', examples: ['sudo apt install nginx'], analogy: 'A digital app store for your terminal.' }
    ],
    quiz: []
  },
  {
    id: 'm9',
    title: 'Bash Scripting Basics',
    description: 'Automate everything. Write your first script.',
    shortDescription: 'Variables and scripts.',
    icon: 'Zap',
    moduleXp: 500,
    lessons: [
       {
         id: 'l7',
         title: 'What is a Script?',
         content: `A script is just a text file with a list of commands.

Always start with the "Shebang": #!/bin/bash`
       }
    ],
    commands: [],
    quiz: []
  },
  {
    id: 'm10',
    title: 'Advanced Terminal Skills',
    description: 'Master pipes, redirection, and grep.',
    shortDescription: 'Pipes and Redirection.',
    icon: 'Cpu',
    moduleXp: 400,
    lessons: [],
    commands: [
       { name: 'grep', description: 'Search text for patterns.', syntax: 'grep [pat] [file]', examples: ['grep "error" log.txt'], analogy: 'Using a highlighter to find specific words.' },
       { name: 'pipe', description: 'Pass output to next cmd.', syntax: 'cmd1 | cmd2', examples: ['ls | grep "txt"'], analogy: 'A factory assembly line.' }
    ],
    quiz: []
  },
  {
    id: 'm11',
    title: 'Git & Developer Tools',
    description: 'Version control for your code.',
    shortDescription: 'Git workflows.',
    icon: 'GitBranch',
    moduleXp: 400,
    lessons: [],
    commands: [
       { name: 'git', description: 'Version control system.', syntax: 'git init', examples: ['git status'], analogy: 'A time machine for your code files.' }
    ],
    quiz: []
  },
  {
    id: 'm12',
    title: 'Linux for Cloud Engineering',
    description: 'Docker, Nginx, and cloud workflows.',
    shortDescription: 'The Cloud Final boss.',
    icon: 'Cloud',
    moduleXp: 600,
    lessons: [
      {
        id: 'l8',
        title: 'The Cloud Era',
        content: `In the cloud, you rarely interact with physical hardware. You manage "Infrastructure as Code" (IaC). Linux is the engine underneath tools like Terraform, Ansible, and Kubernetes.

**Pro Mission:**
Next time you use a Cloud Provider, try to find the "Serial Console" or "Cloud Shell". You'll find a Linux terminal exactly like this one.

**Career Roadmap:**
Linux -> Bash -> Git -> Networking -> Docker -> AWS -> Kubernetes -> DevOps Specialist.`
      }
    ],
    commands: [
      {
        name: 'docker',
        description: 'Run commands in containers.',
        syntax: 'docker run <image>',
        examples: ['docker run nginx', 'docker ps'],
        analogy: 'Running a pre-packaged miniature factory inside your building.',
        realWorldUsage: 'The standard for modern application deployment.'
      }
    ],
    quiz: []
  },
  ...ADVANCED_MODULES
];
