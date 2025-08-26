import * as React from "react";

const SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({color="#061400",...props}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M12 7.5a3 3 0 0 1-6 0M2.327 4.525h13.346M2.55 4.1a1.5 1.5 0 0 0-.3.9v10a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V5a1.5 1.5 0 0 0-.3-.9l-1.5-2a1.5 1.5 0 0 0-1.2-.6h-7.5a1.5 1.5 0 0 0-1.2.6z"
    ></path>
  </svg>
);

export default SvgIcon;
