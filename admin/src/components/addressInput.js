import React, { useState } from "react";
import styled from "styled-components";
import Autosuggest from "react-autosuggest";

export default ({ value, onChange, placeholder, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    onSelect(suggestion);
  };

  const renderSuggestion = (suggestion) => <div>{suggestion.properties.label}</div>;
  const getSuggestionValue = (suggestion) => suggestion.properties.label;

  const getSuggestions = async (item) => {
    const text = item;
    onChange(text);
    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?autocomplete=1&q=${text}`, {
      mode: "cors",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const res = await response.json();
    const arr = res.features.filter((e) => e.properties.type !== "municipality");
    setSuggestions(arr);
  };

  return (
    <Wrapper>
      <Autosuggest
        autocomplete="off"
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        onSuggestionSelected={onSuggestionSelected}
        renderSuggestion={renderSuggestion}
        inputProps={{
          placeholder,
          value: value,
          onChange: (event, { newValue }) => onChange(newValue),
          className: "form-control",
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  .react-autosuggest__container {
    position: relative;
  }
  .react-autosuggest__suggestions-list {
    position: absolute;
    background-color: white;
    margin: 0;
    width: 100%;
    z-index: 10;
    left: 0px;
    top: 106%;
    border: 1px solid #ddd;
    padding: 5px 0;
    border-radius: 6px;
  }
  .react-autosuggest__suggestions-list li {
    list-style: none;
    cursor: pointer;
    padding: 7px 10px;
    :hover {
      background-color: #f3f3f3;
    }
  }
  .react-autosuggest__suggestion--highlighted {
    background-color: #f3f3f3;
  }
`;
