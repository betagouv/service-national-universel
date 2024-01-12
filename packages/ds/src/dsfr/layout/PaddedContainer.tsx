import React, { MouseEvent } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";
import Container from "./Container";

type OwnProps = {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  href?: string;
  handleClickEvent?: (e: MouseEvent) => void;
  className?: string;
};

export default function PaddedContainer({
  children,
  title,
  subtitle,
  href,
  handleClickEvent,
  className,
}: OwnProps) {
  return (
    <Container
      className={`relative md:my-10 mx-auto w-full bg-white px-[1rem] py-[2rem] md:w-[56rem] md:px-[6rem] md:pt-[4rem] ${className}`}
    >
      {title && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="m-0 text-2xl font-bold">{title}</h1>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer">
                <BsQuestionCircleFill
                  size={20}
                  className="fill-blue-france-sun-113 hover:fill-blue-france-sun-113-hover"
                  onClick={(e) =>
                    handleClickEvent ? handleClickEvent(e) : null
                  }
                />
              </a>
            ) : null}
          </div>
          {subtitle && (
            <p className="mt-2 text-[16px] text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          )}
          <hr className="my-4 h-px border-0 bg-gray-200" />
        </>
      )}
      {children}
    </Container>
  );
}
