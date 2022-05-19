import * as React from "react"

const ChevronRight = (props) => (
  <svg
    width={6}
    height={10}
    viewBox="0 0 6 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.293 9.707a1 1 0 0 1 0-1.414L3.586 5 .293 1.707A1 1 0 0 1 1.707.293l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
      fill="currentColor"
    />
  </svg>
)

export default ChevronRight
