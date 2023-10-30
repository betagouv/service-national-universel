import React from "react";
import { HiUser } from "react-icons/hi";

type OwnProps = {
  image?: string;
  initials?: string;
  icon?: (size: number, className: string) => React.ReactNode;
  size?: number;
  className?: string;
};

export default function ProfilePic({
  image,
  initials,
  icon,
  size = 48,
  className,
}: OwnProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-ds-deep-blue-50 ${className}`}
      style={{
        width: size,
        maxWidth: size,
        height: size,
        maxHeight: size,
        ...(image
          ? {
              backgroundImage: `url(${image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : {}),
      }}
    >
      {!image && !icon && initials && (
        <div
          className="flex items-center justify-center text-ds-deep-blue-900 font-bold uppercase"
          style={{ fontSize: size / 2 + "px", lineHeight: size + "px" }}
        >
          {initials.substring(0, 2)}
        </div>
      )}
      {!image && !initials && icon && icon(size / 2, "text-ds-deep-blue-900")}
      {!image && !initials && !icon && (
        <HiUser size={size / 2} className="text-ds-deep-blue-900" />
      )}
    </div>
  );
}
