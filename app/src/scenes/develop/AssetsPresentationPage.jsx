/* eslint-disable prettier/prettier */

/* ------------------------------------------------------
   Cette Page est générée automatiquement par le script
   /utils/generate-assets-presentation-page.js
   ------------------------------------------------------ */

import React, { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";

import Closebluesvg_1 from "../../assets/CloseBlue.svg";
import Arrowrightbluesvg_2 from "../../assets/arrowRightBlue.svg";
import Attachmentsvg_2 from "../../assets/attachment.svg";
import Avatarjpg_2 from "../../assets/avatar.jpg";
import Biganglebluesvg_2 from "../../assets/big-angle-blue.svg";
import Biganglesvg_2 from "../../assets/big-angle.svg";
import Burgersvg_2 from "../../assets/burger.svg";
import Cancelpng_2 from "../../assets/cancel.png";
import Clicksvg_2 from "../../assets/click.svg";
import Clocksvg_2 from "../../assets/clock.svg";
import Closesvg_2 from "../../assets/close.svg";
import Crosspng_2 from "../../assets/cross.png";
import Editiconsvg_2 from "../../assets/editIcon.svg";
import Externallinksvg_2 from "../../assets/external-link.svg";
import Eyeslashsvg_2 from "../../assets/eye-slash.svg";
import Eyesvg_2 from "../../assets/eye.svg";
import Frpng_2 from "../../assets/fr.png";
import Hero2png_2 from "../../assets/hero-2.png";
import Herobannerpng_2 from "../../assets/hero-banner.png";
import Heropng_2 from "../../assets/hero.png";
import Homesvg_2 from "../../assets/home.svg";
import Homephase2desktoppng_2 from "../../assets/homePhase2Desktop.png";
import Homephase2mobilepng_2 from "../../assets/homePhase2Mobile.png";
import Humancooperationsvg_2 from "../../assets/humanCooperation.svg";
import Imagediagorentepng_3 from "../../assets/image-diagorente.png";
import Imagesvg_3 from "../../assets/image.svg";
import Infosquaredsvg_3 from "../../assets/infoSquared.svg";
import Infobulleiconsvg_3 from "../../assets/infobulleIcon.svg";
import Informationsvg_3 from "../../assets/information.svg";
import Jvapng_3 from "../../assets/jva.png";
import Leftsvg_3 from "../../assets/left.svg";
import Locationsvg_3 from "../../assets/location.svg";
import Loginjpg_3 from "../../assets/login.jpg";
import Logodiagorientebluepng_3 from "../../assets/logo-diagoriente-blue.png";
import Logodiagorientewhitepng_3 from "../../assets/logo-diagoriente-white.png";
import Logosnupng_3 from "../../assets/logo-snu.png";
import Mappng_3 from "../../assets/map.png";
import Marinejpg_3 from "../../assets/marine.jpg";
import Menusvg_3 from "../../assets/menu.svg";
import Militarypreppng_3 from "../../assets/militaryPrep.png";
import Militaryprepmobilepng_3 from "../../assets/militaryPrepMobile.png";
import Observesvg_5 from "../../assets/observe.svg";
import Pensvg_5 from "../../assets/pen.svg";
import Phase1donepng_5 from "../../assets/phase1done.png";
import Phase2headerpng_5 from "../../assets/phase2Header.png";
import Phase2mobileheaderpng_5 from "../../assets/phase2MobileHeader.png";
import Phase2mobilereconnaissancepng_5 from "../../assets/phase2MobileReconnaissance.png";
import Phase2reconnaissancepng_5 from "../../assets/phase2Reconnaissance.png";
import Phase3jpg_5 from "../../assets/phase3.jpg";
import Pmpng_5 from "../../assets/pm.png";
import Policestationsvg_5 from "../../assets/police-station.svg";
import Prepapng_6 from "../../assets/prépa.png";
import Questionmarksvg_6 from "../../assets/question-mark.svg";
import Radioinputsvg_6 from "../../assets/radioInput.svg";
import Radiouncheckedsvg_6 from "../../assets/radioUnchecked.svg";
import Rightsvg_6 from "../../assets/right.svg";
import Roundleftsvg_6 from "../../assets/roundLeft.svg";
import Roundrightsvg_6 from "../../assets/roundRight.svg";
import Rubberstampnotvalidedsvg_6 from "../../assets/rubberStampNotValided.svg";
import Rubberstampvalidedsvg_6 from "../../assets/rubberStampValided.svg";
import Smalllogosvg_6 from "../../assets/small-logo.svg";
import Tabrulesyoungpng_6 from "../../assets/tabRulesYoung.png";
import Toolspng_7 from "../../assets/tools.png";
import Trophysvg_7 from "../../assets/trophy.svg";
import Validatedphase2png_7 from "../../assets/validatedPhase2.png";
import Warningpng_7 from "../../assets/warning.png";
import Cninewbackjpg_2 from "../../assets/IDProof/cniNewBack.jpg";
import Cninewdatejpg_2 from "../../assets/IDProof/cniNewDate.jpg";
import Cninewfrontjpg_2 from "../../assets/IDProof/cniNewFront.jpg";
import Cnioldbackjpg_2 from "../../assets/IDProof/cniOldBack.jpg";
import Cniolddatejpg_2 from "../../assets/IDProof/cniOldDate.jpg";
import Cnioldfrontjpg_2 from "../../assets/IDProof/cniOldFront.jpg";
import Passportjpg_2 from "../../assets/IDProof/passport.jpg";
import Passportdatejpg_2 from "../../assets/IDProof/passportDate.jpg";
import Citizenshipsvg_5 from "../../assets/mission-domains/citizenship.svg";
import Culturesvg_5 from "../../assets/mission-domains/culture.svg";
import Defaultsvg_5 from "../../assets/mission-domains/default.svg";
import Defensesvg_5 from "../../assets/mission-domains/defense.svg";
import Educationsvg_5 from "../../assets/mission-domains/education.svg";
import Environmentsvg_5 from "../../assets/mission-domains/environment.svg";
import Healthsvg_5 from "../../assets/mission-domains/health.svg";
import Securitysvg_5 from "../../assets/mission-domains/security.svg";
import Solidaritysvg_5 from "../../assets/mission-domains/solidarity.svg";
import Sportsvg_5 from "../../assets/mission-domains/sport.svg";
import Bafajpg_6 from "../../assets/programmes-engagement/bafa.jpg";
import Benevolejpg_6 from "../../assets/programmes-engagement/benevole.jpg";
import Brevetfederauxjpg_6 from "../../assets/programmes-engagement/brevet-federaux.jpg";
import Cecjpg_6 from "../../assets/programmes-engagement/cec.jpg";
import Corpseuropeensolidaritepng_6 from "../../assets/programmes-engagement/corps-europeen-solidarite.png";
import Defaultpng_6 from "../../assets/programmes-engagement/default.png";
import Erasmusjpg_6 from "../../assets/programmes-engagement/erasmus.jpg";
import Jeveuxaiderjpg_6 from "../../assets/programmes-engagement/je-veux-aider.jpg";
import Jeunebenevolejpg_6 from "../../assets/programmes-engagement/jeune-benevole.jpg";
import Juniorsassociationjpg_6 from "../../assets/programmes-engagement/juniors-association.jpg";
import Planmercredipng_6 from "../../assets/programmes-engagement/plan-mercredi.png";
import Reservearmeesjpg_6 from "../../assets/programmes-engagement/reserve-armees.jpg";
import Reserveeducationjpg_6 from "../../assets/programmes-engagement/reserve-education.jpg";
import Reservegendarmeriejpg_6 from "../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import Reservepolicejpg_6 from "../../assets/programmes-engagement/reserve-police.jpg";
import Sapeurpompier2jpg_6 from "../../assets/programmes-engagement/sapeur-pompier-2.jpg";
import Sapeurpompierjpg_6 from "../../assets/programmes-engagement/sapeur-pompier.jpg";
import Serviceciviqueinternationaljpg_6 from "../../assets/programmes-engagement/service-civique-international.jpg";
import Serviceciviquejpg_6 from "../../assets/programmes-engagement/service-civique.jpg";
import Volontariatsolidariteinternationalejpg_6 from "../../assets/programmes-engagement/volontariat-solidarite-internationale.jpg";
import Temoignageellyjpg_7 from "../../assets/temoignages/temoignage-elly.jpg";
import Temoignagejuliepng_7 from "../../assets/temoignages/temoignage-julie.png";
import Temoignageleilasamuelelisapng_7 from "../../assets/temoignages/temoignage-leila-samuel-elisa.png";
import Temoignageorianemaellejpg_7 from "../../assets/temoignages/temoignage-oriane-maelle.jpg";

export default function AssetsPresentationPage() {
  const [filter, setFilter] = useState("");
  useEffect(() => {
    const filterText = filter && filter.trim().length > 0 ? filter.trim().toLowerCase() : "";
    if (filterText && filterText.length > 0) {
      document.querySelectorAll("[data-name]").forEach((element) => {
        if (element.getAttribute("data-name").indexOf(filterText) >= 0) {
          element.style.display = "block";
        } else {
          element.style.display = "none";
        }
      });
    } else {
      document.querySelectorAll("[data-name]").forEach((element) => {
        element.style.display = "block";
      });
    }
  }, [filter]);
  function changeFilter(e) {
    setFilter(e.target.value);
  }
  function resetFilter() {
    setFilter("");
  }
  return (
    <div className="p-8">
      <div className="flex items-center justify-center">
        <div className="mr-2 text-[#BBBBBB]">Filtre :</div>
        <input type="text" value={filter} onChange={changeFilter} className="p-1 border-[1px] border-[#BBBBBB] rounded-md" />
        <div
          className="ml-2 w-[24px] h-[24px] text-[#BBBBBB] hover:border-[1px] hover:border-[#DDDDDD] rounded-md hover:text-[#808080] cursor-pointer flex items-center justify-center"
          onClick={resetFilter}>
          <div className="w-[10px] h-[10px]">
            <HiX />
          </div>
        </div>
      </div>
      <div className="">
        <div className="text-3xl font-bold text-[#000000] my-8">assets</div>
        <div className="grid grid-cols-8 gap-4">
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="closeblue.svg">
            <img src={Closebluesvg_1} alt="CloseBlue.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">CloseBlue.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="arrowrightblue.svg">
            <img src={Arrowrightbluesvg_2} alt="arrowRightBlue.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">arrowRightBlue.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="attachment.svg">
            <img src={Attachmentsvg_2} alt="attachment.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">attachment.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="avatar.jpg">
            <img src={Avatarjpg_2} alt="avatar.jpg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">avatar.jpg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="big-angle-blue.svg">
            <img src={Biganglebluesvg_2} alt="big-angle-blue.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">big-angle-blue.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="big-angle.svg">
            <img src={Biganglesvg_2} alt="big-angle.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">big-angle.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="burger.svg">
            <img src={Burgersvg_2} alt="burger.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">burger.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cancel.png">
            <img src={Cancelpng_2} alt="cancel.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cancel.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="click.svg">
            <img src={Clicksvg_2} alt="click.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">click.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="clock.svg">
            <img src={Clocksvg_2} alt="clock.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">clock.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="close.svg">
            <img src={Closesvg_2} alt="close.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">close.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cross.png">
            <img src={Crosspng_2} alt="cross.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cross.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="editicon.svg">
            <img src={Editiconsvg_2} alt="editIcon.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">editIcon.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="external-link.svg">
            <img src={Externallinksvg_2} alt="external-link.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">external-link.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="eye-slash.svg">
            <img src={Eyeslashsvg_2} alt="eye-slash.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">eye-slash.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="eye.svg">
            <img src={Eyesvg_2} alt="eye.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">eye.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="fr.png">
            <img src={Frpng_2} alt="fr.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">fr.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="hero-2.png">
            <img src={Hero2png_2} alt="hero-2.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">hero-2.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="hero-banner.png">
            <img src={Herobannerpng_2} alt="hero-banner.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">hero-banner.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="hero.png">
            <img src={Heropng_2} alt="hero.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">hero.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="home.svg">
            <img src={Homesvg_2} alt="home.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">home.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="homephase2desktop.png">
            <img src={Homephase2desktoppng_2} alt="homePhase2Desktop.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">homePhase2Desktop.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="homephase2mobile.png">
            <img src={Homephase2mobilepng_2} alt="homePhase2Mobile.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">homePhase2Mobile.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="humancooperation.svg">
            <img src={Humancooperationsvg_2} alt="humanCooperation.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">humanCooperation.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="image-diagorente.png">
            <img src={Imagediagorentepng_3} alt="image-diagorente.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">image-diagorente.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="image.svg">
            <img src={Imagesvg_3} alt="image.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">image.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="infosquared.svg">
            <img src={Infosquaredsvg_3} alt="infoSquared.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">infoSquared.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="infobulleicon.svg">
            <img src={Infobulleiconsvg_3} alt="infobulleIcon.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">infobulleIcon.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="information.svg">
            <img src={Informationsvg_3} alt="information.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">information.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="jva.png">
            <img src={Jvapng_3} alt="jva.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">jva.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="left.svg">
            <img src={Leftsvg_3} alt="left.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">left.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="location.svg">
            <img src={Locationsvg_3} alt="location.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">location.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="login.jpg">
            <img src={Loginjpg_3} alt="login.jpg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">login.jpg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="logo-diagoriente-blue.png">
            <img src={Logodiagorientebluepng_3} alt="logo-diagoriente-blue.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">logo-diagoriente-blue.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="logo-diagoriente-white.png">
            <img src={Logodiagorientewhitepng_3} alt="logo-diagoriente-white.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">logo-diagoriente-white.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="logo-snu.png">
            <img src={Logosnupng_3} alt="logo-snu.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">logo-snu.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="map.png">
            <img src={Mappng_3} alt="map.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">map.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="marine.jpg">
            <img src={Marinejpg_3} alt="marine.jpg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">marine.jpg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="menu.svg">
            <img src={Menusvg_3} alt="menu.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">menu.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="militaryprep.png">
            <img src={Militarypreppng_3} alt="militaryPrep.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">militaryPrep.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="militaryprepmobile.png">
            <img src={Militaryprepmobilepng_3} alt="militaryPrepMobile.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">militaryPrepMobile.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="observe.svg">
            <img src={Observesvg_5} alt="observe.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">observe.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="pen.svg">
            <img src={Pensvg_5} alt="pen.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">pen.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="phase1done.png">
            <img src={Phase1donepng_5} alt="phase1done.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">phase1done.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="phase2header.png">
            <img src={Phase2headerpng_5} alt="phase2Header.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">phase2Header.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="phase2mobileheader.png">
            <img src={Phase2mobileheaderpng_5} alt="phase2MobileHeader.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">phase2MobileHeader.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="phase2mobilereconnaissance.png">
            <img src={Phase2mobilereconnaissancepng_5} alt="phase2MobileReconnaissance.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">phase2MobileReconnaissance.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="phase2reconnaissance.png">
            <img src={Phase2reconnaissancepng_5} alt="phase2Reconnaissance.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">phase2Reconnaissance.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="phase3.jpg">
            <img src={Phase3jpg_5} alt="phase3.jpg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">phase3.jpg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="pm.png">
            <img src={Pmpng_5} alt="pm.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">pm.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="police-station.svg">
            <img src={Policestationsvg_5} alt="police-station.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">police-station.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="prépa.png">
            <img src={Prepapng_6} alt="prépa.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">prépa.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="question-mark.svg">
            <img src={Questionmarksvg_6} alt="question-mark.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">question-mark.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="radioinput.svg">
            <img src={Radioinputsvg_6} alt="radioInput.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">radioInput.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="radiounchecked.svg">
            <img src={Radiouncheckedsvg_6} alt="radioUnchecked.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">radioUnchecked.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="right.svg">
            <img src={Rightsvg_6} alt="right.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">right.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="roundleft.svg">
            <img src={Roundleftsvg_6} alt="roundLeft.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">roundLeft.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="roundright.svg">
            <img src={Roundrightsvg_6} alt="roundRight.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">roundRight.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="rubberstampnotvalided.svg">
            <img src={Rubberstampnotvalidedsvg_6} alt="rubberStampNotValided.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">rubberStampNotValided.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="rubberstampvalided.svg">
            <img src={Rubberstampvalidedsvg_6} alt="rubberStampValided.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">rubberStampValided.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="small-logo.svg">
            <img src={Smalllogosvg_6} alt="small-logo.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">small-logo.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="tabrulesyoung.png">
            <img src={Tabrulesyoungpng_6} alt="tabRulesYoung.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">tabRulesYoung.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="tools.png">
            <img src={Toolspng_7} alt="tools.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">tools.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="trophy.svg">
            <img src={Trophysvg_7} alt="trophy.svg" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">trophy.svg</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="validatedphase2.png">
            <img src={Validatedphase2png_7} alt="validatedPhase2.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">validatedPhase2.png</div>
          </div>
          <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="warning.png">
            <img src={Warningpng_7} alt="warning.png" crossOrigin="anonymous" className="" />
            <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">warning.png</div>
          </div>
        </div>
        <div className="">
          <div className="">
            <div className="text-3xl font-bold text-[#000000] my-8">IDProof</div>
            <div className="grid grid-cols-8 gap-4">
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cninewback.jpg">
                <img src={Cninewbackjpg_2} alt="cniNewBack.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cniNewBack.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cninewdate.jpg">
                <img src={Cninewdatejpg_2} alt="cniNewDate.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cniNewDate.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cninewfront.jpg">
                <img src={Cninewfrontjpg_2} alt="cniNewFront.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cniNewFront.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cnioldback.jpg">
                <img src={Cnioldbackjpg_2} alt="cniOldBack.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cniOldBack.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cniolddate.jpg">
                <img src={Cniolddatejpg_2} alt="cniOldDate.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cniOldDate.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cnioldfront.jpg">
                <img src={Cnioldfrontjpg_2} alt="cniOldFront.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cniOldFront.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="passport.jpg">
                <img src={Passportjpg_2} alt="passport.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">passport.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="passportdate.jpg">
                <img src={Passportdatejpg_2} alt="passportDate.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">passportDate.jpg</div>
              </div>
            </div>
            <div className=""></div>
          </div>
          <div className="">
            <div className="text-3xl font-bold text-[#000000] my-8">icons</div>
            <div className="grid grid-cols-8 gap-4"></div>
            <div className=""></div>
          </div>
          <div className="">
            <div className="text-3xl font-bold text-[#000000] my-8">mission-domaines</div>
            <div className="grid grid-cols-8 gap-4"></div>
            <div className=""></div>
          </div>
          <div className="">
            <div className="text-3xl font-bold text-[#000000] my-8">mission-domains</div>
            <div className="grid grid-cols-8 gap-4">
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="citizenship.svg">
                <img src={Citizenshipsvg_5} alt="citizenship.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">citizenship.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="culture.svg">
                <img src={Culturesvg_5} alt="culture.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">culture.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="default.svg">
                <img src={Defaultsvg_5} alt="default.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">default.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="defense.svg">
                <img src={Defensesvg_5} alt="defense.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">defense.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="education.svg">
                <img src={Educationsvg_5} alt="education.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">education.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="environment.svg">
                <img src={Environmentsvg_5} alt="environment.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">environment.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="health.svg">
                <img src={Healthsvg_5} alt="health.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">health.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="security.svg">
                <img src={Securitysvg_5} alt="security.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">security.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="solidarity.svg">
                <img src={Solidaritysvg_5} alt="solidarity.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">solidarity.svg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="sport.svg">
                <img src={Sportsvg_5} alt="sport.svg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">sport.svg</div>
              </div>
            </div>
            <div className=""></div>
          </div>
          <div className="">
            <div className="text-3xl font-bold text-[#000000] my-8">programmes-engagement</div>
            <div className="grid grid-cols-8 gap-4">
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="bafa.jpg">
                <img src={Bafajpg_6} alt="bafa.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">bafa.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="benevole.jpg">
                <img src={Benevolejpg_6} alt="benevole.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">benevole.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="brevet-federaux.jpg">
                <img src={Brevetfederauxjpg_6} alt="brevet-federaux.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">brevet-federaux.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="cec.jpg">
                <img src={Cecjpg_6} alt="cec.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">cec.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="corps-europeen-solidarite.png">
                <img src={Corpseuropeensolidaritepng_6} alt="corps-europeen-solidarite.png" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">corps-europeen-solidarite.png</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="default.png">
                <img src={Defaultpng_6} alt="default.png" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">default.png</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="erasmus.jpg">
                <img src={Erasmusjpg_6} alt="erasmus.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">erasmus.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="je-veux-aider.jpg">
                <img src={Jeveuxaiderjpg_6} alt="je-veux-aider.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">je-veux-aider.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="jeune-benevole.jpg">
                <img src={Jeunebenevolejpg_6} alt="jeune-benevole.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">jeune-benevole.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="juniors-association.jpg">
                <img src={Juniorsassociationjpg_6} alt="juniors-association.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">juniors-association.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="plan-mercredi.png">
                <img src={Planmercredipng_6} alt="plan-mercredi.png" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">plan-mercredi.png</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="reserve-armees.jpg">
                <img src={Reservearmeesjpg_6} alt="reserve-armees.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">reserve-armees.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="reserve-education.jpg">
                <img src={Reserveeducationjpg_6} alt="reserve-education.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">reserve-education.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="reserve-gendarmerie.jpg">
                <img src={Reservegendarmeriejpg_6} alt="reserve-gendarmerie.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">reserve-gendarmerie.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="reserve-police.jpg">
                <img src={Reservepolicejpg_6} alt="reserve-police.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">reserve-police.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="sapeur-pompier-2.jpg">
                <img src={Sapeurpompier2jpg_6} alt="sapeur-pompier-2.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">sapeur-pompier-2.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="sapeur-pompier.jpg">
                <img src={Sapeurpompierjpg_6} alt="sapeur-pompier.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">sapeur-pompier.jpg</div>
              </div>
              <div
                className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center"
                data-name="service-civique-international.jpg">
                <img src={Serviceciviqueinternationaljpg_6} alt="service-civique-international.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">service-civique-international.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="service-civique.jpg">
                <img src={Serviceciviquejpg_6} alt="service-civique.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">service-civique.jpg</div>
              </div>
              <div
                className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center"
                data-name="volontariat-solidarite-internationale.jpg">
                <img src={Volontariatsolidariteinternationalejpg_6} alt="volontariat-solidarite-internationale.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">volontariat-solidarite-internationale.jpg</div>
              </div>
            </div>
            <div className=""></div>
          </div>
          <div className="">
            <div className="text-3xl font-bold text-[#000000] my-8">temoignages</div>
            <div className="grid grid-cols-8 gap-4">
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="temoignage-elly.jpg">
                <img src={Temoignageellyjpg_7} alt="temoignage-elly.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">temoignage-elly.jpg</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="temoignage-julie.png">
                <img src={Temoignagejuliepng_7} alt="temoignage-julie.png" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">temoignage-julie.png</div>
              </div>
              <div
                className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center"
                data-name="temoignage-leila-samuel-elisa.png">
                <img src={Temoignageleilasamuelelisapng_7} alt="temoignage-leila-samuel-elisa.png" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">temoignage-leila-samuel-elisa.png</div>
              </div>
              <div className="border-[1px] border-[#AAAAAA] bg-[#DDDDDD] p-4 relative mb-8 rounded-md flex items-center justify-center" data-name="temoignage-oriane-maelle.jpg">
                <img src={Temoignageorianemaellejpg_7} alt="temoignage-oriane-maelle.jpg" crossOrigin="anonymous" className="" />
                <div className="absolute top-[100%] left-[0] right-[0] mt-1 text-sm font-regular text-[#808080]">temoignage-oriane-maelle.jpg</div>
              </div>
            </div>
            <div className=""></div>
          </div>
        </div>
      </div>
    </div>
  );
}
