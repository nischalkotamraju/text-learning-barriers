"use client";
import { Link } from "react-router-dom";
import { HeroText, Highlight } from "../components/HeroText";
import { FaBookOpen } from "react-icons/fa";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const AthleteHub = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
  <div className="flex flex-col relative min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-white text-xl font-bold tracking-tight">VisualLearn</div>
          <div className="flex gap-6">
            <Link to="/login" className="text-white/70 hover:text-white transition text-sm font-medium">Log In</Link>
            <Link to="/signup" className="text-white hover:text-white/70 transition text-sm font-medium">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-1 items-center justify-center pt-32 pb-24 px-6 min-h-screen">
        <div className="max-w-6xl w-full">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-6">
              <span className="inline-block text-white/50 text-sm font-medium tracking-[0.2em] uppercase mb-8">// INNOVATIVE LEARNING</span>
            </div>
            <HeroText>
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                WE CREATE <Highlight>AI-DRIVEN</Highlight> SOLUTIONS
              </h1>
            </HeroText>
            <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Transforming traditional learning resources into accessible visual formats for students with dyslexia, ADHD, and language barriers.
            </p>
            <div className="flex gap-6 justify-center mb-16">
              <Link
                to="/signup"
                className="px-10 py-4 bg-white text-black rounded-full text-base font-semibold hover:bg-white/90 transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 border border-white/20 text-white rounded-full text-base font-semibold hover:bg-white/5 transition-all duration-300"
              >
                Log In
              </Link>
            </div>
          </div>
          
          {/* Features Timeline */}
          <div ref={timelineRef} className="mt-32 max-w-4xl mx-auto relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-white/10">
              <motion.div 
                style={{ height: lineHeight }}
                className="w-full bg-[#ff6b6b] origin-top"
              />
            </div>

            {/* Timeline Items */}
            <div className="space-y-24">
              {/* Item 01 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-24"
              >
                <div className="absolute left-0 w-16 h-16 bg-[#ff6b6b] rounded-full flex items-center justify-center border-4 border-black">
                  <span className="text-2xl font-bold text-white">01</span>
                </div>
                <div className="pl-8">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 inline-flex">
                    <FaBookOpen className="w-7 h-7 text-[#ff6b6b]" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#ff6b6b] mb-4">QUALITY</h4>
                  <p className="text-white/50 text-lg leading-relaxed max-w-xl">
                    Transform text into high-quality visual formats that exceed expectations
                  </p>
                </div>
              </motion.div>

              {/* Item 02 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-24"
              >
                <div className="absolute left-0 w-16 h-16 bg-[#ff6b6b] rounded-full flex items-center justify-center border-4 border-black">
                  <span className="text-2xl font-bold text-white">02</span>
                </div>
                <div className="pl-8">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 inline-flex">
                    <FaBookOpen className="w-7 h-7 text-[#ff6b6b]" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#ff6b6b] mb-4">RELIABILITY</h4>
                  <p className="text-white/50 text-lg leading-relaxed max-w-xl">
                    Consistent, accurate visual representations that students can depend on
                  </p>
                </div>
              </motion.div>

              {/* Item 03 */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative pl-24"
              >
                <div className="absolute left-0 w-16 h-16 bg-[#ff6b6b] rounded-full flex items-center justify-center border-4 border-black">
                  <span className="text-2xl font-bold text-white">03</span>
                </div>
                <div className="pl-8">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 inline-flex">
                    <FaBookOpen className="w-7 h-7 text-[#ff6b6b]" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#ff6b6b] mb-4">ACCESSIBILITY</h4>
                  <p className="text-white/50 text-lg leading-relaxed max-w-xl">
                    Making education accessible for every learning style and ability
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AthleteHub;
