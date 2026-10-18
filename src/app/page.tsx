import { Download } from "@/components/Download/Download";
import { Faq } from "@/components/Faq/Faq";
import { Features } from "@/components/Features/Features";
import { Hero } from "@/components/Hero/Hero";
import { HowItWorks } from "@/components/HowItWorks/HowItWorks";
import { Limits } from "@/components/Limits/Limits";
import { Manifesto } from "@/components/Manifesto/Manifesto";
import { Showcase } from "@/components/Showcase/Showcase";
import { Specs } from "@/components/Specs/Specs";

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      <Manifesto />
      <HowItWorks />
      <Features />
      <Specs />
      <Limits />
      <Download />
      <Faq />
    </>
  );
}
