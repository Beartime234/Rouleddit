import Settings from '../settings.json';

function getCountdownToMidday() {
    const now = new Date();
    
    // Convert current time to Eastern Time (ET)
    const options = { timeZone: Settings.game.timezone, hour12: false };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    
    const currentHour = parseInt(parts.find(part => part.type === 'hour')?.value || '0', 10);
    const currentMinute = parseInt(parts.find(part => part.type === 'minute')?.value || '0', 10);
    const currentSecond = parseInt(parts.find(part => part.type === 'second')?.value || '0', 10);
    
    const midday = new Date(now);
    midday.setUTCHours(17, 0, 0, 0); // 12:00 PM ET is 17:00 UTC
  
    if (currentHour >= 12) {
      // If it's past midday ET, set the countdown to the next day's midday
      midday.setUTCDate(midday.getUTCDate() + 1);
    }
  
    const diff = midday.getTime() - now.getTime();
    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}`;
  }

  export { getCountdownToMidday };