import React from "react";
import { HiUser } from "react-icons/hi";

type ProfilePicIconProps = {
  size: number;
  className: string;
};

type OwnProps = {
  image?: string;
  initials?: string;
  icon?: ((props: ProfilePicIconProps) => React.ReactNode) | string;
  size?: number;
  className?: string;
  onClick?: () => void;
};

export default function ProfilePic({
  image,
  initials,
  icon,
  size = 48,
  className,
  onClick,
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
      onClick={() => onClick?.()}
    >
      {!image && !icon && initials && (
        <div
          className="flex items-center justify-center text-ds-deep-blue-900 font-medium uppercase"
          style={{ fontSize: size / 2 + "px", lineHeight: size + "px" }}
        >
          {initials.substring(0, 2)}
        </div>
      )}
      {!image && !initials && icon && typeof icon === "string" && icon}
      {!image &&
        !initials &&
        icon &&
        typeof icon !== "string" &&
        icon({ size: size / 2, className: "text-ds-deep-blue-900" })}
      {!image && !initials && !icon && (
        <HiUser size={size / 2} className="text-ds-deep-blue-900" />
      )}
    </div>
  );
}
