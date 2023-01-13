import React from "react";

export default function NabBar({ steps }) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step) => (
          <li key={step.name} className="md:flex-1">
            {step.status === "complete" || step.status === "current" ? (
              <div className="flex flex-col border-l-4 border-blue-600 py-2 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                <span className="text-sm font-medium text-blue-600 uppercase">{step.id}</span>
                <span className="text-sm font-medium text-gray-900">{step.name}</span>
              </div>
            ) : (
              <div className="flex flex-col border-l-4 border-gray-200 py-2 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                <span className="text-sm font-medium text-gray-500 uppercase">{step.id}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
