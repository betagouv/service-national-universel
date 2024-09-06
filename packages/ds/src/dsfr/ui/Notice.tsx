import React from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

type NoticeProps = {
  title: string;
  className?: string;
};

const InformationNotice: React.FC<NoticeProps> = ({ title, className }) => {
  return <Notice className={className} title={title} />;
};

export default InformationNotice;
