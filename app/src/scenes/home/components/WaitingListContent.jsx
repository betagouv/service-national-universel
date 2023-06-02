import LinkInline from "../../../components/ui/links/LinkInline";
import React from "react";

function WaitingListContent({ showLinks }) {
  if (showLinks == true) {
    return (
      <>
        <p>
          Des places peuvent se libérer à tout moment. Si vous le souhaitez, vous pouvez donc être convoqué(e) dans les prochains jours et jusqu’à l’avant-veille du départ en
          séjour. Pour cela, vous n’avez rien à faire : restez inscrit à ce séjour.
        </p>
        <p>
          Par contre, si vous ne souhaitez pas recevoir une convocation tardive, vous pouvez choisir de vous{" "}
          <LinkInline to="/changer-de-sejour">positionner sur un séjour à venir</LinkInline> ou bien{" "}
          <LinkInline to="account/general?desistement=1">retirer votre candidature</LinkInline>.
        </p>
      </>
    );
  }
  return <p>Votre inscription au SNU est bien validée. Nous vous recontacterons dès qu’une place se libère dans les prochains jours.</p>;
}

export default WaitingListContent;
