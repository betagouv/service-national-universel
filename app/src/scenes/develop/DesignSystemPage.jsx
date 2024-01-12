import React from "react";
import { Page, Header, Subheader, Container } from "@snu/ds/admin";
import { CiPalette } from "react-icons/ci";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export default function DesignSystemPage() {
  return (
    <Page>
      <Header
        title="Design System"
        breadcrumb={[
          { href: "/", title: <CiPalette size={20} /> },
          { href: "/design-system", title: "Design System" },
        ]}
        actions={[<ButtonPrimary key="header-action-1">Click me</ButtonPrimary>]}
      />
      <Subheader title="Code, preview, test, build and ship." />
      <Container title="Hello...">
        <div className="text-ds-red">...World!</div>
      </Container>
    </Page>
  );
}
