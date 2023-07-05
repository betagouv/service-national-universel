import Link from "next/link";

export default function Footer() {
  return (
    <footer className="wrapper flex w-full flex-col gap-6 bg-white print:hidden ">
      <div className="wrapper flex w-full flex-col gap-6">
        <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
          <Link href="https://www.snu.gouv.fr/mentions-legales-10">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Mentions légales</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.snu.gouv.fr/accessibilite-du-site-24">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Accessibilité</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Données personnelles et cookies</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://moncompte.snu.gouv.fr/conditions-generales-utilisation">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Conditions générales d&apos;utilisation</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.snu.gouv.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">SNU</span>
          </Link>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
          <span className="cursor-pointer text-center text-xs text-[#6A6A6A]">Tous droits réservés - Ministère de l&apos;éducation nationale et de la jeunesse - 2022</span>
        </div>
        <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
          <Link href="https://www.gouvernement.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">gouvernement.fr</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.education.gouv.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">education.gouv.fr</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://jeunes.gouv.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">jeunes.gouv.fr</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://presaje.sga.defense.gouv.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">majdc.fr</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.service-public.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">service-public.fr</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.legifrance.gouv.fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">legifrance.gouv.fr</span>
          </Link>
          <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
          <Link href="https://www.data.gouv.fr/fr/">
            <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">data.gouv.fr</span>
          </Link>
        </div>
        {/* <span href="#">
            <span className="text-[#6A6A6A] text-xs cursor-pointer shrink-0">Plan du site</span>
          </Link>
          <span className="text-[#E5E5E5] text-base hidden md:block">|</span> */}
      </div>
    </footer>
  );
}
