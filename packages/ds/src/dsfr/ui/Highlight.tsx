import React from "react";
import {
  Highlight as DSFRHighlight,
  HighlightProps,
} from "@codegouvfr/react-dsfr/Highlight";

export default function Highlight({ size, children }: HighlightProps) {
  <DSFRHighlight size={size}>{children}</DSFRHighlight>;
}
