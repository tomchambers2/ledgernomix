export function weiToEth(wei) {
  //two steps avoids error where integers ended up like 0.999999999995
  const decagwei = wei / 10000000000;
  const eth = decagwei / 100000000;
  // const eth = wei / 1000000000000000000;
  return eth;
}

export function getNumberWithOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatCurrency(number) {
  const numberToExponential = parseFloat(number).toExponential();
  const exponentialSplit = numberToExponential.split("e");
  const baseLength = exponentialSplit[0].replace(".", "").length;
  const exponent = parseInt(exponentialSplit[1]);

  //gives at least 2 decimal places for numbers >= 1, up to 3 places for numbers < 1, up to 4 places for numbers <0.1 etc
  const precisionNeeded = Math.max(
    2,
    exponent * -1 + Math.min(2, baseLength - 1)
  );
  const numberToFixed = parseFloat(number).toFixed(precisionNeeded);

  const numberStringArray = String(numberToFixed).split(".");

  const numberToPoint = numberStringArray[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  const numberAfterPoint = numberStringArray[1];

  return (
    <span>
      {numberToPoint}
      <span className="decimal-point">.</span>
      <span className="number-after-point">{numberAfterPoint}</span>
    </span>
  );
}
