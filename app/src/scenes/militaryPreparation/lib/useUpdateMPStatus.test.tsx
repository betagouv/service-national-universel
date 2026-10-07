import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { applyMiddleware, combineReducers, createStore } from "redux";
import thunk from "redux-thunk";
import { toastr } from "react-redux-toastr";
import { afterEach, describe, expect, it, vi } from "vitest";

import reducers from "@/redux/reducers";
import API from "@/services/api";
import useUpdateMPStatus from "./useUpdateMPStatus";

vi.mock("@/services/api", () => ({ default: { put: vi.fn() } }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderWithProviders(young: any) {
  const store = createStore(combineReducers({ ...reducers }), { Auth: { young } }, applyMiddleware(thunk));
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  return { store, wrapper };
}

describe("useUpdateMPStatus", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("met à jour le young dans le store et affiche un succès quand la mutation réussit", async () => {
    const young = { _id: "young-1", statusMilitaryPreparationFiles: null };
    const updatedYoung = { _id: "young-1", statusMilitaryPreparationFiles: "WAITING_VERIFICATION" };
    vi.mocked(API.put).mockResolvedValueOnce({ ok: true, code: "OK", data: updatedYoung });
    const successSpy = vi.spyOn(toastr, "success");
    const errorSpy = vi.spyOn(toastr, "error");

    const { store, wrapper } = renderWithProviders(young);
    const { result } = renderHook(() => useUpdateMPStatus(), { wrapper });

    act(() => {
      result.current.mutate("WAITING_VERIFICATION");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(store.getState().Auth.young).toEqual(updatedYoung);
    expect(successSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("n'affiche pas de succès et ne vide pas le young du store quand la mutation échoue", async () => {
    const young = { _id: "young-1", statusMilitaryPreparationFiles: "REFUSED" };
    vi.mocked(API.put).mockResolvedValueOnce({ ok: false, code: "FORBIDDEN", data: undefined });
    const successSpy = vi.spyOn(toastr, "success");
    const errorSpy = vi.spyOn(toastr, "error");

    const { store, wrapper } = renderWithProviders(young);
    const { result } = renderHook(() => useUpdateMPStatus(), { wrapper });

    act(() => {
      result.current.mutate("VALIDATED");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(store.getState().Auth.young).toEqual(young);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(successSpy).not.toHaveBeenCalled();
  });
});
