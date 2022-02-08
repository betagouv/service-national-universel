import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { translate } from "../utils";

import api from "../services/api";

export default function SocialIcons({ structure }) {
  const [value, setValue] = useState();
  useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/structure/${structure}`);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de la récupération de la structure", translate(code));
      else setValue(data);
      return;
    })();
  }, []);

  function websiteUrl(website) {
    if (!/^https?:\/\//i.test(website)) return `http://${website}`;
    return website;
  }
  function facebookUrl(facebook) {
    if (!facebook.includes("/")) return `https://facebook.com/${facebook}`;
    return websiteUrl(facebook);
  }
  function twitterUrl(twitter) {
    if (!twitter.includes("/")) return `https://twitter.com/${twitter}`;
    return websiteUrl(twitter);
  }
  function instagramUrl(instagram) {
    if (!instagram.includes("/")) return `https://instagram.com/${instagram}`;
    return websiteUrl(instagram);
  }
  if (!value) return <div />;
  const { facebook, instagram, website, twitter } = value;
  const a = [
    website ? (
      <a className="social-link" href={websiteUrl(website)} key="website">
        <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="15" height="15">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.318.975a3.328 3.328 0 114.707 4.707l-3.171 3.172-.708-.708 3.172-3.171a2.328 2.328 0 10-3.293-3.293L6.854 4.854l-.708-.708L9.318.975zm1.536 3.879l-6 6-.708-.708 6-6 .708.708zm-6 2l-3.172 3.171a2.329 2.329 0 003.293 3.293l3.171-3.172.708.708-3.172 3.171A3.328 3.328 0 11.975 9.318l3.171-3.172.708.708z"
            fill="currentColor"></path>
        </svg>
      </a>
    ) : null,
    facebook ? (
      <a className="social-link" href={facebookUrl(facebook)} key="facebook">
        <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="15" height="15">
          <path d="M0 7.5a7.5 7.5 0 118 7.484V9h2V8H8V6.5A1.5 1.5 0 019.5 5h.5V4h-.5A2.5 2.5 0 007 6.5V8H5v1h2v5.984A7.5 7.5 0 010 7.5z" fill="currentColor"></path>
        </svg>
      </a>
    ) : null,
    instagram ? (
      <a className="social-link" href={instagramUrl(instagram)} key="instagram">
        <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="15" height="15">
          <path d="M7.5 5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" fill="currentColor"></path>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.5 0A4.5 4.5 0 000 4.5v6A4.5 4.5 0 004.5 15h6a4.5 4.5 0 004.5-4.5v-6A4.5 4.5 0 0010.5 0h-6zM4 7.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM11 4h1V3h-1v1z"
            fill="currentColor"></path>
        </svg>
      </a>
    ) : null,
    twitter ? (
      <a className="social-link" href={twitterUrl(twitter)} key="twitter">
        <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="15" height="15">
          <path
            d="M14.977 1.467a.5.5 0 00-.87-.301 2.559 2.559 0 01-1.226.763A3.441 3.441 0 0010.526 1a3.539 3.539 0 00-3.537 3.541v.44C3.998 4.75 2.4 2.477 1.967 1.325a.5.5 0 00-.916-.048C.004 3.373-.157 5.407.604 7.139 1.27 8.656 2.61 9.864 4.51 10.665 3.647 11.276 2.194 12 .5 12a.5.5 0 00-.278.916C1.847 14 3.55 14 5.132 14h.048c4.861 0 8.8-3.946 8.8-8.812v-.479c.363-.37.646-.747.82-1.236.193-.546.232-1.178.177-2.006z"
            fill="currentColor"></path>
        </svg>
      </a>
    ) : null,
  ].filter((b) => b);
  return <div className="social-icons-container">{a}</div>;
}
