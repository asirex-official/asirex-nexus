import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation?: number;
  color?: string;
}

interface InteractiveCharacter {
  id: number;
  x: number;
  emoji: string;
  speed: number;
  direction: 'left' | 'right';
  action: string;
}

// Interactive Character Component
function WalkingCharacter({ 
  emoji, 
  speed = 20, 
  y = 90,
  action,
  onClick 
}: { 
  emoji: string; 
  speed?: number; 
  y?: number;
  action?: string;
  onClick?: () => void;
}) {
  const [position, setPosition] = useState(-10);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isHovered, setIsHovered] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        if (direction === 'right') {
          if (prev >= 110) {
            setDirection('left');
            return prev - 1;
          }
          return prev + 0.5;
        } else {
          if (prev <= -10) {
            setDirection('right');
            return prev + 1;
          }
          return prev - 0.5;
        }
      });
    }, speed);
    return () => clearInterval(interval);
  }, [direction, speed]);

  const messages: Record<string, string[]> = {
    santa: ["Ho Ho Ho! 🎅", "Merry Christmas!", "Check out the deals!", "🎁 Gifts await!"],
    elf: ["Let's shop! 🛍️", "Great deals today!", "Hello there!", "✨ Magic time!"],
    diya: ["Happy Diwali! 🪔", "Festival of lights!", "🎆 Celebrate!"],
    holi: ["Happy Holi! 🌈", "Play with colors!", "🎨 Splash!"],
    firework: ["Happy New Year! 🎆", "Celebrate!", "🎉 Party time!"],
    ghost: ["Boo! 👻", "Trick or Treat!", "🎃 Spooky!"],
    turkey: ["Happy Thanksgiving! 🦃", "Gobble gobble!", "🍂 Give thanks!"],
    heart: ["Happy Valentine's! 💕", "Love is in the air!", "💝 Spread love!"],
    leprechaun: ["Top o' the morning! ☘️", "Lucky day!", "🌈 Find the gold!"],
    bunny: ["Happy Easter! 🐰", "Egg hunt time!", "🥚 Hop hop!"],
    flag: ["Jai Hind! 🇮🇳", "Happy Independence!", "🇮🇳 Proud!"],
    cart: ["Black Friday! 🛒", "Mega deals!", "💰 Save big!"],
    pumpkin: ["Spooky season! 🎃", "Boo!", "👻 Scary fun!"],
  };

  const handleClick = () => {
    const actionMessages = messages[action || 'santa'] || messages.santa;
    setMessage(actionMessages[Math.floor(Math.random() * actionMessages.length)]);
    setTimeout(() => setMessage(''), 2000);
    onClick?.();
  };

  return (
    <motion.div
      className="fixed cursor-pointer z-50 select-none"
      style={{ 
        left: `${position}%`, 
        bottom: `${100 - y}%`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
      }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{ 
        y: [0, -5, 0],
        scale: isHovered ? 1.2 : 1
      }}
      transition={{ 
        y: { duration: 0.5, repeat: Infinity },
        scale: { duration: 0.2 }
      }}
    >
      <span className="text-3xl md:text-4xl drop-shadow-lg">{emoji}</span>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg border"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Diwali Firecrackers Effect
export function DiwaliEffects() {
  const [sparks, setSparks] = useState<Particle[]>([]);
  const [diyas, setDiyas] = useState<Particle[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const diyaParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 85 + Math.random() * 15,
      size: 20 + Math.random() * 15,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
    setDiyas(diyaParticles);

    const sparkParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 6,
      delay: Math.random() * 5,
      duration: 1 + Math.random() * 2,
      color: ['#fbbf24', '#f97316', '#ef4444', '#fcd34d'][Math.floor(Math.random() * 4)],
    }));
    setSparks(sparkParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Floating Diyas */}
      {diyas.map((diya) => (
        <motion.div
          key={`diya-${diya.id}`}
          className="absolute"
          style={{ left: `${diya.x}%`, bottom: `${100 - diya.y}%` }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: diya.duration,
            delay: diya.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative" style={{ fontSize: diya.size }}>
            🪔
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-6 rounded-full"
              style={{
                background: "radial-gradient(ellipse at bottom, #fbbf24 0%, transparent 70%)",
                filter: "blur(2px)",
              }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      ))}

      {/* Sparkles */}
      {sparks.map((spark) => (
        <motion.div
          key={`spark-${spark.id}`}
          className="absolute rounded-full"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            width: spark.size,
            height: spark.size,
            background: spark.color,
            boxShadow: `0 0 ${spark.size * 2}px ${spark.color}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: spark.duration,
            delay: spark.delay,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Rangoli corners */}
      <div className="absolute bottom-4 left-4 text-6xl opacity-50 animate-pulse">🌸</div>
      <div className="absolute bottom-4 right-4 text-6xl opacity-50 animate-pulse" style={{ animationDelay: "0.5s" }}>🌸</div>
      
      {/* Interactive character */}
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🪔" speed={30} y={95} action="diya" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Christmas Snow & Santa Effect
export function ChristmasEffects() {
  const navigate = useNavigate();
  const snowflakes = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 30,
    }))
  , []);

  const [santaVisible, setSantaVisible] = useState(false);

  useEffect(() => {
    const showSanta = () => {
      setSantaVisible(true);
      setTimeout(() => setSantaVisible(false), 8000);
    };
    
    const interval = setInterval(showSanta, 30000);
    setTimeout(showSanta, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <motion.div
          key={`snow-${flake.id}`}
          className="absolute text-white opacity-80"
          style={{
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            fontSize: flake.size,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, flake.drift, -flake.drift, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❄
        </motion.div>
      ))}

      {/* Santa Sleigh Flying */}
      <AnimatePresence>
        {santaVisible && (
          <motion.div
            className="absolute top-10 text-5xl pointer-events-auto cursor-pointer"
            initial={{ x: "-100px", opacity: 0 }}
            animate={{ x: "calc(100vw + 100px)", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 8, ease: "linear" }}
            onClick={() => navigate('/shop')}
          >
            🎅🦌🛷
          </motion.div>
        )}
      </AnimatePresence>

      {/* Christmas decorations */}
      <div className="absolute top-2 left-4 text-4xl">🎄</div>
      <div className="absolute top-2 right-4 text-4xl">🎄</div>
      <motion.div 
        className="absolute top-10 left-1/4 text-3xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔔
      </motion.div>
      <motion.div 
        className="absolute top-10 right-1/4 text-3xl"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        🔔
      </motion.div>
      
      {/* Walking Santa */}
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🎅" speed={25} y={95} action="santa" onClick={() => navigate('/cart')} />
        <WalkingCharacter emoji="🧝" speed={35} y={92} action="elf" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Holi Colors Effect
export function HoliEffects() {
  const navigate = useNavigate();
  const colors = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 40,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
      color: ['#ec4899', '#8b5cf6', '#22c55e', '#f97316', '#3b82f6', '#eab308'][Math.floor(Math.random() * 6)],
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {colors.map((splash) => (
        <motion.div
          key={`splash-${splash.id}`}
          className="absolute rounded-full"
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
            width: splash.size,
            height: splash.size,
            background: splash.color,
            filter: "blur(10px)",
          }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: splash.duration,
            delay: splash.delay,
            repeat: Infinity,
          }}
        />
      ))}
      
      <div className="absolute bottom-4 left-4 text-5xl">💦</div>
      <div className="absolute top-20 right-4 text-5xl transform -rotate-45">🎨</div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🎨" speed={28} y={94} action="holi" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// New Year Confetti Effect
export function NewYearEffects() {
  const navigate = useNavigate();
  const confetti = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -5,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 4,
      rotation: Math.random() * 720,
      color: ['#fbbf24', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={`confetti-${piece.id}`}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size * 0.6,
            background: piece.color,
            borderRadius: "2px",
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, piece.rotation],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      <motion.div 
        className="absolute bottom-20 left-10 text-5xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🎈
      </motion.div>
      <motion.div 
        className="absolute bottom-20 right-10 text-5xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        🎈
      </motion.div>
      
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎆
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🎉" speed={22} y={95} action="firework" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Independence Day Effect
export function IndependenceDayEffects() {
  const navigate = useNavigate();
  const flags = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: 5 + (i * 6.5),
      y: 2,
      size: 25 + Math.random() * 10,
      delay: Math.random() * 2,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
      
      {flags.map((flag) => (
        <motion.div
          key={`flag-${flag.id}`}
          className="absolute"
          style={{ left: `${flag.x}%`, top: `${flag.y}%`, fontSize: flag.size }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, delay: flag.delay, repeat: Infinity }}
        >
          🇮🇳
        </motion.div>
      ))}
      
      <motion.div 
        className="absolute top-20 left-1/2 -translate-x-1/2 text-6xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        ☸️
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🇮🇳" speed={30} y={95} action="flag" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Halloween Effect
export function HalloweenEffects() {
  const navigate = useNavigate();
  const bats = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {bats.map((bat) => (
        <motion.div
          key={`bat-${bat.id}`}
          className="absolute text-2xl"
          style={{ left: `${bat.x}%`, top: '10%' }}
          animate={{
            y: [0, 50, 0],
            x: [-20, 20, -20],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: bat.duration,
            delay: bat.delay,
            repeat: Infinity,
          }}
        >
          🦇
        </motion.div>
      ))}
      
      <div className="absolute bottom-4 left-4 text-6xl animate-pulse">🎃</div>
      <div className="absolute bottom-4 right-4 text-6xl animate-pulse" style={{ animationDelay: '0.5s' }}>👻</div>
      <div className="absolute top-20 left-10 text-4xl">🕸️</div>
      <div className="absolute top-20 right-10 text-4xl">🕷️</div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="👻" speed={35} y={94} action="ghost" onClick={() => navigate('/shop')} />
        <WalkingCharacter emoji="🎃" speed={40} y={96} action="pumpkin" onClick={() => navigate('/cart')} />
      </div>
    </div>
  );
}

// Valentine's Day Effect
export function ValentinesEffects() {
  const navigate = useNavigate();
  const hearts = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 10 + Math.random() * 20,
      delay: Math.random() * 10,
      duration: 5 + Math.random() * 5,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={`heart-${heart.id}`}
          className="absolute"
          style={{ 
            left: `${heart.x}%`, 
            bottom: '-5%',
            fontSize: heart.size,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(heart.id) * 30],
            rotate: [0, 360],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
          }}
        >
          💕
        </motion.div>
      ))}
      
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        💝
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="💘" speed={25} y={95} action="heart" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Easter Effect
export function EasterEffects() {
  const navigate = useNavigate();
  const eggs = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      y: 80 + Math.random() * 15,
      emoji: ['🥚', '🐣', '🐰', '🌷'][Math.floor(Math.random() * 4)],
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {eggs.map((egg) => (
        <motion.div
          key={`egg-${egg.id}`}
          className="absolute text-3xl"
          style={{ left: `${egg.x}%`, top: `${egg.y}%` }}
          animate={{ y: [0, -5, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2 + Math.random(), repeat: Infinity }}
        >
          {egg.emoji}
        </motion.div>
      ))}
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🐰" speed={20} y={94} action="bunny" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// St. Patrick's Day Effect
export function StPatricksEffects() {
  const navigate = useNavigate();
  const clovers = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 4,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {clovers.map((clover) => (
        <motion.div
          key={`clover-${clover.id}`}
          className="absolute text-2xl"
          style={{ left: `${clover.x}%`, top: '-5%' }}
          animate={{
            y: [0, window.innerHeight + 100],
            rotate: [0, 360],
          }}
          transition={{
            duration: clover.duration,
            delay: clover.delay,
            repeat: Infinity,
          }}
        >
          ☘️
        </motion.div>
      ))}
      
      <motion.div 
        className="absolute top-20 left-10 text-4xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🌈
      </motion.div>
      <div className="absolute bottom-10 right-10 text-4xl">🪙</div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🧙‍♂️" speed={28} y={95} action="leprechaun" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Black Friday / Cyber Monday Effect
export function BlackFridayEffects() {
  const navigate = useNavigate();
  const sales = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 80,
      emoji: ['💰', '🏷️', '💸', '🛒', '🛍️'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 5,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Sale tags falling */}
      {sales.map((sale) => (
        <motion.div
          key={`sale-${sale.id}`}
          className="absolute text-2xl"
          style={{ left: `${sale.x}%`, top: `${sale.y}%` }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 2,
            delay: sale.delay,
            repeat: Infinity,
          }}
        >
          {sale.emoji}
        </motion.div>
      ))}
      
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🔥 MEGA SALE 🔥
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🛒" speed={18} y={95} action="cart" onClick={() => navigate('/shop')} />
        <WalkingCharacter emoji="🛍️" speed={25} y={92} action="cart" onClick={() => navigate('/cart')} />
      </div>
    </div>
  );
}

// Thanksgiving Effect
export function ThanksgivingEffects() {
  const navigate = useNavigate();
  const leaves = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      emoji: ['🍂', '🍁', '🌾'][Math.floor(Math.random() * 3)],
      delay: Math.random() * 10,
      duration: 6 + Math.random() * 4,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {leaves.map((leaf) => (
        <motion.div
          key={`leaf-${leaf.id}`}
          className="absolute text-2xl"
          style={{ left: `${leaf.x}%`, top: '-5%' }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, Math.sin(leaf.id) * 50],
            rotate: [0, 360],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
          }}
        >
          {leaf.emoji}
        </motion.div>
      ))}
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-6xl">🦃</div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🦃" speed={35} y={94} action="turkey" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Eid Effect
export function EidEffects() {
  const navigate = useNavigate();
  const stars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      delay: Math.random() * 5,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={`star-${star.id}`}
          className="absolute text-xl"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            delay: star.delay,
            repeat: Infinity,
          }}
        >
          ⭐
        </motion.div>
      ))}
      
      <motion.div 
        className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🌙
      </motion.div>
      <div className="absolute bottom-4 left-4 text-4xl">🕌</div>
      <div className="absolute bottom-4 right-4 text-4xl">🕌</div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🌙" speed={30} y={95} action="diya" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Navratri / Durga Puja Effect
export function NavratriEffects() {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Dandiya sticks */}
      <motion.div 
        className="absolute top-20 left-10 text-4xl"
        animate={{ rotate: [0, 45, 0, -45, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        🥢
      </motion.div>
      <motion.div 
        className="absolute top-20 right-10 text-4xl"
        animate={{ rotate: [0, -45, 0, 45, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
      >
        🥢
      </motion.div>
      
      {/* Colorful garlands */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-green-500" />
      
      <motion.div 
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-6xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🪷
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="💃" speed={22} y={94} action="diya" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Onam Effect
export function OnamEffects() {
  const navigate = useNavigate();
  const flowers = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 70 + Math.random() * 25,
      emoji: ['🌺', '🌸', '🌼', '🪷'][Math.floor(Math.random() * 4)],
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {flowers.map((flower) => (
        <motion.div
          key={`flower-${flower.id}`}
          className="absolute text-2xl"
          style={{ left: `${flower.x}%`, top: `${flower.y}%` }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {flower.emoji}
        </motion.div>
      ))}
      
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-5xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🛶
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🐘" speed={40} y={95} action="diya" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Ganesh Chaturthi Effect
export function GaneshEffects() {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <motion.div 
        className="absolute top-20 left-1/2 -translate-x-1/2 text-8xl"
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🐘
      </motion.div>
      
      {/* Modak and ladoo */}
      <div className="absolute bottom-4 left-10 text-4xl">🍬</div>
      <div className="absolute bottom-4 right-10 text-4xl">🍬</div>
      
      {/* Flowers */}
      <motion.div 
        className="absolute top-40 left-4 text-3xl"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🌺
      </motion.div>
      <motion.div 
        className="absolute top-40 right-4 text-3xl"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        🌺
      </motion.div>
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🪔" speed={28} y={95} action="diya" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Raksha Bandhan Effect
export function RakshaBandhanEffects() {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <motion.div 
        className="absolute top-10 left-1/2 -translate-x-1/2 text-6xl"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        🎀
      </motion.div>
      
      {/* Rakhis floating */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          style={{ left: `${10 + i * 9}%`, top: '15%' }}
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
        >
          🎗️
        </motion.div>
      ))}
      
      <div className="pointer-events-auto">
        <WalkingCharacter emoji="🎁" speed={25} y={95} action="diya" onClick={() => navigate('/shop')} />
      </div>
    </div>
  );
}

// Main Festival Effects Component
interface FestivalEffectsProps {
  theme: string | null;
}

export function FestivalEffectsProvider({ theme }: FestivalEffectsProps) {
  if (!theme) return null;

  switch (theme) {
    case "diwali":
      return <DiwaliEffects />;
    case "christmas":
      return <ChristmasEffects />;
    case "holi":
      return <HoliEffects />;
    case "new_year":
      return <NewYearEffects />;
    case "independence_day":
    case "republic_day":
      return <IndependenceDayEffects />;
    case "halloween":
      return <HalloweenEffects />;
    case "valentines":
    case "mothers_day":
      return <ValentinesEffects />;
    case "easter":
      return <EasterEffects />;
    case "st_patricks":
      return <StPatricksEffects />;
    case "black_friday":
    case "cyber_monday":
      return <BlackFridayEffects />;
    case "thanksgiving":
      return <ThanksgivingEffects />;
    case "eid":
      return <EidEffects />;
    case "navratri":
    case "durga_puja":
      return <NavratriEffects />;
    case "onam":
    case "pongal":
    case "baisakhi":
    case "makar_sankranti":
      return <OnamEffects />;
    case "ganesh_chaturthi":
      return <GaneshEffects />;
    case "raksha_bandhan":
      return <RakshaBandhanEffects />;
    case "chinese_new_year":
    case "mid_autumn":
      return <NewYearEffects />;
    case "fathers_day":
    case "memorial_day":
    case "labor_day":
      return <IndependenceDayEffects />;
    case "oktoberfest":
      return <ThanksgivingEffects />;
    case "summer":
    case "spring":
      return <HoliEffects />;
    case "winter":
    case "monsoon":
      return <ChristmasEffects />;
    case "back_to_school":
      return <BlackFridayEffects />;
    default:
      return null;
  }
}