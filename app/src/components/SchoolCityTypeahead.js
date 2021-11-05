// https://api-adresse.data.gouv.fr/search/?q=nante&type=municipality
import Autosuggest from "react-autosuggest";
import React, { useState } from "react";
import styled from "styled-components";
import debounce from "lodash.debounce";

const NORESULTMESSAGE = "Aucun résultat trouvé";

export default function SchoolCityTypeahead(props) {
  const [suggestions, setSuggestions] = useState([]);
  const [value, setValue] = useState("");

  const onSuggestionsFetchRequested = ({ value }) => getSuggestions(value);
  const onSuggestionsClearRequested = () => setSuggestions([]);
  const onSuggestionSelected = (event, { suggestion }) => {};
  const renderSuggestion = (suggestion) => <div>{suggestion !== "noresult" ? suggestionText(suggestion) : NORESULTMESSAGE}</div>;
  const getSuggestionValue = (suggestion) => (suggestion !== "noresult" ? suggestion.label : "");
  const suggestionText = (suggestion) => (
    <>
      <b>{suggestion.label}</b> - {suggestion.postcode}
    </>
  );

  const getSuggestions = async (item) => {
    const text = item;
    try {
      if (text && text.trim().match(/^[0-9]{5}$/)) {
        const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${text}`, {
          mode: "cors",
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const res = await response.json();
        return setSuggestions(res.map((item) => ({ label: item.nom, postcode: item.codesPostaux.find((code) => code === text) })));
      } else if (text && !text.trim().match(/^[0-9]{1,5}$/)) {
        let url = `https://geo.api.gouv.fr/communes?nom=${text}&boost=population`;
        if (text.trim().match(/[0-9]{5}$/)) {
          url = `https://geo.api.gouv.fr/communes?codePostal=${text.trim().replace(/^.*([0-9]{5})$/, "$1")}&nom=${text.trim().replace(/^(.*)[0-9]{5}$/, "$1")}&boost=population`;
        }
        const response = await fetch(url, {
          mode: "cors",
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        const res = await response.json();
        const s = [];
        for (const item of res) {
          for (const cp of item.codesPostaux) {
            if (text.trim().match(/[0-9]{1,5}$/)) {
              console.log("BOUM", text);
              if (cp.startsWith(text.trim().replace(/^.*[^0-9]([0-9]{1,5})$/, "$1"))) {
                console.log(cp, text);
                s.push({ label: item.nom, postcode: cp });
              }
            } else {
              s.push({ label: item.nom, postcode: cp });
            }
          }
        }
        return setSuggestions(s.slice(0, 10));
      } else {
        return setSuggestions([]);
      }
    } catch (error) {}
  };

  return (
    <Wrapper>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        onSuggestionSelected={onSuggestionSelected}
        renderSuggestion={renderSuggestion}
        inputProps={{
          placeholder: "Indiquez un nom de ville ou un code postal",
          value,
          onChange: (event, { newValue }) => {
            setValue(newValue);
            props.onChange(newValue);
          },
          className: "form-control",
        }}
      />
    </Wrapper>
  );
}

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
