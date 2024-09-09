import React, { useState } from "react";
import { BsSend } from "react-icons/bs";
import { MdContentCopy } from "react-icons/md";

import { Modal, Button } from "@snu/ds/admin";
import { ProfilePic } from "@snu/ds";
import { copyToClipboard } from "@/utils";
import { appURL } from "@/config";

interface Props {
  url: string;
}

export default function ButtonLinkInvite({ url }: Props) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal" onClick={() => setShowModal(true)}>
        Inviter les élèves via un lien
      </button>
      <Modal
        isOpen={showModal}
        className="max-w-[700px]"
        onClose={() => setShowModal(false)}
        content={
          <div className="flex flex-col items-center justify-center">
            <ProfilePic icon={({ size, className }) => <BsSend size={size} className={className} />} />
            <h1 className="text-xl leading-7 font-medium text-gray-900 mt-6">Invitez des élèves à rejoindre votre classe !</h1>
            <p className="text-base leading-5 font-normal text-gray-900 mt-6 mb-3">Vous pouvez inviter des élèves à rejoindre votre classe en leur partageant ce lien : </p>
            <a href={url} className="text-base leading-5 font-normal text-blue-600" rel="noreferrer" target="_blank">
              {url}
            </a>
            <Button
              type="secondary"
              leftIcon={<MdContentCopy className="h-5 w-5" />}
              title="Copier le lien"
              className="mt-6 !w-80 flex items-center justify-center"
              onClick={() => {
                copyToClipboard(`${appURL}/je-rejoins-ma-classe-engagee/${url}`);
                setShowModal(false);
              }}
            />
          </div>
        }
      />
    </>
  );
}
