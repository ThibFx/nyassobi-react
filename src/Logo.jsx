import { Link } from "react-router-dom";
import NyassobiLogo from "./assets/Nyassobi_logo.svg";
import { useEffect, useRef } from "react";
import styles from "./Logo.module.scss";

export default function Logo() {
  const logoRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 811) return;

      const scrollTop = window.scrollY;
      const maxScroll = 300;
      const progress = Math.min(scrollTop / maxScroll, 1);

      const maxMove = 20;
      if (logoRef.current) {
        logoRef.current.style.transform = `translateY(-${progress * maxMove}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles['nyassobi-logo']} ref={logoRef}>
      <Link to={`/`}>
        <div className={styles['logo']}>
          <img src={NyassobiLogo} />
        </div>
      </Link>
    </div>
  );
}
