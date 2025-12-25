import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useFestivalTheme } from "./FestivalThemeProvider";

// Festival icon imports
import christmasSanta from "@/assets/festivals/christmas-santa.png";
import christmasTree from "@/assets/festivals/christmas-tree.png";
import christmasElf from "@/assets/festivals/christmas-elf.png";
import christmasGift from "@/assets/festivals/christmas-gift.png";
import christmasSnowflake from "@/assets/festivals/christmas-snowflake.png";
import christmasReindeer from "@/assets/festivals/christmas-reindeer.png";
import christmasSleigh from "@/assets/festivals/christmas-sleigh.png";
import christmasCandy from "@/assets/festivals/christmas-candy.png";
import christmasBell from "@/assets/festivals/christmas-bell.png";
import christmasStocking from "@/assets/festivals/christmas-stocking.png";

import diwaliDiya from "@/assets/festivals/diwali-diya.png";
import diwaliFireworks from "@/assets/festivals/diwali-fireworks.png";
import diwaliLantern from "@/assets/festivals/diwali-lantern.png";
import diwaliSparkler from "@/assets/festivals/diwali-sparkler.png";
import diwaliRocket from "@/assets/festivals/diwali-rocket.png";
import diwaliCracker from "@/assets/festivals/diwali-cracker.png";
import diwaliSweets from "@/assets/festivals/diwali-sweets.png";
import diwaliChakra from "@/assets/festivals/diwali-chakra.png";

import holiColor from "@/assets/festivals/holi-color.png";
import holiPowder from "@/assets/festivals/holi-powder.png";
import holiDrums from "@/assets/festivals/holi-drums.png";
import holiSweets from "@/assets/festivals/holi-sweets.png";
import holiPot from "@/assets/festivals/holi-pot.png";

import newyearFirework from "@/assets/festivals/newyear-firework.png";
import newyearChampagne from "@/assets/festivals/newyear-champagne.png";
import newyearConfetti from "@/assets/festivals/newyear-confetti.png";
import newyearBalloon from "@/assets/festivals/newyear-balloon.png";
import newyearParty from "@/assets/festivals/newyear-party.png";

import halloweenPumpkin from "@/assets/festivals/halloween-pumpkin.png";
import halloweenGhost from "@/assets/festivals/halloween-ghost.png";
import halloweenWitch from "@/assets/festivals/halloween-witch.png";
import halloweenBat from "@/assets/festivals/halloween-bat.png";
import halloweenSkull from "@/assets/festivals/halloween-skull.png";

import valentineHeart from "@/assets/festivals/valentine-heart.png";
import valentineRose from "@/assets/festivals/valentine-rose.png";
import valentineCupid from "@/assets/festivals/valentine-cupid.png";
import valentineGift from "@/assets/festivals/valentine-gift.png";

import easterBunny from "@/assets/festivals/easter-bunny.png";
import easterEgg from "@/assets/festivals/easter-egg.png";
import easterBasket from "@/assets/festivals/easter-basket.png";
import easterChick from "@/assets/festivals/easter-chick.png";

import blackfridaySale from "@/assets/festivals/blackfriday-sale.png";
import blackfridayTag from "@/assets/festivals/blackfriday-tag.png";
import blackfridayCart from "@/assets/festivals/blackfriday-cart.png";
import blackfridayBag from "@/assets/festivals/blackfriday-bag.png";

import eidMoon from "@/assets/festivals/eid-moon.png";
import eidLantern from "@/assets/festivals/eid-lantern.png";
import eidStar from "@/assets/festivals/eid-star.png";
import eidMosque from "@/assets/festivals/eid-mosque.png";

import thanksgivingTurkey from "@/assets/festivals/thanksgiving-turkey.png";
import thanksgivingPumpkin from "@/assets/festivals/thanksgiving-pumpkin.png";
import thanksgivingCorn from "@/assets/festivals/thanksgiving-corn.png";
import thanksgivingPie from "@/assets/festivals/thanksgiving-pie.png";

import indiaFlag from "@/assets/festivals/india-flag.png";
import indiaAshoka from "@/assets/festivals/india-ashoka.png";

