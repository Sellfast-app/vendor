import * as React from "react";

const Settings: React.FC<React.SVGProps<SVGSVGElement>> = ({color="#061400",...props}) => (
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
      d="M7.253 3.103a1.755 1.755 0 0 1 3.494 0 1.754 1.754 0 0 0 2.49 1.436 1.755 1.755 0 0 1 1.747 3.025 1.756 1.756 0 0 0 0 2.873 1.755 1.755 0 0 1-1.747 3.025 1.756 1.756 0 0 0-2.49 1.436 1.755 1.755 0 0 1-3.494 0 1.755 1.755 0 0 0-2.49-1.436 1.755 1.755 0 0 1-1.747-3.025 1.755 1.755 0 0 0 0-2.873 1.755 1.755 0 0 1 1.746-3.025 1.755 1.755 0 0 0 2.49-1.436M11.25 9a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
    ></path>
  </svg>
);

export default Settings;
