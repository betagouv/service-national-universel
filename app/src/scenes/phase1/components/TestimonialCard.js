import React from "react";
import PlayCircleFilled from "../../../assets/icons/PlayCircleFilled";

const TestimonialCard = ({ title, description, picture, readingTime, isVideo = false, link }) => {
  const handleOpenLink = () => {
    window.open(link, "_blank");
  };

  return (
    <article role="button" onClick={handleOpenLink} className="rounded-lg overflow-hidden bg-gray-50 min-w-[240px] w-60">
      <div className="relative h-[150px] overflow-hidden">
        <img src={picture} alt="Témoignage" />
        <div className="absolute bottom-4 right-4 text-xs bg-white/60 px-[6px] py-[5px] rounded-[4px] backdrop-blur-sm">{readingTime}</div>
        {isVideo && (
          <div className="absolute inset-0 flex justify-center items-center">
            <PlayCircleFilled />
          </div>
        )}
      </div>
      <div className="p-[20px]">
        <h3 className="text-sm text-gray-900 font-bold mb-3">{title}</h3>
        <p className="text-xs text-gray-700">{description}</p>
      </div>
    </article>
  );
};

export default TestimonialCard;
