import React from "react";
import { Spinner } from "reactstrap";

export default function LoadingButton({ loading, children, disabled, loadingText, style, ...rest }) {
  return (
    <button
      disabled={loading || disabled}
      className={`m-0 overflow-hidden text-ellipsis whitespace-nowrap ${loading || disabled ? "cursor-not-allowed" : "cursor-pointer"} ${style}`}
      {...rest}>
      {loading && loadingText && (
        <>
          <Spinner size="sm" key={loadingText} className="mr-[0.5em] border-[0.1em]" />
          {loadingText}
        </>
      )}
      {loading && !loadingText && <Spinner size="sm" className="border-[0.1em]" />}
      {!loading && children}
    </button>
  );
}
