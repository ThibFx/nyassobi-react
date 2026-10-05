import { Wave } from "@/ui/Band";
import { Meta } from "@/ui/Meta";

import { About } from "./home/About";
import { AteliersStrip } from "./home/AteliersStrip";
import { HomeHero } from "./home/HomeHero";
import { JoinBand } from "./home/JoinBand";
import { LatestNews } from "./home/LatestNews";
import { Ribbon } from "./home/Ribbon";

export default function HomePage() {
  return (
    <>
      <Meta />
      <HomeHero />
      <Ribbon />
      <About />
      <Wave from="creme" to="menthe" variant={0} />
      <LatestNews />
      <Wave from="menthe" to="peche" variant={2} flip />
      <AteliersStrip />
      <Wave from="peche" to="accent" variant={1} />
      <JoinBand />
      <Wave from="accent" to="creme" variant={0} flip />
      <div style={{ background: "var(--bande-creme)" }} className="h-6" />
    </>
  );
}
