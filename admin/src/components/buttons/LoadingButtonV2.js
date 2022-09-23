import React from "react";
import { Spinner } from "reactstrap";

export default function LoadingButton({ loading, children, disabled, loadingText, style, ...rest }) {
  return (
    <button
      disabled={loading || disabled}
      className={`whitespace-nowrap overflow-hidden text-ellipsis m-0 ${loading || disabled ? "cursor-not-allowed" : "cursor-pointer"} ${style}`}
      {...rest}>
      {loading && loadingText && (
        <>
          <Spinner size="sm" key={loadingText} className="border-[0.1em] mr-[0.5em]" />
          {loadingText}
        </>
      )}
      {loading && !loadingText && <Spinner size="sm" className="border-[0.1em]" />}
      {!loading && children}
    </button>
  );
}
