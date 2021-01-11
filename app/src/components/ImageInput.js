import React, { useState } from "react";
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
    <label>
      <div style={{ cursor: "pointer" }}>
        {img ? (
          <img src={img} style={{ width: "200px", objectFit: "contain" }} />
        ) : (
          <div
            style={{
              height: "100px",
              minWidth: "150px",
              background: `#f3f3f3 url(${require("../assets/image.svg")}) center no-repeat`,
              backgroundSize: "50%",
              border: "2px solid #eee",
              marginTop: "10px",
              cursor: "pointer",
            }}
          />
        )}
        <input accept=".gif,.jpg,.jpeg,.png,.svg" hidden type="file" onChange={handleChange} />
      </div>
    </label>
  );
};
