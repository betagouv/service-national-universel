import React from "react";

function Calendar(props) {
  return (
    <svg width={42} height={46} fill="none" viewBox="0 0 42 46" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="#474747" d="M0 0h42v46H0z" />
      <path fill="#F4F5F7" d="M-823-277H617v2044H-823z" />
      <g filter="url(#a)">
        <rect x={-542} y={-238} width={1129} height={1929} rx={8} fill="#fff" />
      </g>
      <rect x={-482} y={-43} width={1009} height={131} rx={16} fill="#F9FAFB" />
      <rect width={42} height={46} rx={8} fill="#fff" />
      <text
        fill="#EC6316"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontFamily="Marianne"
        fontSize={10}
        fontWeight={500}
        letterSpacing={0}>
        <tspan x={9.818} y={14.07}>
          {props.month}
        </tspan>
      </text>
      <text
        fill="#3F444A"
        xmlSpace="preserve"
        style={{
          whiteSpace: "pre",
        }}
        fontFamily="Marianne"
        fontSize={19}
        fontWeight="bold"
        letterSpacing={0}>
        <tspan x={10.5} y={35.283}>
          {props.date}
        </tspan>
      </text>
      <defs>
        <filter id="a" x={-555} y={-243} width={1155} height={1955} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius={3} in="SourceAlpha" result="effect1_dropShadow_305_4218" />
          <feOffset dy={8} />
          <feGaussianBlur stdDeviation={8} />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_305_4218" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow_305_4218" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

export default Calendar;
