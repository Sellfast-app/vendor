import * as React from "react";

const TotalRevenueChart: React.FC<React.SVGProps<SVGElement>> = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="88"
    height="33"
    fill="none"
    viewBox="0 0 88 33"
  >
    <path
      stroke="#2E54FF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="0.869"
      d="M1.26 27.541c3.76-.804 6.852-5.709 11.338-6.533 2.39-.44 4.306.416 6.443 1.744 2.137 1.33 1.72 1.903 6.526 2.928 3.966.845 5.003-8.27 8.89-7.92s5.684-10.608 9.788-9.693c4.103.914 4.923-1.45 8.78 3.032 3.858 4.482 7.421-5.966 12.263-6.88 4.842-.916 6.104 8.794 8.401 8.428 2.298-.366 4.367 6.553 6.337 7.559s2.528-2.65 6.714-2.65"
    ></path>
    <path
      fill="url(#paint0_linear_178_165937)"
      d="M12.407 21.027C7.892 21.85 4.783 26.743 1 27.546v1.98h86V17.583c-4.211 0-4.773 3.647-6.755 2.643-1.981-1.004-4.063-7.907-6.375-7.542s-3.58-9.322-8.452-8.41c-4.872.913-8.457 11.338-12.338 6.866-3.88-4.473-4.705-2.113-8.834-3.026S38.31 18.137 34.4 17.787s-4.954 8.745-8.945 7.901c-4.835-1.022-4.414-1.594-6.565-2.92-2.15-1.326-4.077-2.18-6.482-1.74"
    ></path>
    <defs>
      <linearGradient
        id="paint0_linear_178_165937"
        x1="44"
        x2="44"
        y1="4.215"
        y2="40.112"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#2E54FF" stopOpacity="0.19"></stop>
        <stop offset="0.999" stopColor="#2E54FF" stopOpacity="0.01"></stop>
      </linearGradient>
    </defs>
  </svg>
);

export default TotalRevenueChart;
