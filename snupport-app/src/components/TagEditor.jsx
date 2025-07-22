import React, { useEffect, useState } from "react";
import { HiX } from "react-icons/hi";
import API from "../services/api";

const useKeyPress = (targetKey) => {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = ({ key }) => {
      if (key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]);

  return keyPressed;
};

const TagsEditor = ({ name, tags, setTags, labelClassName = "", placeholder = "Commencez à taper", maxDisplayCount }) => {
  const [defaultTags, setDefaultTags] = useState([]);
  const [input, setInput] = useState("");
  const arrowUpPressed = useKeyPress("ArrowUp");
  const arrowDownPressed = useKeyPress("ArrowDown");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (arrowUpPressed) {
      selected > 0 ? setSelected(selected - 1) : 0;
      console.log("arrowUpPressed");
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed) {
      //dispatch({ type: "arrowDown" });
      selected < defaultTags.length - 1 && selected < 4 ? setSelected(selected + 1) : 0;
      console.log("arrowDownPressed");
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    update();
  }, [input]);

  async function update() {
    if (!input) return setDefaultTags([]);
    const q = input || undefined;
    const { ok, data } = await API.get({ path: "/tag/search", query: { q } });
    if (ok) setDefaultTags(data);
  }

  const displayedTags = maxDisplayCount ? tags.slice(0, maxDisplayCount) : tags;

  return (
    <div className="w-full">
      <label className={`mb-1 text-xs text-gray-500 ${labelClassName}`}>{name}</label>

      <div className={`${maxDisplayCount ? "mb-2" : "mb-4"} flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300`}>
        <input
          onClick={() => setInput("")}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setTags((prev) => [...prev, defaultTags[selected]]);
              setInput("");
            }
          }}
        />
      </div>
      <ul className={`${maxDisplayCount ? "mb-2" : "mb-4"} text-sm`}>
        {defaultTags.slice(0, 10).map((tag, i) => (
          <li
            className={`cursor-pointer hover:bg-gray-200 ${i === selected ? "bg-gray-200 text-purple-800" : ""}`}
            key={tag._id}
            onClick={() => {
              setTags((prev) => [...prev, tag]);
              setInput("");
            }}
          >
            {tag.name}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2.5">
        {displayedTags.map((tag, index) => (
          <span className="flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 pl-2.5 pr-1" key={index}>
            <span className="text-sm font-medium text-purple-800">{tag.name}</span>
            <HiX onClick={() => setTags((prev) => prev.filter((prevTag) => prevTag !== tag))} className="cursor-pointer text-base text-indigo-400" />
          </span>
        ))}
        {maxDisplayCount && tags.length > maxDisplayCount && (
          <span className="flex items-center gap-0.5 rounded-full bg-purple-100 py-0.5 px-2.5" key="rest">
            <span className="text-sm font-medium text-purple-800">{`+${tags.length - maxDisplayCount}`}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default TagsEditor;
