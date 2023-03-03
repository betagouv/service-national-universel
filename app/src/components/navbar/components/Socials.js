import React from "react";
import IconFacebook from "../assets/IconFacebook";
import IconInstagram from "../assets/IconInstagram";
import IconTwitter from "../assets/IconTwitter";

export default function Socials() {
  return (
    <div className="flex justify-end gap-8 md:pr-4 items-center text-[#7A90C3]">
      <a href="https://www.facebook.com/snu.jemengage/" target="_blank" rel="noreferrer">
        <IconFacebook className="hover:text-[#D1DAEF] transition-colors duration-200" />
      </a>
      <a href="https://twitter.com/snujemengage" target="_blank" rel="noreferrer">
        <IconTwitter className="hover:text-[#D1DAEF] transition-colors duration-200" />
      </a>
      <a href="https://www.instagram.com/snujemengage/" target="_blank" rel="noreferrer">
        <IconInstagram className="hover:text-[#D1DAEF] transition-colors duration-200" />
      </a>
    </div>
  );
}
