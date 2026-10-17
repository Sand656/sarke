import { Download } from "@/components/Download/Download";
import { Faq } from "@/components/Faq/Faq";
import { Features } from "@/components/Features/Features";
import { Hero } from "@/components/Hero/Hero";
import { HowItWorks } from "@/components/HowItWorks/HowItWorks";
import { Limits } from "@/components/Limits/Limits";
import { Roadmap } from "@/components/Roadmap/Roadmap";
import { Specs } from "@/components/Specs/Specs";
import { Ticker } from "@/components/Ticker/Ticker";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <HowItWorks />
      <Features />
      <Specs />
      <Limits />
      <Download />
      <Roadmap />
      <Faq />
    </>
  );
}
