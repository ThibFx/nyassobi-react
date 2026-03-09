import React, { useState } from "react"

/*import styles from './MainComponent.module.scss';*/
import styles from './HomePage.module.scss';

import Footer from '../Footer'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faTwitter, faTwitch, faYoutube, faTiktok } from '@fortawesome/free-brands-svg-icons' 
import Header from "../Header";

import { motion } from "motion/react"

import TitleNyasso from "../TitleNyasso";

import { useNyassobiSettings } from "../hooks/useNyassobiSettings";


function LegalsMentionPage() {

    const { settings } = useNyassobiSettings();

  return (<motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
        <div className={styles['mainContent']}>
            <div className={styles['mainContent']}>
                <div className={styles['homePage']}>
                    
                    <TitleNyasso title="Mentions légales"/>
                    <h2>
                        Merci de lire attentivement les présentes modalités d’utilisation du présent site avant de le parcourir. En vous connectant sur ce site, vous acceptez sans réserve les présentes modalités.
                    </h2>
                    
                    <TitleNyasso subtitle="Éditeur du site / Responsable éditorial"/>
                    <p>
                        <strong>Startingames</strong> <br/>
                        9 rue du Bois, Sauvry-Haut <br/>
                        58270 Saint-Benin d’Azy – France <br/>
                        Mail : contact@studio-startingames.com <br/>
                        Site : <a href="http://www.studio-startingames.com" target="_blank">www.studio-startingames.com</a> <br/>
                        <br/>
                        Association loi 1901, <br/>
                        RNA : W583004763 <br/><br/>

                        et <br/><br/>

                        <strong>Nyassobi</strong> <br/>
                        55, rue Joseph Hue <br/>
                        76250 Déville-lès-Rouen – France <br/>
                        Mail : {settings.contactEmail} <br/>
                        Site : <a href="https://www.nyassobi.fr" target="_blank">www.nyassobi.fr</a> <br/>
                        <br/>
                        Association loi 1901, <br/>
                        RNA : W763021178 <br/><br/>

                    </p>
                    
                    <TitleNyasso subtitle="Hébergement"/>                    
                    <p>
                        <strong>OVH</strong> <br/>
                        2 rue Kellermann <br/>
                        59100 Roubaix – France <br/>
                        Site : <a href="https://www.ovh.com" target="_blank">www.ovh.com</a> <br/>
                    </p>
                    
                    <TitleNyasso subtitle="Conditions d’utilisation"/>
                    <p>L’utilisation de ce site est régie par les présentes conditions. En utilisant le site, vous reconnaissez avoir pris connaissance de ces conditions et les avoir acceptées. Celle-ci peuvent êtres modifiées à tout moment et sans préavis. Startingames ne saurait être tenue pour responsable en aucune manière d’une mauvaise utilisation du service.</p>
                    
                    <TitleNyasso subtitle="Limites de responsabilité"/>
                    <p>L’ensemble des services proposés sont aussi précis et fonctionnels que possible et sont mis à jour dès que nécessaire. Toutefois, certain éléments peuvent êtres inexactes ou non fonctionnels. Si vous constatez cela, vous avez la possibilité de nous contacter via le formulaire de contact, rubrique « Réclamations WEB », ou par mail en précisant autant que faire ce peut les maximum d’informations. (pages, services, navigateur, OS, …) Ces informations nous permettent de ciblé plus rapidement le problème afin d’apporter un correctif dans les meilleurs délais.</p>
                    <p>Tout contenu téléchargé se fait sous la responsabilité de l’utilisateur. Nous faisons notre maximum afin de sécurisé notre site et nos services. De plus nous testons l’ensemble de nos services sur plusieurs plateformes avant leurs mise à dispositions. Startingames ne saurait être tenu responsable de quelconque dommage consécutif à l’utilisation de nos services.</p>
                    <p>L’ensemble des images sont non contractuelles.</p>
                    <p>Les liens sont analysés avant publication. Cependant, nous ne pouvons pas les vérifier continuellement. Si vous constatez un lien cassé ou inapproprié, merci de nous le signalez.</p>
                    
                    <TitleNyasso subtitle="Propriété intellectuelle"/>
                    <p>Sauf mentions contraires, l’ensemble du site et des services proposés sont la propriété de Nyassobi. Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans autorisations de la part de Nyassobi. Le non-respect de cette interdiction constitue une contrefaçon pouvant engager la responsabilité civile et pénale du contrefacteur. En outre, les propriétaires des Contenus copiés pourraient intenter une action en justice à votre encontre.</p>
                    <p>Toutes mentions doit faire l’objet d’un lien vers notre source originel.</p>
                    <p>Pour toutes demandes d’autorisations, veuillez nous contacter.</p>
                    
                    <TitleNyasso subtitle="Informations personnelles"/>
                    <p>Nos services, de par leur fonctionnement intrinsèque, peuvent utiliser certaines informations personnelles (Adresse IP, Lien cliqué, informations communiquées). Sauf mentions contraires, l’ensemble de ces données sont utilisées uniquement afin de vous fournir une meilleur expérience utilisateur et ne sont en aucun cas sauvegardées.</p>
                </div>
            </div>
        </div>
        <Footer/>
    </motion.div>)
}

export default LegalsMentionPage