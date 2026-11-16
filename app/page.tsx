import { COMMITMENTS, DEFAULT_PARTS, PARTS, SERVICE_OPTIONS, SERVICES, STACK, STEPS, TANGLE, TOOLS } from "@/lib/content";
import Loader from "@/components/layout/Loader";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import PageEffects from "@/components/effects/PageEffects";
import Hero from "@/components/sections/Hero";
import Ticker from "@/components/sections/Ticker";
import Services from "@/components/sections/Services";
import Untangle from "@/components/sections/Untangle";
import Process from "@/components/sections/Process";
import Commitments from "@/components/sections/Commitments";
import Configurator from "@/components/sections/Configurator";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main>
        <Hero />
        <Ticker items={STACK} />
        <Services services={SERVICES} />
        <Untangle tools={TOOLS} tangle={TANGLE} />
        <Process steps={STEPS} />
        <Commitments items={COMMITMENTS} />
        <Configurator parts={PARTS} initial={DEFAULT_PARTS} />
        <Contact options={SERVICE_OPTIONS} />
      </main>
      <Footer />
      <PageEffects />
    </>
  );
}
