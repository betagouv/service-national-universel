import Container from "@/components/layout/Container";
import React from "react";
import CurrentSejourNotice from "./CurrentSejourNotice";
import useAuth from "@/services/useAuth";
import { isDoingPhase1 } from "@/utils";

export default function ChangeSejourContainer({ title, backlink, children }) {
  const { young } = useAuth();
  return (
    <Container title={title} backlink={backlink}>
      <div className="max-w-3xl mx-auto">
        {isDoingPhase1(young) ? <CurrentSejourNotice /> : null}
        <div className="rounded-lg md:border md:my-8 md:px-24 pb-12">{children}</div>
      </div>
    </Container>
  );
}
