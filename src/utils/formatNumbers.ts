export function formatNumberWithCommas(number: number): string {
  // Convert the number to a string and add commas to the integer part
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


export function formatScore(number: number): string {
  if (number < 10000) {
    return formatNumberWithCommas(number);
  }
  if (number < 1000000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  if (number < 1000000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  return `${(number / 1000000000).toFixed(1)}B`;
}