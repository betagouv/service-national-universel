import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Phase2 from "./index";

vi.mock("../../sentry", async () => ({ SentryRoute: (await import("react-router-dom")).Route }));
vi.mock("../../hooks/useDocumentTitle", () => ({ default: () => {} }));
vi.mock("./scenes/Home", () => ({ default: () => <h1>Phase engagement</h1> }));
vi.mock("./scenes/MesEngagements", () => ({ default: () => null }));
vi.mock("./scenes/Program", () => ({ default: () => null }));
vi.mock("./scenes/MonEquivalence/MonEquivalence", () => ({ default: () => <h1>Mon équivalence</h1> }));
vi.mock("./scenes/MonEquivalence/EditEquivalence", () => ({ default: () => <h1>Modifier mon équivalence</h1> }));

function renderPhase2(path) {
  const history = createMemoryHistory({ initialEntries: [path] });
  render(
    <Router history={history}>
      <Phase2 />
    </Router>,
  );
  return history;
}

describe("Routes de la phase Engagement", () => {
  afterEach(cleanup);

  it("redirige l'ancien lien de dépôt vers l'accueil de la phase", () => {
    const history = renderPhase2("/phase2/equivalence");

    expect(history.location.pathname).toBe("/phase2");
    expect(screen.getByRole("heading", { name: "Phase engagement" })).toBeTruthy();
  });

  it.each([
    ["/phase2/equivalence/123", "Mon équivalence"],
    ["/phase2/equivalence/123/edit", "Modifier mon équivalence"],
  ])("conserve l'accès à %s", (path, title) => {
    renderPhase2(path);

    expect(screen.getByRole("heading", { name: title })).toBeTruthy();
  });
});