// Festival icon collections
const festivalIcons: Record<string, string[]> = {
  christmas: [
    christmasSanta, christmasTree, christmasElf, christmasGift, christmasSnowflake,
    christmasReindeer, christmasSleigh, christmasCandy, christmasBell, christmasStocking
  ],
  diwali: [
    diwaliDiya, diwaliFireworks, diwaliLantern, diwaliSparkler, diwaliRocket,
    diwaliCracker, diwaliSweets, diwaliChakra
  ],
  holi: [holiColor, holiPowder, holiDrums, holiSweets, holiPot],
  new_year: [newyearFirework, newyearChampagne, newyearConfetti, newyearBalloon, newyearParty],
  halloween: [halloweenPumpkin, halloweenGhost, halloweenWitch, halloweenBat, halloweenSkull],
  valentines: [valentineHeart, valentineRose, valentineCupid, valentineGift],
  mothers_day: [valentineHeart, valentineRose, valentineGift, valentineCupid],
  easter: [easterBunny, easterEgg, easterBasket, easterChick],
  black_friday: [blackfridaySale, blackfridayTag, blackfridayCart, blackfridayBag],
  cyber_monday: [blackfridaySale, blackfridayTag, blackfridayCart, blackfridayBag],
  eid: [eidMoon, eidLantern, eidStar, eidMosque],
  thanksgiving: [thanksgivingTurkey, thanksgivingPumpkin, thanksgivingCorn, thanksgivingPie],
  independence_day: [indiaFlag, indiaAshoka, indiaFlag, indiaAshoka],
  republic_day: [indiaFlag, indiaAshoka, indiaFlag, indiaAshoka],
  navratri: [diwaliDiya, holiColor, diwaliSweets, holiDrums],
  durga_puja: [diwaliDiya, diwaliSweets, holiColor, diwaliLantern],
  onam: [diwaliDiya, holiColor, diwaliSweets, easterBasket],
  ganesh_chaturthi: [diwaliDiya, diwaliSweets, diwaliLantern, holiSweets],
  raksha_bandhan: [valentineGift, diwaliSweets, holiColor, valentineHeart],
  chinese_new_year: [newyearFirework, eidLantern, newyearConfetti, newyearBalloon],
  pongal: [diwaliDiya, thanksgivingCorn, diwaliSweets, holiPot],
  baisakhi: [diwaliDiya, holiDrums, thanksgivingCorn, holiPot],
  makar_sankranti: [diwaliDiya, newyearBalloon, diwaliSweets, thanksgivingCorn],
  mid_autumn: [eidMoon, eidLantern, newyearFirework, eidStar],
  fathers_day: [valentineGift, blackfridayBag, christmasGift, valentineHeart],
  memorial_day: [indiaFlag, indiaAshoka, newyearFirework, newyearBalloon],
  labor_day: [blackfridaySale, blackfridayBag, christmasGift, newyearBalloon],
  oktoberfest: [thanksgivingPumpkin, holiDrums, newyearChampagne, thanksgivingCorn],
  summer: [newyearBalloon, holiColor, easterChick, easterBasket],
  winter: [christmasSnowflake, christmasTree, christmasSleigh, christmasGift],
  spring: [easterChick, easterEgg, holiColor, valentineRose],
  monsoon: [holiPot, holiColor, newyearBalloon, eidStar],
  back_to_school: [blackfridayBag, blackfridaySale, blackfridayCart, christmasGift],
  st_patricks: [holiPot, holiColor, thanksgivingCorn, newyearChampagne],
};

