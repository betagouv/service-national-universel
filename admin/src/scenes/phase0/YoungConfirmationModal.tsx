import React, { ReactNode, useState } from "react";
import cx from "classnames";

import { YOUNG_SOURCE, YOUNG_STATUS, YoungDto } from "snu-lib";
import { Button } from "@snu/ds/admin";

import ChevronDown from "@/assets/icons/ChevronDown";
import CloseIcon from "@/assets/Close";
import Modal from "@/components/ui/modals/Modal";

import { REJECTION_REASONS, REJECTION_REASONS_KEY, REJECTION_REASONS_TYPE } from "./commons";

const rejectionReasonOptions = [
  <option value="" key="none">
    Motif
  </option>,
  <option value={REJECTION_REASONS_KEY.NOT_FRENCH} key="NOT_FRENCH">
    {REJECTION_REASONS.NOT_FRENCH}
  </option>,
  <option value={REJECTION_REASONS_KEY.TOO_YOUNG} key="TOO_YOUNG">
    {REJECTION_REASONS.TOO_YOUNG}
  </option>,
  <option value={REJECTION_REASONS_KEY.OTHER} key="OTHER">
    {REJECTION_REASONS.OTHER}
  </option>,
];

export interface ConfirmModalContentData {
  icon: ReactNode;
  title: ReactNode | string;
  message: string;
  type: "WAITING_LIST" | "VALIDATED" | "REFUSED" | "SESSION_FULL";
  infoLink?: {
    href: string;
    text: string;
  };
  confirmLabel?: string;
  confirmSatus?: "WAITING_LIST" | "VALIDATED" | "REFUSED" | "SESSION_FULL";
  confirmColor?: string;
  cancelLabel?: string;
  customActions?: {
    label: string;
    type: "URL" | "VALIDATE";
    url?: string;
    status?: ConfirmModalContentData["type"];
  }[];
  withoutCancelAction?: boolean;
  rejectReason?: "OTHER";
  rejectMessage?: string;
  errorMessage?: string;
}

interface YoungConfirmationModalProps {
  young: YoungDto;
  content: ConfirmModalContentData;
  onClose: () => void;
  onConfirm: ({
    rejectionReason,
    rejectionMessage,
    state,
  }: {
    rejectionReason?: REJECTION_REASONS_TYPE;
    rejectionMessage?: string;
    state?: ConfirmModalContentData["type"];
  }) => void;
  onReject: () => void;
}

export default function YoungConfirmationModal({ young, content, onClose, onConfirm }: YoungConfirmationModalProps) {
  const [rejectionReason, setRejectionReason] = useState<REJECTION_REASONS_TYPE>("");
  const [rejectionMessage, setRejectionMessage] = useState("");

  console.log(content);
  return (
    <Modal isOpen={!!content}>
      {content && (
        <>
          <Modal.Header className="flex-col">
            {content.icon && <div className="mb-auto flex justify-center">{content.icon}</div>}
            <h2 className="m-0 text-center text-xl leading-7">{content.title}</h2>
            <CloseIcon className="absolute top-3 right-3 cursor-pointer text-gray-400" height={10} onClick={onClose} />
          </Modal.Header>
          <Modal.Content>
            {(content.type === YOUNG_STATUS.VALIDATED || content.type === "SESSION_FULL") && <p className="mb-0 text-center text-xl leading-7">{content.message}</p>}
            {content.type === YOUNG_STATUS.REFUSED && (
              <div className="mt-[24px]">
                <div className="mb-[16px] flex w-[100%] items-center rounded-[6px] border-[1px] border-[#D1D5DB] bg-white pr-[15px]">
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value as REJECTION_REASONS_TYPE)}
                    className="block grow appearance-none bg-[transparent] p-[15px]"
                    disabled={young.source === YOUNG_SOURCE.CLE}>
                    {rejectionReasonOptions}
                  </select>
                  <ChevronDown className="flex-[0_0_16px] text-[#6B7280]" />
                </div>
                {rejectionReason === REJECTION_REASONS_KEY.OTHER && (
                  <textarea
                    value={rejectionMessage}
                    onChange={(e) => setRejectionMessage(e.target.value)}
                    className="w-[100%] rounded-[6px] border-[1px] border-[#D1D5DB] bg-white p-[15px]"
                    rows={5}
                    placeholder="Précisez la raison de votre refus ici"
                  />
                )}
                {content.errorMessage && <div className="text-[#EF4444]">{content.errorMessage}</div>}
              </div>
            )}
          </Modal.Content>
          <Modal.Footer>
            <div className={cx("flex items-center justify-between gap-2")}>
              {!content.withoutCancelAction && <Button className="grow" type="secondary" title={content.cancelLabel || "Annuler"} onClick={onClose} />}
              <Button
                type="primary"
                title={content.confirmLabel || "Confirmer"}
                onClick={() =>
                  onConfirm({
                    rejectionReason,
                    rejectionMessage,
                    state: content.confirmSatus,
                  })
                }
                className={cx("grow", { "w-full max-w-none": content.withoutCancelAction })}
              />
            </div>
            {content.customActions && (
              <div className={cx("flex items-center justify-between gap-2 mt-2")}>
                {content.customActions.map((action) => (
                  <Button
                    key={JSON.stringify(action)}
                    type="secondary"
                    title={action.label}
                    onClick={() => {
                      if (action.type == "VALIDATE") {
                        onConfirm({
                          rejectionReason,
                          rejectionMessage,
                          state: action.status,
                        });
                      } else if (action.type == "URL") {
                        window.open(action.url, "_blank")?.focus();
                      }
                    }}
                    className="grow"
                  />
                ))}
              </div>
            )}

            {content.infoLink && (
              <div className="flex items-center justify-center pt-6">
                <a
                  href={content.infoLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-transparent px-3 py-2 text-blue-600 drop-shadow-sm hover:cursor-pointer hover:text-blue-700 hover:underline disabled:opacity-60 disabled:hover:text-blue-600 disabled:hover:no-underline">
                  {content.infoLink.text}
                </a>
              </div>
            )}
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
}
