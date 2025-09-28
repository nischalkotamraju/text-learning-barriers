"use client";
import { Link } from "react-router-dom";
import { HeroText, Highlight } from "../components/HeroText";
import { FaBookOpen } from "react-icons/fa";

const AthleteHub = () => {
  return (
  <div className="flex flex-col relative min-h-screen">
      <section className="relative z-10 flex flex-1 items-center justify-center pt-32 pb-16 px-4 min-h-screen">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-blue-200 mb-6 leading-tight drop-shadow-lg">
              <HeroText>
                <span className="text-blue-100">Bridging the </span> <Highlight>Gap</Highlight>
                <br className="hidden md:block" />
              </HeroText>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
              Students with dyslexia, ADHD, or language barriers often struggle with traditional learning resources. We're here to help.
            </p>
            <div className="flex gap-4 justify-center md:justify-start mb-8">
              <Link
                to="/signup"
                className="px-8 py-3 bg-blue-200 text-black rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-400 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-blue-200 text-blue-200 rounded-xl text-lg font-semibold hover:bg-blue-100 hover:text-black transition"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="hidden md:block flex-1 text-center">
            <div className="w-64 h-64 rounded-2xl bg-blue-200 flex items-center justify-center mx-auto shadow-2xl">
              <span className="font-bold">
                <FaBookOpen className="w-28 h-28 text-black" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AthleteHub;
