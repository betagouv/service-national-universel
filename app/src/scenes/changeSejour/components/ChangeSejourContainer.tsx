import Container from "@/components/layout/Container";
import React from "react";
import CurrentSejourNotice from "./CurrentSejourNotice";

export default function ChangeSejourContainer({ title, backlink, children }) {
  return (
    <Container title={title} backlink={backlink}>
      <div className="max-w-3xl mx-auto">
        <CurrentSejourNotice />
        <div className="rounded-lg md:border md:my-8 md:px-24 pb-12">{children}</div>
      </div>
    </Container>
  );
}
