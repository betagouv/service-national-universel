import plausibleEvent from "@/services/plausible";
import React from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import ReactTooltip from "react-tooltip";
import { ContactConvocationType } from "snu-lib";

export default function ContactConvocation({ contacts }: { contacts: ContactConvocationType[] }) {
  return (
    <div className="border px-4 py-3 rounded-xl bg-white">
      <ReactTooltip id="contact-convocation" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
        <p>Personne à contacter en cas d’urgence pendant que mon enfant est en séjour de cohésion.</p>
      </ReactTooltip>
      <p className="font-semibold">
        En cas de besoin
        <HiOutlineInformationCircle className="inline-block ml-2 text-gray-400" data-tip data-for="contact-convocation" />
      </p>
      {contacts?.map((contact) => (
        <div key={contact.contactMail} className="mt-3 grid lg:grid-cols-2">
          <div>
            <div className="flex gap-4">
              <p className="text-4xl">👤</p>
              <div>
                <p className="font-semibold">Mon point de contact</p>
                <p className="text-gray-400">{contact.contactName}</p>
                <div className="text-gray-400 hover:text-gray-600 underline underline-offset-2 md:hidden">
                  <p>
                    <a
                      href={`mailto:${contact.contactMail}`}
                      onClick={() => plausibleEvent("Phase1/Contact convocation - email")}
                      className="text-gray-400 underline underline-offset-2 hover:text-gray-600 hover:underline">
                      {contact.contactMail}
                    </a>
                  </p>
                  <p>
                    <a
                      href={`tel:${contact.contactPhone}`}
                      onClick={() => plausibleEvent("Phase1/Contact convocation - téléphone")}
                      className="text-gray-400 underline underline-offset-2 hover:text-gray-600 hover:underline">
                      {contact.contactPhone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p>
              <a
                href={`mailto:${contact.contactMail}`}
                onClick={() => plausibleEvent("Phase1/Contact convocation - email")}
                className="text-gray-400 underline underline-offset-2 hover:text-gray-600 hover:underline">
                {contact.contactMail}
              </a>
            </p>
            <p>
              <a
                href={`tel:${contact.contactPhone}`}
                onClick={() => plausibleEvent("Phase1/Contact convocation - téléphone")}
                className="text-gray-400 underline underline-offset-2 hover:text-gray-600 hover:underline">
                {contact.contactPhone}
              </a>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
