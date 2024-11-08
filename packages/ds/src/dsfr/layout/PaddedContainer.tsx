import React, { MouseEvent } from "react";
import Container from "./Container";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";

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
      className={`relative bg-white px-[1rem] py-[2rem] max-w-[56rem] md:px-[6rem] md:pt-[4rem] ${className}`}
    >
      {title && (
        <>
          <div className="flex items-center justify-between">
            <h1 className="m-0 text-2xl font-bold">{title}</h1>
            {href && (
              <Button
                iconId={
                  fr.cx("fr-icon-question-fill") as "fr-icon-question-fill"
                }
                onClick={(e) => {
                  if (handleClickEvent) handleClickEvent(e);
                  window.open(href, "_blank")?.focus();
                }}
                priority="tertiary no outline"
                title="Besoin d'aide ?"
              />
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-[16px] text-gray-500 leading-relaxed">
              {subtitle}
            </p>
          )}
          <hr className="mt-4" />
        </>
      )}
      {children}
    </Container>
  );
}
