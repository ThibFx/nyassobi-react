import React, { useEffect, useRef } from "react";
import styles from "./WaveHeader.module.scss";

function WaveHeader() {
  const pathRef = useRef(null);

  // initial
  const pathOriginal = [
    ["M", 1920, -23],
    ["L", 1925, -18],
    ["V", 122.479],
    ["L", 1919.3, 127.43],
    ["C", 1483.89, 65.709, 946.861, 88.5767, 659.847, 137.907],
    ["C", 371.639, 187.443, 247.018, 173.045, -0.702148, 137.93],
    ["L", -5, 137.32],
    ["V", -18],
    ["L", 0, -23],
    ["H", 1920],
    ["Z"]
  ];

  // transformed
  const pathReduced = [
    ["M", 1920, -10],
    ["L", 1925, -10],
    ["V", 95],
    ["L", 1919.3, 95],
    ["C", 1483.89, 95, 946.861, 95, 659.847, 95],
    ["C", 371.639, 95, 247.018, 95, -0.702148, 95],
    ["L", -5, 95],
    ["V", -10],
    ["L", 0, -10],
    ["H", 1920],
    ["Z"]
  ];

  // morphing effect avec l'interpolation super dure est relou mais ça marche !!!!!!!
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = 300;
      const progress = Math.min(scrollTop / maxScroll, 1);

      const d = pathOriginal
        .map((seg, i) => {
          const type = seg[0];
          if (type === "C") {
            const x1 = seg[1] + (pathReduced[i][1] - seg[1]) * progress;
            const y1 = seg[2] + (pathReduced[i][2] - seg[2]) * progress;
            const x2 = seg[3] + (pathReduced[i][3] - seg[3]) * progress;
            const y2 = seg[4] + (pathReduced[i][4] - seg[4]) * progress;
            const x = seg[5] + (pathReduced[i][5] - seg[5]) * progress;
            const y = seg[6] + (pathReduced[i][6] - seg[6]) * progress;
            return `C${x1} ${y1} ${x2} ${y2} ${x} ${y}`;
          } else if (type === "L" || type === "M") {
            const x = seg[1] + (pathReduced[i][1] - seg[1]) * progress;
            const y = seg[2] + (pathReduced[i][2] - seg[2]) * progress;
            return `${type}${x} ${y}`;
          } else if (type === "V") {
            const y = seg[1] + (pathReduced[i][1] - seg[1]) * progress;
            return `V${y}`;
          } else if (type === "H") {
            const x = seg[1] + (pathReduced[i][1] - seg[1]) * progress;
            return `H${x}`;
          } else if (type === "Z") {
            return "Z";
          }
        })
        .join(" ");

      if (pathRef.current) {
        pathRef.current.setAttribute("d", d);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <svg
      className={styles.waveHeader}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 1920 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        ref={pathRef}
        d="M1920 -23L1925 -18V122.479L1919.3 127.43C1483.89 65.709 946.861 88.5767 659.847 137.907C371.639 187.443 247.018 173.045 -0.702148 137.93L-5 137.32V-18L0 -23H1920Z"
        fill="#ED5E24"
        stroke="white"
        strokeWidth="10"
        strokeMiterlimit="1.36733"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default WaveHeader;
