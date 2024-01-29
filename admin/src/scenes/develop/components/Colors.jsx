import React from "react";
import { Container } from "@snu/ds/admin";

export default function Colors() {
  const names = ["gray", "red", "orange", "amber", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "pink", "rose"];
  const shades = ["950", "900", "800", "700", "600", "500", "400", "300", "200", "100", "50"];

  return (
    <Container title="Colors">
      <div className="flex items-start justify-between">
        {names.map((name) => (
          <div key={name} className="flex flex-col items-stretch justify-start mb-6">
            <h1 className="font-bold text-sm text-center capitalize">{name}</h1>
            <div className="flex flex-col items-stretch justify-start">
              {shades.map((shade) => (
                <div key={shade} className={`flex items-center justify-center w-full h-12 bg-${name}-${shade}`} style={{ textShadow: "0 0 2px white" }}>
                  {shade}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
