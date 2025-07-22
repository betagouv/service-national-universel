import React, { useEffect, useRef } from "react";

const Textarea = ({ value, onChange, disabled = false, focus = false }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (focus && !!ref?.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <textarea
      ref={ref}
      disabled={disabled}
      rows={4}
      className="mb-2 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 transition-colors placeholder:text-[#979797] focus:border-gray-400"
      placeholder="Note interne"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default Textarea;
