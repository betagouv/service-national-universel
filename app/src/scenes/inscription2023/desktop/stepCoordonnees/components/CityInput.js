import React, { useCallback, useEffect, useRef, useState } from "react";
import { getAddress } from "../../../api";
import Input from "../../../components/Input";
import { debounce } from "../../../utils";

const CityInput = ({ value, label, onChange, error, correction, withSuggestion, onSuggestionClick }) => {
  const [birthCityZipSuggestions, setBirthCityZipSuggestions] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setBirthCityZipSuggestions([]);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const debouncedSuggestionsRequest = useCallback(
    debounce(async (value) => {
      const response = await getAddress(value);
      const suggestions = response.features.map(({ properties: { city, postcode } }) => ({ city, postcode }));
      setBirthCityZipSuggestions(suggestions);
    }, 500),
    [],
  );

  const _onChange = (value) => {
    onChange(value);
    const trimmedValue = value.trim();
    if (trimmedValue && trimmedValue.length > 2) {
      debouncedSuggestionsRequest(trimmedValue);
    } else {
      setBirthCityZipSuggestions([]);
    }
  };

  const ref = useRef(null);

  return (
    <>
      <Input value={value} label={label} onChange={_onChange} error={error} correction={correction} />
      {withSuggestion && (
        <div ref={ref} className="w-full absolute z-50 bg-white border-3 border-red-600 shadow overflow-hidden mt-[-24px]">
          {birthCityZipSuggestions.map(({ city, postcode }, index) => (
            <div
              onClick={() => {
                onSuggestionClick(city, postcode);
                setBirthCityZipSuggestions([]);
              }}
              className="group flex justify-between items-center gap-2 p-2 px-3  hover:bg-gray-50 cursor-pointer"
              key={`${index} - ${postcode}`}>{`${city} - ${postcode}`}</div>
          ))}
        </div>
      )}
    </>
  );
};

export default CityInput;
