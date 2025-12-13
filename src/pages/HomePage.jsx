import React, { useCallback, useEffect, useState } from "react"

import styles from './HomePage.module.scss';

import Footer from '../Footer'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faTwitter, faTwitch, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons' 

import { motion } from "motion/react"
import WaveHeader from "../WaveHeader";
import WaveJoinOrganization from "../WaveJoinOrganization";
import LineScrolling from "../LineScrolling";

import Nyasso_Actually from "../assets/Nyasso_Actually.png";
import TitleNyasso from "../TitleNyasso";
import SVGSplash from "../SvgSplash";

import CatGirl from "../assets/CatGirl.svg";
import NyassoCarousel from "../NyassoCarousel";

import NyassoArtist from "../assets/Artist_cat.png";
import { useWordPressPosts } from "../hooks/useWordPressContent";

import { useNyassobiSettings } from "../hooks/useNyassobiSettings";

function HomePage() {
    const { settings } = useNyassobiSettings();
    console.log("settings:", settings);
    const { items: newsPosts, loading: newsLoading, error: newsError } = useWordPressPosts({ first: 9 });
    const [activeNewsIndex, setActiveNewsIndex] = useState(0);

    useEffect(() => {
        setActiveNewsIndex(0);
    }, [newsPosts.length]);

    const stripHtml = (value) => {
        if (!value) {
            return "";
        }

        return value.replace(/<[^>]+>/g, "").trim();
    };

    const latestTitle = stripHtml(newsPosts[activeNewsIndex]?.title);
    const newsSubtitle = newsLoading
        ? "Chargement des actualités..."
        : newsError
            ? "Actualités indisponibles"
            : latestTitle || "Dernières actualités";

    const handleCarouselSlideChange = useCallback((index) => {
        setActiveNewsIndex(index);
    }, []);

    return (<motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
        <div className={styles['mainContent']}>
            <div className={styles['LineScrolling']}>
                <LineScrolling/>
                <img className={styles['actuallyCat']} src={Nyasso_Actually} />
                <div className={styles['SvgSplash']}>
                    <SVGSplash/>
                </div>
                <div className={styles['CatGirl']}>
                    <img src={CatGirl} />
                </div>
            </div>
            <div className={styles['mainContent']}>
                <div className={styles['homePage']}>
                    <TitleNyasso title="C'est quoi Nyassobi ?" subtitle="Quelques explications rapides !"/>
                    <p className={styles['text']} dangerouslySetInnerHTML={{__html: settings.introTextNyassobi}}></p>

                    <div className={styles['SpacerSvgSplash']}></div>
                    
                    <TitleNyasso title="News" subtitle={newsSubtitle}/>
                    <NyassoCarousel
                        posts={newsPosts}
                        loading={newsLoading}
                        error={newsError}
                        onSlideChange={handleCarouselSlideChange}
                    />

                    <div className={styles['wrapperArtistNyasso']}>
                        <img className={styles['artistNyasso']} src={NyassoArtist} />
                    </div>
                </div>
            </div>

            
        </div>
        <Footer/>
    </motion.div>)
}

export default HomePage
