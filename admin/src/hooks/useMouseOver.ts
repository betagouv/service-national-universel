import { useEffect, useState, useRef, MutableRefObject } from "react";

const useMouseOver = (): [MutableRefObject<HTMLDivElement | null>, boolean] => {
  const [value, setValue] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);
      return () => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
    // Always return a cleanup function
    return () => {};
  }, []);
  return [ref, value];
};

export default useMouseOver;
