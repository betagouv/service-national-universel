import React from "react";
import PlayCircleFilled from "../../../assets/icons/PlayCircleFilled";

const TestimonialCard = ({ title, description, picture, readingTime, isVideo = false, link }) => {
  const handleOpenLink = () => {
    window.open(link, "_blank");
  };

  return (
    <article role="button" onClick={handleOpenLink} className="w-60 min-w-[240px] overflow-hidden rounded-lg bg-gray-50">
      <div className="relative h-[150px] overflow-hidden">
        <img src={picture} alt="Témoignage" />
        <div className="absolute bottom-4 right-4 rounded-[4px] bg-white/60 px-[6px] py-[5px] text-xs backdrop-blur-sm">{readingTime}</div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircleFilled />
          </div>
        )}
      </div>
      <div className="p-[20px]">
        <h3 className="mb-3 text-sm font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-700">{description}</p>
      </div>
    </article>
  );
};

export default TestimonialCard;