interface FloatingIcon {
  id: number;
  x: number;
  y: number;
  icon: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

interface WalkingCharacter {
  id: number;
  icon: string;
  speed: number;
  y: number;
  message: string;
  action: () => void;
}

// Scattered floating icons across the page
function ScatteredIcons({ icons }: { icons: string[] }) {
  const floatingIcons = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      icon: icons[Math.floor(Math.random() * icons.length)],
      size: 24 + Math.random() * 32,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
      rotation: Math.random() * 360,
    }));
  }, [icons]);

  return (
    <>
      {floatingIcons.map((item) => (
        <motion.img
          key={item.id}
          src={item.icon}
          alt=""
          className="fixed pointer-events-none z-30 opacity-20"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: item.size,
            height: item.size,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, item.rotation, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

// Corner decorations
function CornerDecorations({ icons }: { icons: string[] }) {
  return (
    <>
      {/* Top left */}
      <motion.img
        src={icons[0]}
        alt=""
        className="fixed top-20 left-4 w-12 h-12 md:w-16 md:h-16 z-40 opacity-70 pointer-events-none"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* Top right */}
      <motion.img
        src={icons[1] || icons[0]}
        alt=""
        className="fixed top-20 right-4 w-12 h-12 md:w-16 md:h-16 z-40 opacity-70 pointer-events-none"
        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      />
      {/* Bottom left */}
      <motion.img
        src={icons[2] || icons[0]}
        alt=""
        className="fixed bottom-20 left-4 w-10 h-10 md:w-14 md:h-14 z-40 opacity-60 pointer-events-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Bottom right */}
      <motion.img
        src={icons[3] || icons[0]}
        alt=""
        className="fixed bottom-20 right-4 w-10 h-10 md:w-14 md:h-14 z-40 opacity-60 pointer-events-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
    </>
  );
}

// Walking character with icon
function WalkingIconCharacter({
  icon,
  speed = 25,
  y = 95,
  message,
  onClick,
}: {
  icon: string;
  speed?: number;
  y?: number;
  message: string;
  onClick: () => void;
}) {
  const [position, setPosition] = useState(-10);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (direction === 'right') {
          if (prev >= 110) {
            setDirection('left');
            return prev - 1;
          }
          return prev + 0.3;
        } else {
          if (prev <= -10) {
            setDirection('right');
            return prev + 1;
          }
          return prev - 0.3;
        }
      });
    }, speed);
    return () => clearInterval(interval);
  }, [direction, speed]);

  const handleClick = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2500);
    onClick();
  };

  return (
    <motion.div
      className="fixed cursor-pointer z-50"
      style={{
        left: `${position}%`,
        bottom: `${100 - y}%`,
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.2 }}
      animate={{ y: [0, -5, 0] }}
      transition={{ y: { duration: 0.5, repeat: Infinity } }}
    >
      <img src={icon} alt="" className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg" />
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium shadow-lg border"
            style={{ transform: direction === 'left' ? 'scaleX(-1) translateX(50%)' : 'translateX(-50%)' }}
          >
            <span style={{ display: 'inline-block', transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}>
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Flying character (diagonal movement)
function FlyingCharacter({
  icon,
  duration = 15,
  delay = 0,
  onClick,
}: {
  icon: string;
  duration?: number;
  delay?: number;
  onClick: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showFlying = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), duration * 1000);
    };
    
    const timeout = setTimeout(showFlying, delay * 1000);
    const interval = setInterval(showFlying, 40000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [duration, delay]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed cursor-pointer z-50 pointer-events-auto"
          initial={{ x: -100, y: "10vh", opacity: 0 }}
          animate={{ x: "calc(100vw + 100px)", y: "30vh", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: "linear" }}
          onClick={onClick}
          whileHover={{ scale: 1.3 }}
        >
          <motion.img
            src={icon}
            alt=""
            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pointing character to checkout
function PointingToCheckout({ icon }: { icon: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show on cart and checkout pages
    if (location.pathname === '/cart' || location.pathname === '/checkout') {
      const timeout = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timeout);
    }
    setVisible(false);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed bottom-1/3 right-8 z-50 cursor-pointer"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={() => navigate('/checkout')}
    >
      <motion.div
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="relative"
      >
        <img src={icon} alt="" className="w-16 h-16 md:w-20 md:h-20" />
        <motion.div
          className="absolute -left-4 top-1/2 text-3xl"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          👉
        </motion.div>
      </motion.div>
      <motion.div
        className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mt-2 text-center"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        Checkout Now!
      </motion.div>
    </motion.div>
  );
}

// Festival button overlay
function FestivalButtonOverlay({ icons }: { icons: string[] }) {
  return (
    <>
      <motion.img
        src={icons[0]}
        alt=""
        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 z-30 opacity-50 pointer-events-none"
        animate={{ y: [0, -5, 0], rotate: [0, 360] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </>
  );
}

// Main decorations component
export function FestivalDecorations() {
  const { festival } = useFestivalTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on admin pages
  if (location.pathname.includes('/admin') || location.pathname.includes('/dashboard')) {
    return null;
  }

  if (!festival?.festival_theme) return null;

  const icons = festivalIcons[festival.festival_theme] || [];
  if (icons.length === 0) return null;

  const messages: Record<string, string[]> = {
    christmas: ["🎄 Merry Christmas!", "🎁 Shop gifts!", "❄️ Holiday deals!", "🎅 Ho ho ho!"],
    diwali: ["🪔 Happy Diwali!", "✨ Festival deals!", "🎆 Celebrate!", "🎁 Special offers!"],
    holi: ["🌈 Happy Holi!", "🎨 Color your cart!", "💜 Festive offers!"],
    new_year: ["🎉 Happy New Year!", "🥂 New deals!", "✨ Fresh start!"],
    halloween: ["👻 Boo! Scary deals!", "🎃 Spooky savings!", "🦇 Trick or treat!"],
    valentines: ["💕 Love is in the air!", "💝 Gift your love!", "💘 Special deals!"],
    black_friday: ["🔥 MEGA SALE!", "💰 Huge discounts!", "🛒 Shop now!"],
    default: ["🎉 Special offer!", "🛒 Shop now!", "✨ Don't miss out!"],
  };

  const getRandomMessage = () => {
    const themeMessages = messages[festival.festival_theme || 'default'] || messages.default;
    return themeMessages[Math.floor(Math.random() * themeMessages.length)];
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Scattered background icons */}
      <ScatteredIcons icons={icons} />
      
      {/* Corner decorations */}
      <CornerDecorations icons={icons} />
      
      {/* Walking characters */}
      <div className="pointer-events-auto">
        <WalkingIconCharacter
          icon={icons[0]}
          speed={30}
          y={96}
          message={getRandomMessage()}
          onClick={() => navigate('/shop')}
        />
        {icons[1] && (
          <WalkingIconCharacter
            icon={icons[1]}
            speed={40}
            y={93}
            message={getRandomMessage()}
            onClick={() => navigate('/cart')}
          />
        )}
      </div>
      
      {/* Flying character */}
      {icons[2] && (
        <FlyingCharacter
          icon={icons[2]}
          duration={12}
          delay={5}
          onClick={() => navigate('/shop')}
        />
      )}
      
      {/* Pointing to checkout character */}
      {icons[3] && <PointingToCheckout icon={icons[3]} />}
      
      {/* Button overlay */}
      <FestivalButtonOverlay icons={icons} />
    </div>
  );
}
