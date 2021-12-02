// https://github.com/ianstormtaylor/slate/blob/main/site/components.tsx

import React from "react";
import ReactDOM from "react-dom";

export const Button = React.forwardRef(({ className, active, reversed, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={`${reversed ? (active ? "text-white" : "text-gray-300") : active ? "text-black" : "text-coolGray-400"} cursor-pointer mr-2 ${className || ""}`}
  />
));

export const EditorValue = React.forwardRef(({ className, value, ...props }, ref) => {
  const textLines = value.document.nodes
    .map((node) => node.text)
    .toArray()
    .join("\n");
  return (
    <div ref={ref} {...props} className={`mt-8 -mx-5 ${className || ""}`}>
      <div className={`text-sm py-1 px-5 text-gray-600 border-2 bg-gray-200 ${className}`}>Slate's value as text</div>
      <div
        className={`text-xs font-mono whitespace-pre-wrap py-3 px-5 text-gray-600 border-2 bg-gray-200 ${className || ""}`}
        // className={css`
        //   div {
        //     margin: 0 0 0.5em;
        //   }
        // `}
      >
        {textLines}
      </div>
    </div>
  );
});

export const Icon = React.forwardRef(({ className, ...props }, ref) => <span {...props} ref={ref} className={`material-icons align-text-bottom text-lg ${className || ""}`} />);

export const Instruction = React.forwardRef(({ className, ...props }, ref) => (
  <div {...props} ref={ref} className={`whitespace-pre-wrap -mx-5 mb-2 py-3 px-5 text-sm bg-gray-200 ${className || ""}`} />
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
  <Menu {...props} ref={ref} className={`relative pt-1 px-5 mb-5 -mx-5 border-2 flex flex-shrink-0 ${className || ""}`} />
));

Button.displayName = "Button";
EditorValue.displayName = "EditorValue";
Icon.displayName = "Icon";
Instruction.displayName = "Instruction";
Menu.displayName = "Menu";
Toolbar.displayName = "Toolbar";
