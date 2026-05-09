export interface MentorFeedback {
  type: 'hint' | 'explanation' | 'encouragement' | 'correction';
  message: string;
  suggestion?: string;
}

export async function getMentorFeedback(
  lastCommand: string,
  output: string,
  context: { 
    moduleTitle: string; 
    objective: string; 
    history: string[];
    commonMistakes?: string[];
  }
): Promise<MentorFeedback> {
  try {
    const response = await fetch('/api/mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastCommand, output, context })
    });
    
    if (!response.ok) throw new Error("Server error");
    return await response.json();
  } catch (error) {
    // Fallback to local logic if server/AI is offline
    const cmd = lastCommand.trim();
    const [cmdName] = cmd.split(' ');
    
    return {
      type: 'explanation',
      message: `Great use of '${cmdName}'. In a real cloud environment, this is how you'd start exploring a new server instance. Building habit is key.`,
    };
  }
}

export function getLocalMentorFeedback(
  lastCommand: string,
  output: string,
  context: { 
    moduleTitle: string; 
    objective: string; 
    history: string[];
    commonMistakes?: string[];
  }
): MentorFeedback {
  const cmd = lastCommand.trim();
  const [cmdName] = cmd.split(' ');

  // 1. Check for command not found (implied by output or missing command)
  if (output.includes('command not found')) {
    if (context.commonMistakes && context.commonMistakes.length > 0) {
      return {
        type: 'correction',
        message: `It looks like you made a common slip! ${context.commonMistakes[0]}`,
        suggestion: cmdName
      };
    }
    return {
      type: 'correction',
      message: `I don't recognize the command '${cmdName}'. In Linux, everything is case-sensitive and spelling matters. Try typing 'help' to see what's available.`,
    };
  }

  // 2. Proactive "Common Mistake" detection if command exists but might be misused
  if (context.commonMistakes && Math.random() > 0.5) {
    return {
      type: 'hint',
      message: `Pro Tip: Remember that ${context.commonMistakes[0].toLowerCase()}`,
    };
  }

  // 3. Senior Engineer check-in
  if (context.history.length % 5 === 0) {
    const proTips = [
      "Always check your logs first when something breaks. It's the #1 rule in production.",
      "In the cloud, you should never pet your servers. Treat them like cattle, not pets—automate everything.",
      "Security is everyone's job. Keep your permissions tight (755 or 644) unless specifically needed.",
      "If you find yourself typing a command three times, it's time to write a Bash script."
    ];
    return {
      type: 'encouragement',
      message: `Senior Engineer Check-in: ${proTips[Math.floor(Math.random() * proTips.length)]}`,
    };
  }

  return {
    type: 'explanation',
    message: `Affirmative. Using '${cmdName}' is a standard operation in any Infrastructure-as-Code pipeline. You're building solid engineering habits.`,
  };
}
