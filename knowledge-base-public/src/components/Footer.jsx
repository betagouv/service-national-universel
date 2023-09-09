import Link from "next/link";
import { HiExternalLink } from "react-icons/hi";

export default function Footer() {
  return (
    <footer className="print:hidden">
      <div className="flex flex-col md:flex-row max-w-full flex-wrap md:items-center justify-center gap-4 p-3 border-t border-b px-4">
        <Link href="/sitemap">
          <span className="shrink-0 cursor-pointer text-xs">Plan du site</span>
        </Link>
        <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
        <Link href="https://www.snu.gouv.fr/mentions-legales-10">
          <span className="shrink-0 cursor-pointer text-xs">Mentions légales</span>
        </Link>
        <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
        <Link href="https://www.snu.gouv.fr/accessibilite-du-site-24">
          <span className="shrink-0 cursor-pointer text-xs">Accessibilité</span>
        </Link>
        <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
        <Link href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23">
          <span className="shrink-0 cursor-pointer text-xs">Données personnelles et cookies</span>
        </Link>
        <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
        <Link href="https://moncompte.snu.gouv.fr/conditions-generales-utilisation">
          <span className="shrink-0 cursor-pointer text-xs">Conditions générales d&apos;utilisation</span>
        </Link>
        <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
        <Link href="https://www.snu.gouv.fr/">
          <span className="shrink-0 cursor-pointer text-xs">SNU</span>
        </Link>
      </div>

      <div className="md:text-center text-xs text-gray-500 p-4 pb-2">Tous droits réservés - Ministère de l&apos;éducation nationale et de la jeunesse - 2023</div>

      <div className="flex max-w-full flex-wrap items-center md:justify-center md:gap-3 font-bold text-gray-800 px-2 pb-4">
        <Link href="https://www.gouvernement.fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          gouvernement.fr
          <HiExternalLink />
        </Link>

        <Link href="https://www.education.gouv.fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          education.gouv.fr
          <HiExternalLink />
        </Link>

        <Link href="https://jeunes.gouv.fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          jeunes.gouv.fr
          <HiExternalLink />
        </Link>

        <Link href="https://presaje.sga.defense.gouv.fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          majdc.fr
          <HiExternalLink />
        </Link>

        <Link href="https://www.service-public.fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          service-public.fr
          <HiExternalLink />
        </Link>

        <Link href="https://www.legifrance.gouv.fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          legifrance.gouv.fr
          <HiExternalLink />
        </Link>

        <Link href="https://www.data.gouv.fr/fr/" className="flex items-center gap-1 text-xs hover:bg-gray-100 p-2">
          data.gouv.fr
          <HiExternalLink />
        </Link>
      </div>
    </footer>
  );
}
