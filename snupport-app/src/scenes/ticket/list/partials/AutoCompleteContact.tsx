import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import API from "@/services/api";

type Option = {
  _id: string;
  firstName: string;
  lastName: string;
};

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

export default function AutoCompleteContact({ value, onChange }) {
  const [input, setInput] = useState(value);
  const [options, setOptions] = useState<Option[]>([]);
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
      selected < options.length - 1 && selected < 4 ? setSelected(selected + 1) : 0;
      console.log("arrowDownPressed");
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    getOptions(input);
  }, [input]);

  const getOptions = async (q) => {
    if (!q) {
      setOptions([]);
      return [];
    }
    try {
      const { ok, data, code } = await API.get({ path: "/contact/search", query: { q } });
      if (!ok) {
        toast.error(code);
        return [];
      }
      setOptions(data);
      return data;
    } catch (e) {
      console.log(e.message);
      return [];
    }
  };

  return (
    <div>
      <div className="mb-2 flex divide-x divide-gray-300 overflow-hidden rounded-md border border-gray-300">
        <input
          onClick={() => setInput("")}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-32 flex-1 border-0 text-sm text-gray-600 placeholder:text-[#979797] focus:border-transparent"
          placeholder="Contact"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onChange(options[selected]._id);
              setInput(`${options[selected].firstName} ${options[selected].lastName}`);
              setOptions([]);
            }
          }}
        />
      </div>
      <ul className="mb-2  text-sm text-gray-600 ">
        {options.slice(0, 5)?.map((option, index) => (
          <li
            className={`cursor-pointer hover:bg-gray-50 ${index === selected ? "bg-gray-200 text-purple-800" : ""}`}
            key={index}
            onClick={() => {
              onChange(option._id);
              setInput(`${option.firstName} ${option.lastName}`);
              setOptions([]);
            }}
          >
            {option.firstName} {option.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
}
