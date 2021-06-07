export function weiToEth(wei) {
  const eth = wei / 1000000000000000000;
  return eth;
}

export function getNumberWithOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
