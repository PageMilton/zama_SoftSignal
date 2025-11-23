/**
 * Utility functions for formatting addresses, dates, numbers, etc.
 */

export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatBalance = (balance: string, decimals = 4): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const then = timestamp * 1000;
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

export const getScoreColor = (score: number, type: 'mood' | 'stress' | 'sleep'): string => {
  if (type === 'mood' || type === 'sleep') {
    // Higher is better
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-amber-600';
    return 'text-red-600';
  } else {
    // stress: lower is better
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-amber-600';
    return 'text-red-600';
  }
};

export const getRiskLevelText = (level: number): string => {
  const levels = ['Low Risk', 'Moderate Risk', 'Elevated Risk', 'High Risk'];
  return levels[level] || 'Unknown';
};

export const getRiskLevelColor = (level: number): string => {
  const colors = ['bg-green-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
  return colors[level] || 'bg-gray-500';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const getEmojiForScore = (score: number): string => {
  if (score >= 9) return '😄';
  if (score >= 7) return '🙂';
  if (score >= 5) return '😐';
  if (score >= 3) return '😟';
  return '😢';
};
