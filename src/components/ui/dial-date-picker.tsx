import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  max?: string;
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const monthsFull = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const DialColumn = ({ 
  items, 
  value, 
  onChange, 
  label 
}: { 
  items: (string | number)[]; 
  value: number; 
  onChange: (val: number) => void;
  label: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const lastTouchTime = useRef<number>(0);
  const velocity = useRef<number>(0);
  const momentumFrame = useRef<number | null>(null);
  
  const itemHeight = 32;
  const visibleItems = 3;
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    const newValue = Math.max(0, Math.min(items.length - 1, value + delta));
    onChange(newValue);
  };

  const incrementValue = () => {
    if (value < items.length - 1) onChange(value + 1);
  };

  const decrementValue = () => {
    if (value > 0) onChange(value - 1);
  };

  // Touch handlers for swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (momentumFrame.current) {
      cancelAnimationFrame(momentumFrame.current);
      momentumFrame.current = null;
    }
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    lastTouchTime.current = Date.now();
    velocity.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    const deltaY = touchCurrentY.current - currentY;
    const now = Date.now();
    const timeDelta = now - lastTouchTime.current;
    
    if (timeDelta > 0) {
      velocity.current = deltaY / timeDelta;
    }
    
    touchCurrentY.current = currentY;
    lastTouchTime.current = now;
    
    // Calculate how many items to scroll based on drag distance
    const totalDelta = touchStartY.current - currentY;
    const itemsToScroll = Math.round(totalDelta / (itemHeight * 0.6));
    
    if (Math.abs(itemsToScroll) >= 1) {
      const newValue = Math.max(0, Math.min(items.length - 1, value + itemsToScroll));
      if (newValue !== value) {
        onChange(newValue);
        touchStartY.current = currentY;
      }
    }
  };

  const handleTouchEnd = () => {
    // Apply momentum scrolling
    const applyMomentum = () => {
      if (Math.abs(velocity.current) > 0.02) {
        const direction = velocity.current > 0 ? 1 : -1;
        const itemsToScroll = Math.ceil(Math.abs(velocity.current) * 8);
        
        for (let i = 0; i < itemsToScroll; i++) {
          setTimeout(() => {
            const newValue = Math.max(0, Math.min(items.length - 1, value + direction));
            if (newValue !== value) {
              onChange(newValue);
            }
          }, i * 50);
        }
        
        velocity.current *= 0.85;
        if (Math.abs(velocity.current) > 0.02) {
          momentumFrame.current = requestAnimationFrame(applyMomentum);
        }
      }
    };
    
    if (Math.abs(velocity.current) > 0.3) {
      applyMomentum();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (momentumFrame.current) {
        cancelAnimationFrame(momentumFrame.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <div className="flex flex-col items-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.2, y: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={decrementValue}
          className="p-0.5 text-primary/70 hover:text-primary transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
        
        <div 
          ref={containerRef}
          className="relative h-24 w-14 overflow-hidden rounded-lg bg-muted/30 border border-border/50 touch-none"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="absolute w-full"
            animate={{ y: -value * itemHeight + itemHeight }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            {items.map((item, index) => {
              const distance = Math.abs(index - value);
              const isSelected = index === value;
              
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "h-8 flex items-center justify-center cursor-pointer select-none",
                    isSelected 
                      ? "text-primary font-bold text-base" 
                      : "text-muted-foreground text-xs"
                  )}
                  animate={{
                    opacity: isSelected ? 1 : Math.max(0.3, 1 - distance * 0.35),
                    scale: isSelected ? 1.15 : Math.max(0.75, 1 - distance * 0.12),
                  }}
                  onClick={() => onChange(index)}
                  whileHover={{ scale: isSelected ? 1.15 : 0.9 }}
                >
                  {item}
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Selection highlight */}
          <div className="absolute top-1/2 left-1 right-1 h-8 -translate-y-1/2 pointer-events-none z-0">
            <div className="absolute inset-0 border border-primary/50 bg-primary/10 rounded-md shadow-sm shadow-primary/20" />
          </div>
        </div>
        
        <motion.button
          type="button"
          whileHover={{ scale: 1.2, y: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={incrementValue}
          className="p-0.5 text-primary/70 hover:text-primary transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export const DialDatePicker = ({ 
  value, 
  onChange, 
  className,
  required,
  max 
}: DialDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse current value or use defaults
  const parseDate = (dateStr: string) => {
    if (!dateStr) {
      const now = new Date();
      return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() - 18 };
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    return { day: day || 1, month: (month || 1) - 1, year: year || 2000 };
  };
  
  const { day: initialDay, month: initialMonth, year: initialYear } = parseDate(value);
  
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  
  // Generate years (100 years back from max or current year)
  const maxYear = max ? parseInt(max.split('-')[0]) : new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => maxYear - i);
  
  // Generate days based on selected month/year
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Adjust day if it exceeds days in month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);
  
  // Update parent when values change
  useEffect(() => {
    if (isOpen) {
      const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
      const formattedDay = String(selectedDay).padStart(2, '0');
      const newValue = `${selectedYear}-${formattedMonth}-${formattedDay}`;
      onChange(newValue);
    }
  }, [selectedDay, selectedMonth, selectedYear, isOpen, onChange]);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  const formatDisplayDate = () => {
    if (!value) return "Select your date of birth";
    const { day, month, year } = parseDate(value);
    return `${monthsFull[month]} ${day}, ${year}`;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-md border bg-background text-left",
          "transition-all duration-300",
          isOpen 
            ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10" 
            : "border-input hover:border-primary/50"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ 
            rotate: isOpen ? 360 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ duration: 0.3 }}
        >
          <Calendar className={cn(
            "w-4 h-4 transition-colors",
            isOpen ? "text-primary" : "text-muted-foreground"
          )} />
        </motion.div>
        <span className={cn(
          "flex-1 text-sm",
          !value && "text-muted-foreground"
        )}>
          {formatDisplayDate()}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 p-3 rounded-xl border border-border bg-background shadow-2xl"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative flex justify-center items-start gap-1">
              <DialColumn
                label="Month"
                items={months}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
              <div className="flex items-center pt-5">
                <span className="text-xl text-muted-foreground/40 font-light">/</span>
              </div>
              <DialColumn
                label="Day"
                items={days}
                value={selectedDay - 1}
                onChange={(val) => setSelectedDay(val + 1)}
              />
              <div className="flex items-center pt-5">
                <span className="text-xl text-muted-foreground/40 font-light">/</span>
              </div>
              <DialColumn
                label="Year"
                items={years}
                value={years.indexOf(selectedYear)}
                onChange={(val) => setSelectedYear(years[val])}
              />
            </div>
            
            {/* Done button */}
            <motion.button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
