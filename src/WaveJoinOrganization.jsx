import React, { useEffect, useRef, useState } from "react";
import styles from "./WaveJoinOrganization.module.scss";
import NyassoIdol from "./assets/Nyasso_Idol.png";
import { Link } from "react-router-dom";

function WaveJoinOrganization() {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const idolRef = useRef(null);
  const textRef = useRef(null);
  const [hover, setHover] = useState(false);

  const pathOriginal = [
    ["M", 697, 125],
    ["C", 372.782, 117.617, 72, 166.5, -38, 196],
    ["L", -40.5, 207],
    ["L", -51.5, 5.5],
    ["H", 1996.5],
    ["V", 196],
    ["C", 1578.5, 384.5, 1202, 136.5, 697, 125],
    ["Z"],
  ];

  const pathReduced = [
    ["M", 697, 180],
    ["C", 372.782, 180, 72, 180, -38, 180],
    ["L", -40.5, 180],
    ["L", -51.5, 0],
    ["H", 1996.5],
    ["V", 180],
    ["C", 1578.5, 180, 1202, 180, 697, 180],
    ["Z"],
  ];

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
          } else if (type === "H") {
            const x = seg[1] + (pathReduced[i][1] - seg[1]) * progress;
            return `H${x}`;
          } else if (type === "V") {
            const y = seg[1] + (pathReduced[i][1] - seg[1]) * progress;
            return `V${y}`;
          } else if (type === "Z") {
            return "Z";
          }
        })
        .join(" ");

      if (pathRef.current) {
        pathRef.current.setAttribute("d", d);
      }

      const idolMaxMove = 80;
      const textMaxMove = 150;

      if (idolRef.current) {
        idolRef.current.style.transform = `translateY(-${progress * idolMaxMove}px)`;
      }
      if (textRef.current) {
        textRef.current.style.transform = `translateY(-${progress * textMaxMove}px)`;
      }

      const containerMaxMove = 140;
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(-${progress * containerMaxMove}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative" }}
      className={hover ? styles.isHovered : ""}
    >
      <Link
        to="/adhesion"
        className={styles["waveJoinOrganization-clickable"]}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div
          ref={idolRef}
          className={styles["waveJoinOrganization-clip"]}
        >
          <img className={styles["idolCat"]} src={NyassoIdol} />
        </div>

        <svg
          className={styles["waveJoinOrganization-2"]}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          viewBox="0 0 1920 272"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            ref={pathRef}
            className={styles.wavePath}
            d="M697 125C372.782 117.617 72 166.5 -38 196L-40.5 207L-51.5 5.5H1996.5V196C1578.5 384.5 1202 136.5 697 125Z"
            fill="#83DBD3"
            stroke="white"
            strokeWidth="10"
          />
        </svg>

        <img
          ref={textRef}
          className={styles["adhesion-text"]}
          src="/adhesion_text_fr.png"
          alt="Adhésion"
        />
      </Link>
    </div>
  );
}

export default WaveJoinOrganization;
