/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Command {
  name: string;
  description: string;
  syntax: string;
  examples: string[];
  analogy: string;
  commonMistakes?: string[];
  realWorldUsage?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  visualImage?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LabMission {
  id: string;
  title: string;
  description: string;
  objective: string;
  expectedCommands: string[];
  validationFn: (terminalState: any) => boolean;
}

export type Rank = 'Beginner' | 'Linux Explorer' | 'Bash Operator' | 'Junior SysAdmin' | 'Systems Engineer' | 'DevOps Engineer' | 'Cloud Engineer' | 'Senior Cloud Engineer' | 'Infrastructure Architect';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'production' | 'security' | 'performance' | 'networking';
  difficulty: 'junior' | 'mid' | 'senior';
  objective: string;
  hints: string[];
  solutionCommands: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  moduleXp: number;
  lessons: Lesson[];
  commands: Command[];
  quiz: QuizQuestion[];
  lab?: LabMission;
  scenarios?: Scenario[];
  isAdvanced?: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  lastVisit: string;
  completedModules: string[];
  unlockedModules: string[];
  unlockedAchievements: string[];
}
