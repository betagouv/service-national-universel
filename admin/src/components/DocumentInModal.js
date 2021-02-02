import React from "react";
import { Modal } from "reactstrap";
import { Page, Document, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function DocumentInModal({ value, onChange }) {
  if (!value || !value.data || !value.data.data) return <div />;
  const arrayBufferView = new Uint8Array(value.data.data);
  const blob = new Blob([arrayBufferView], { type: value.mimeType });
  const urlCreator = window.URL || window.webkitURL;
  const imageUrl = urlCreator.createObjectURL(blob);

  function renderFile() {
    if (value.mimeType === "application/pdf") {
      return (
        <Document file={imageUrl} onLoadSuccess={() => {}} onLoadError={console.error}>
          <Page pageNumber={1} />
        </Document>
      );
    } else {
      return <img style={{ objectFit: "contain", height: "90vh" }} src={imageUrl} />;
    }
  }
  return (
    <Modal size="lg" isOpen={true} toggle={onChange}>
      {renderFile()}
    </Modal>
  );
}
