import { Module } from '../types';

export const ADVANCED_MODULES: Module[] = [
  {
    id: 'adv1',
    title: 'Linux Systems Administration',
    shortDescription: 'Master services, security, and performance.',
    description: 'Learn how to manage production servers, configure firewalls, and monitor system performance like a pro.',
    icon: '🛠️',
    moduleXp: 1200,
    isAdvanced: true,
    lessons: [
      {
        id: 'l1',
        title: 'Mastering Systemd',
        content: 'Systemd is the first process that starts on Linux. It manages all services. Cloud engineers use it to ensure web servers and databases stay running.'
      }
    ],
    commands: [
      {
        name: 'systemctl',
        description: 'Manage system services.',
        syntax: 'systemctl [action] [service]',
        examples: ['systemctl start nginx', 'systemctl status docker'],
        analogy: 'The master control panel for all the workers in your building.',
        realWorldUsage: 'Used to restart failed applications on production servers.'
      }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'The Ghost in the Web Server',
        description: 'The production web server has stopped responding. Customers are complaining.',
        category: 'production',
        difficulty: 'junior',
        objective: 'Check the status of the nginx service and restart it.',
        hints: ['Try checking the status first.', 'Use systemctl.'],
        solutionCommands: ['systemctl status nginx', 'systemctl start nginx']
      }
    ],
    quiz: []
  },
  {
    id: 'adv2',
    title: 'Docker & Containerization',
    shortDescription: 'Package and deploy apps anywhere.',
    description: 'Containers are the backbone of modern DevOps. Scale your infrastructure and simplify deployments.',
    icon: '🐳',
    moduleXp: 1500,
    isAdvanced: true,
    lessons: [
      {
        id: 'l1',
        title: 'Why Docker?',
        content: 'Docker solves the "it works on my machine" problem by bundling the app with its entire environment.'
      }
    ],
    commands: [
      {
        name: 'docker',
        description: 'The Docker CLI.',
        syntax: 'docker [command]',
        examples: ['docker ps', 'docker build -t app .'],
        analogy: 'Standardizing your factory into portable containers.',
        realWorldUsage: '95% of modern cloud apps run inside containers.'
      }
    ],
    scenarios: [
      {
        id: 's2',
        title: 'The Crashing Container',
        description: 'A critical microservice is constantly restarting in production.',
        category: 'production',
        difficulty: 'mid',
        objective: 'Inspect the logs of the running container to find the error.',
        hints: ['Use docker ps to find the ID', 'Use docker logs.'],
        solutionCommands: ['docker ps', 'docker logs [id]']
      }
    ],
    quiz: []
  },
  {
    id: 'adv3',
    title: 'Infrastructure as Code',
    shortDescription: 'Define your servers with text files.',
    description: 'Learn Terraform and Ansible to build massive cloud environments without clicking in a console.',
    icon: '🏗️',
    moduleXp: 2000,
    isAdvanced: true,
    lessons: [],
    commands: [],
    quiz: []
  }
];
