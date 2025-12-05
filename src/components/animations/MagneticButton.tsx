import { useRef, ReactNode, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({ 
  children, 
  className = "",
  strength = 0.3 
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlowingCursorProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowingCursor({ 
  children, 
  className = "",
  glowColor = "hsl(var(--accent))"
}: GlowingCursorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = ref.current!.getBoundingClientRect();
    setMousePosition({ 
      x: e.clientX - left, 
      y: e.clientY - top 
    });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-inherit"
        animate={{
          background: isHovered 
            ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}20, transparent 70%)`
            : "transparent"
        }}
        transition={{ duration: 0.15 }}
      />
      {children}
    </motion.div>
  );
}