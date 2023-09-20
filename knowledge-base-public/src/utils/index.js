import emojiRegex from 'emoji-regex';

export const debounce = (fn, delay) => {
  let timeOutId;
  return function (...args) {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export const separateEmojiAndText = (str) => {
  const regex = emojiRegex();
  let match = str.match(regex);

  // Check if there are any matches
  if (match) {
    // Assuming the first emoji sequence is the one you are interested in.
    const emoji = match[0];
    // Remove the emoji sequence from the original string to get the text.
    const text = str.replace(emoji, "").trim();
    return [emoji, text];
  }

  // If no matches, return null for emoji and the original string for text.
  return [null, str];
};
