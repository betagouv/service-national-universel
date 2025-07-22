// https://github.com/ianstormtaylor/slate/blob/main/site/components.tsx

import React from "react";
import ReactDOM from "react-dom";

export const TextEditorButton = React.forwardRef(({ className, active, reversed, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={`${reversed ? (active ? "text-white" : "text-gray-300") : active ? "text-black" : "text-coolGray-400"} mr-2 cursor-pointer ${className || ""}`}
  />
));

export const EditorValue = React.forwardRef(({ className, value, ...props }, ref) => {
  const textLines = value.document.nodes
    .map((node) => node.text)
    .toArray()
    .join("\n");
  return (
    <div ref={ref} {...props} className={`-mx-5 mt-8 ${className || ""}`}>
      <div className={`border-2 bg-gray-200 py-1 px-5 text-sm text-gray-600 ${className}`}>Slate's value as text</div>
      <div className={`whitespace-pre-wrap border-2 bg-gray-200 py-3 px-5 font-mono text-xs text-gray-600 ${className || ""}`}>{textLines}</div>
    </div>
  );
});

export const Icon = React.forwardRef(({ className, ...props }, ref) => <span {...props} ref={ref} className={`material-icons align-text-bottom text-2xl ${className || ""}`} />);

export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={`-mx-5 mb-2 whitespace-pre-wrap bg-gray-200 py-3 px-5 text-sm ${className || ""}`} />
));

export const Menu = React.forwardRef(({ className, children, ...props }, ref) => (
  <div {...props} ref={ref} className={`${className || ""}`}>
    {children}
  </div>
));

export const Portal = ({ children }) => {
  return typeof document === "object" ? ReactDOM.createPortal(children, document.body) : null;
};

export const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
  <Menu {...props} ref={ref} className={`relative mb-5 flex shrink-0 border-2 px-5 pt-1 ${className || ""}`} />
));

export const Spacer = React.forwardRef(({ className, ...props }, ref) => <div {...props} ref={ref} className={`relative w-6 ${className || ""}`} />);

TextEditorButton.displayName = "TextEditorButton";
EditorValue.displayName = "EditorValue";
Icon.displayName = "Icon";
Instruction.displayName = "Instruction";
Menu.displayName = "Menu";
Toolbar.displayName = "Toolbar";
Spacer.displayName = "Spacer";
