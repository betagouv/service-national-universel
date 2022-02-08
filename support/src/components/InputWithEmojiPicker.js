import { useRef } from "react";
import EmojiPicker from "./EmojiPicker";

// https://github.com/missive/emoji-mart/issues/79
const InputWithEmojiPicker = ({ className, inputClassName, name, defaultValue, value, onChange }) => {
  const inputRef = useRef({ defaultValue });

  const onInsertEmoji = (emoji) => {
    inputRef.current.value = `${inputRef.current.value} ${emoji}`;
    inputRef.current.focus();
  };

  return (
    <div className={`flex relative justify-between items-center ${className}`}>
      <input className={`w-full ${inputClassName}`} ref={inputRef} name={name} defaultValue={defaultValue} value={value} onChange={onChange} />
      <EmojiPicker insertEmoji={onInsertEmoji} />
    </div>
  );
};

export default InputWithEmojiPicker;
