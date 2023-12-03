export function getLastUpdatedInfo(
  lastUpdated: Date,
  showTimeElapsed: boolean = true,
): string {
  const currentTime = new Date();
  const timeElapsed = currentTime.getTime() - lastUpdated.getTime();

  if (showTimeElapsed) {
    const seconds = Math.floor(timeElapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${
      seconds % 60
    } seconds ago`;
  } else {
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;

    if (timeElapsed < minute) {
      return 'just now';
    } else if (timeElapsed < hour) {
      const minutes = Math.floor(timeElapsed / minute);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (timeElapsed < day) {
      const hours = Math.floor(timeElapsed / hour);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (timeElapsed < week) {
      const days = Math.floor(timeElapsed / day);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return 'more than a week ago';
    }
  }
}
