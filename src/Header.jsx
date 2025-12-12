import React, { useState } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

import WIPComponent from "./WIPComponent";
import NewMemberButton from "./NewMemberButton";

import NyassoIdol from "./assets/Nyasso_Idol.png";

import styles from "./Header.module.scss";

import { ScrollRestoration } from "react-router-dom";
import WaveHeader from "./WaveHeader";
import WaveJoinOrganization from "./WaveJoinOrganization";
import Logo from "./Logo";

function Header() {

    return (<>
    
        {/* <WIPComponent/>
        <Navbar/>
        <NewMemberButton/>
        <ScrollRestoration/> */}
        <div style={{position: "relative", width:"100vw"}} className={styles['header']}>
            <div style={{position: "relative", width:"100vw"}}>
                <WaveHeader/>
                <Logo/>
                <Navbar/>
            </div>
            <WaveJoinOrganization/>
        </div>


        {/* <img className={styles['idolCat']} src={NyassoIdol} /> */}
        
    </>)
}

export default Header