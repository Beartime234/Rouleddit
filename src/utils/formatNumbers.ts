export function formatNumberWithCommas(number: number): string {
  // Convert the number to a string and add commas to the integer part
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


export function formatScore(number: number): string {
  // If the number is less then 10000 then return the number with commas
  if (number < 10000) {
    return formatNumberWithCommas(number);
  }
  // If the number is greater than 10000 then return the number with a K
  if (number < 1000000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  // If the number is greater than 1000000 then return the number with an M
  if (number < 1000000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  // If the number is greater than 1000000000 then return the number with a B
  return `${(number / 1000000000).toFixed(1)}B`;
}