import { useState } from 'react'
import WaveComponent from './WaveComponent';
import MainComponent from './MainComponent';
import Header from './Header';
import ScrollToTopButton from './components/ScrollToTopButton';

import './App.scss'

function App() {

  return (
    <>
      <Header/>
      {/* <WaveComponent/> */}
      <MainComponent/>
      <ScrollToTopButton />
      {import.meta.env.VITE_BAC_A_SABLE === "1" && (
        <p className="sandbox-banner" role="note">
          Bac à sable : les formulaires partent vers un WordPress de test, rien n'est envoyé pour de vrai.
        </p>
      )}
      {import.meta.env.VITE_ENVIRONNEMENT === "preprod" && (
        <p className="sandbox-banner sandbox-banner--preprod" role="note">
          Pré-production : vrai Discord de test, vrais e-mails (adresses autorisées seulement), paiements de test.
        </p>
      )}
    </>
  )
}

export default App
