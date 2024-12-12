const tz = 'America/New_York';

export const convertSecondsToTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours}h ${minutes}m ${remainingSeconds}s`;
}

export const getSecondsUntilMidday = (): number => {
  const now = new Date();
  const laTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  let midday = new Date(laTime);
  midday.setHours(12, 0, 0, 0);
  
  if (laTime > midday) {
    midday.setDate(midday.getDate() + 1);
  }

  return Math.floor((midday.getTime() - laTime.getTime()) / 1000);
}

export const getSecondsUntil30DaysFromNow = (): number => {
  const now = new Date();
  const laTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  let futureDate = new Date(laTime);
  futureDate.setDate(futureDate.getDate() + 30);

  return Math.floor((futureDate.getTime() - laTime.getTime()) / 1000);
}

export const getTodaysDate = (): string => {
  const now = new Date();
  const laTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  return laTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}