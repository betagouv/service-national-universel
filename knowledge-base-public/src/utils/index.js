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
  const match = str.match(
    /^([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2500}-\u{257F}\u{2900}-\u{297F}\u{2B50}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F251}\u{00A9}\u{00AE}\u{203C}\u{2049}\u{2122}\u{2139}\u{2194}-\u{21AA}\u{25AA}-\u{25AB}\u{25FE}-\u{25FF}\u{2600}-\u{2604}\u{260E}\u{2611}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26C8}\u{26CF}-\u{26D3}\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}]+)(.*)$/u
  );

  if (match) {
    let emoji = match[1] || null;
    const text = match[2];

    if (emoji) {
      emoji = <span aria-hidden>{emoji}</span>;
    }
    return [emoji, text];
  }

  return [null, str];
}
