import React, { useState } from "react";
import styles from "./WaveJoinOrganization.module.scss";
import NyassoIdol from "./assets/Nyasso_Idol.png";

import { Link } from "react-router-dom";

function WaveJoinOrganization() {
  const [hover, setHover] = useState(false);

  return (
    <div style={{ position: "relative" }} className={`${hover ? styles.isHovered : ""}`}>
      <Link 
        to="/adhesion" 
        className={styles["waveJoinOrganization-clickable"]}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className={styles["waveJoinOrganization-clip"]}>
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
            className={styles.wavePath}
            d="M697 125C372.782 117.617 72 166.5 -38 196L-40.5 207L-51.5 5.5H1996.5V196C1578.5 384.5 1202 136.5 697 125Z"
            fill="#83DBD3"
            stroke="white"
            strokeWidth="10"
          />
        </svg>

        <img
          className={styles["adhesion-text"]}
          src={"./adhesion_text_fr.png"}
        />
      </Link>
    </div>
  );
}

export default WaveJoinOrganization;
