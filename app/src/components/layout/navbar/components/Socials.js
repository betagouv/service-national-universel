import React from "react";
import IconFacebook from "../assets/IconFacebook";
import IconInstagram from "../assets/IconInstagram";
import IconTwitter from "../assets/IconTwitter";

export default function Socials() {
  return (
    <div className="mx-3 mt-3 flex items-center justify-end gap-8 text-[#7A90C3]">
      <a href="https://www.facebook.com/snu.jemengage/" target="_blank" rel="noreferrer">
        <IconFacebook className="transition-colors duration-200 hover:text-[#D1DAEF]" />
      </a>
      <a href="https://twitter.com/snujemengage" target="_blank" rel="noreferrer">
        <IconTwitter className="transition-colors duration-200 hover:text-[#D1DAEF]" />
      </a>
      <a href="https://www.instagram.com/snujemengage/" target="_blank" rel="noreferrer">
        <IconInstagram className="transition-colors duration-200 hover:text-[#D1DAEF]" />
      </a>
    </div>
  );
}
