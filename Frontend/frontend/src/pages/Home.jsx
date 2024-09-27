import React from "react";
import Hero from "./miniComponents/Hero.jsx";
import Timeline from "./miniComponents/Timeline.jsx";
import Skills from "./miniComponents/Skills.jsx";
import MyApps from "./miniComponents/MyApps.jsx";
import About from "./miniComponents/About.jsx";
import { ThemeProvider } from "@/components/theme-provider.jsx";
import Portfolio from "./miniComponents/Portfolio.jsx";
import Contact from "./miniComponents/Contact.jsx";

const Home = () => {
  return (
    <article className="px-5 mt-10 sm:mt-14 md:mt-16 lg:mt-24 xl:mt-32 sm:mx-auto w-full max-w-[1050px] flex flex-col gap-14">
      <Hero />
      <Timeline />
      <About />
      <Skills />
      <Portfolio />
      <MyApps />
      <Contact />
    </article>
  );
};

export default Home;
