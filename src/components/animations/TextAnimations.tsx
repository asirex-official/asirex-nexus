import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function TypewriterText({ 
  text, 
  className = "",
  delay = 0,
  speed = 0.03
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ 
            duration: 0.05,
            delay: delay + index * speed 
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

interface SplitTextProps {
  children: string;
  className?: string;
  delay?: number;
  type?: "words" | "chars";
}

export function SplitText({ 
  children, 
  className = "",
  delay = 0,
  type = "words"
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const items = type === "words" ? children.split(" ") : children.split("");

  return (
    <span ref={ref} className={className}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.4,
            delay: delay + index * 0.05,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {item}
          {type === "words" && " "}
        </motion.span>
      ))}
    </span>
  );
}

interface GradientTextAnimatedProps {
  children: ReactNode;
  className?: string;
}

export function GradientTextAnimated({ children, className = "" }: GradientTextAnimatedProps) {
  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent bg-[length:200%_100%] ${className}`}
      animate={{
        backgroundPosition: ["0% center", "100% center", "0% center"]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {children}
    </motion.span>
  );
}

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({ 
  from = 0, 
  to, 
  duration = 2, 
  suffix = "",
  prefix = "",
  className = "" 
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      >
        {isInView && (
          <motion.span
            initial={{ filter: "blur(4px)" }}
            animate={{ filter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
          >
            <Counter from={from} to={to} duration={duration} />
          </motion.span>
        )}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

function Counter({ from, to, duration }: { from: number; to: number; duration: number }) {
  return (
    <motion.span
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        <AnimatedNumber from={from} to={to} duration={duration} />
      </motion.span>
    </motion.span>
  );
}

function AnimatedNumber({ from, to, duration }: { from: number; to: number; duration: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        animate={{ opacity: 1 }}
        transition={{ duration }}
      >
        <InnerCounter from={from} to={to} duration={duration} />
      </motion.span>
    </motion.span>
  );
}

function InnerCounter({ from, to, duration }: { from: number; to: number; duration: number }) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(from + (to - from) * easeOutQuart(progress)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}

import { useState, useEffect } from "react";