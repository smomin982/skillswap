import { format, formatDistance, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatSkillLevel = (level) => {
  const levels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
  };
  return levels[level] || level;
};

export const getSkillLevelColor = (level) => {
  const colors = {
    beginner: '#10b981', // green
    intermediate: '#f59e0b', // amber
    advanced: '#ef4444', // red
    expert: '#8b5cf6', // purple
  };
  return colors[level] || '#6366f1';
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    accepted: '#10b981',
    rejected: '#ef4444',
    active: '#3b82f6',
    completed: '#8b5cf6',
    cancelled: '#6b7280',
  };
  return colors[status] || '#6366f1';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const generateAvatar = (name) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
    '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
  ];
  
  const initials = getInitials(name);
  const colorIndex = name.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  return {
    initials,
    color,
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};

export const sortByDate = (array, key, order = 'desc') => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

export const calculateMatchPercentage = (user, currentUser) => {
  // Simplified matching algorithm for frontend display
  let score = 0;
  let maxScore = 100;

  // Check skill matches
  const userOfferedSkills = user.skillsOffered?.map(s => s.name.toLowerCase()) || [];
  const currentUserDesiredSkills = currentUser.skillsDesired?.map(s => s.name.toLowerCase()) || [];
  
  const skillMatches = userOfferedSkills.filter(skill => 
    currentUserDesiredSkills.includes(skill)
  ).length;

  score += skillMatches * 30;

  // Rating bonus
  score += (user.rating?.average || 0) * 4;

  // Activity bonus
  const daysSinceActive = user.lastActive 
    ? Math.floor((Date.now() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24))
    : 999;
  
  if (daysSinceActive < 7) score += 10;

  return Math.min(Math.round(score), 100);
};
