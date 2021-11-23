import { forwardRef, useEffect, useRef, useState } from "react";
import EmojiPicker from "./EmojiPicker";

// https://github.com/missive/emoji-mart/issues/79
const InputWithEmojiPicker = forwardRef(({ className, inputClassName, setValue, getValues, ...props }, ref) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [pickerPosition, setPickerPosition] = useState({ top: 0, right: 0 });
  const pickerButtonRef = useRef(null);

  const onOpenEmojiPicker = () => {
    const { top, left } = pickerButtonRef.current.getBoundingClientRect();
    console.log(pickerButtonRef.current.getBoundingClientRect());
    // picker is 420h x 340w
    const idealTop = top + 24; // 24px is the svg button size
    const pickerTop = Math.min(window.innerHeight - 420, idealTop);
    const pickerLeft = idealTop > pickerTop ? left + 24 : left;
    setPickerPosition({ top: pickerTop, left: pickerLeft });
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onInsertEmoji = (emoji) => {
    const value = getValues(props.name);
    const newValue = `${value} ${emoji}`;
    setValue(props.name, newValue);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`flex relative justify-between items-center ${className}`}>
      <input className={`w-full ${inputClassName}`} ref={ref} {...props} />
      <svg
        ref={pickerButtonRef}
        onClick={onOpenEmojiPicker}
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-6 w-6 cursor-pointer text-gray-400 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="fixed z-10" style={pickerPosition}>
        {!!showEmojiPicker && <EmojiPicker insertEmoji={onInsertEmoji} />}
      </div>
    </div>
  );
});

export default InputWithEmojiPicker;
