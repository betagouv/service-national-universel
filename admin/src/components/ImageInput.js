import React, { useState } from "react";
import styled from "styled-components";
import api from "../services/api";

export default ({ url, route, onUpload, onError }) => {
  const [img, setImg] = useState(url);

  function handleChange(evt) {
    const files = evt.target.files;
    const file = files[0];
    let imgObject = new Image();
    let imgUrl = URL.createObjectURL(file);
    imgObject.src = imgUrl;

    imgObject.onload = async () => {
      try {
        const res = await api.putFormData(route, null, files);
        if (!res.ok) return onError(res);
        setImg(res.url);
        onUpload(res.url);
      } catch (e) {
        onError(e);
      }
    };
  }
  return (
    <ImageInput>
      {img && <img src={img} style={{ maxWidth: "100%", objectFit: "contain" }} />}
      <div className="placeholder" />
      <input accept=".gif,.jpg,.jpeg,.png,.svg" hidden type="file" onChange={handleChange} />
    </ImageInput>
  );
};

const ImageInput = styled.label`
  position: relative;
  height: 120px;
  width: 120px;
  cursor: pointer;
  img {
    max-width: 100%;
    height: 120px;
    object-fit: contain;
    background-color: #fff;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
  }
  .placeholder {
    height: 120px;
    width: 120px;
    background: #f7f7fa url(${require("../assets/placeholder.svg")}) center no-repeat;
    border-radius: 8px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
  }
  :hover .placeholder {
    background: rgba(0, 0, 0, 0.5) url(${require("../assets/placeholder-white.svg")}) center no-repeat;
    z-index: 2;
  }
`;
