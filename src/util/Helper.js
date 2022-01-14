/**
 * Create a fenced code block with syntax highlighting.
 * @param {String} style The formatting style to use.
 * @param {String} text The text to be wrapped in the styled code block.
 * @returns A text block wrapped with the given style or a generic code block.
 */
function codeBlock(style, text) {
  if (!style) return "```" + text + "```";
  return "```" + style + "\n" + text + "```";
}

/**
 * Check whether the given input is a number.
 * @param {Any} input The input to check.
 * @returns true if the input is a number. False otherwise.
 */
function isNumber(input) {
  return !isNaN(parseFloat(input));
}

module.exports = {
  codeBlock,
  isNumber,
};
