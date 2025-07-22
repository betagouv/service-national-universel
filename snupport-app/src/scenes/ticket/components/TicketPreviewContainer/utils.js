const minHeights = {
  1: "min-h-[80px]",
  2: "min-h-[160px]",
  3: "min-h-[240px]",
  4: "min-h-[320px]",
  5: "min-h-[400px]",
  6: "min-h-[480px]",
  7: "min-h-[560px]",
  8: "min-h-[640px]",
  9: "min-h-[720px]",
  10: "min-h-[800px]",
};

const previewListWidth = 260;
const previewWidth = 500;
const marginRight = 20;
const gap = 8;

export const getMinHeight = (ticketCount) => {
  if (ticketCount > 10) return minHeights[10];
  return minHeights[ticketCount];
};

export const getMaxOpenTicketCount = () => {
  const availableWidth = window.innerWidth - previewListWidth - marginRight;
  const maxTicketCount = parseInt(availableWidth / (previewWidth + gap), 10);
  return maxTicketCount > 1 ? maxTicketCount : 1;
};
