"use client";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export const HeroText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const Highlight = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.span
      className="relative inline-block px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {children}
    </motion.span>
  );
};