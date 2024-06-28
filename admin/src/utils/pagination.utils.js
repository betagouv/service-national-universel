export function getPages(lastDisplayItem, firstDisplayPage, lastDisplayPage, itemsCountTotal, lastPage, size) {
  let pages = [];
  if (lastDisplayItem === itemsCountTotal) {
    // derniere page
    for (let i = firstDisplayPage - 1; i <= lastDisplayPage - 1; ++i) pages.push(i);
  } else if (lastDisplayItem >= itemsCountTotal - size || [1, 2, 3].includes(lastDisplayItem / size)) {
    // pages 1, 2, 3 et avant-derniere page
    for (let i = firstDisplayPage; i <= lastDisplayPage; ++i) pages.push(i);
  } else {
    // page par defaut
    for (let i = firstDisplayPage + 1; i <= lastDisplayPage + 1; ++i) pages.push(i);
  }
  return pages.filter((i) => i !== 0 && i !== lastPage); //on supprime la premiere et derniere page si elles y sont
}

export const sizeOptions = [
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "40", value: "40" },
  { label: "50", value: "50" },
];
