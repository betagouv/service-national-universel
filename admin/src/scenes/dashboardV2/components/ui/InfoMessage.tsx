import React from "react";
import cx from "classnames";
import { HiInformationCircle, HiExclamationCircle, HiExclamation, HiLightBulb } from "react-icons/hi";
// @ts-expect-error CommonJS module
import Markdown from "react-markdown";
// @ts-expect-error CommonJS module
import remarkGfm from "remark-gfm";

import { AlerteMessageDto } from "snu-lib";

interface Props {
  title?: AlerteMessageDto["title"];
  message?: AlerteMessageDto["content"];
  priority?: AlerteMessageDto["priority"];
  className?: string;
}

export default function InfoMessage({ title, message, priority, className }: Props) {
  const [show, setShow] = React.useState(true);

  let Icon = HiLightBulb;
  switch (priority) {
    case "normal":
      Icon = HiInformationCircle;
      break;
    case "important":
      Icon = HiExclamationCircle;
      break;
    case "urgent":
      Icon = HiExclamation;
      break;
    default:
      Icon = HiLightBulb;
  }
  return (
    <div
      className={cx("flex flex-col gap-4 p-4 text-sm leading-5 font-medium border-l-4", className, {
        "bg-white text-deep-blue-600 border-deep-blue-500": !priority,
        "bg-indigo-50 text-indigo-600 border-indigo-500": priority === "normal",
        "bg-amber-50 text-amber-600 border-amber-500": priority === "important",
        "bg-rose-50 text-rose-600 border-rose-500": priority === "urgent",
      })}>
      <div className="flex items-center justify-between gap-3 ">
        <Icon
          className={cx("mt-[3px]", {
            "text-deep-blue-600": !priority,
            "text-indigo-600": priority === "normal",
            "text-amber-600": priority === "important",
            "text-rose-600": priority === "urgent",
          })}
          size={24}
        />
        <div className="text-base leading-6 font-bold">{title}</div>
        <button className="text-xs ml-auto underline" onClick={() => setShow(!show)}>
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>
      <div className={cx("ml-[38px] text-sm leading-5 font-medium", { block: show, hidden: !show })}>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            a({ node, ...rest }) {
              return <a className="underline" {...rest} />;
            },
          }}>
          {message}
        </Markdown>
      </div>
    </div>
  );
}
