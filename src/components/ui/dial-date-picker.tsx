import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  
  const itemHeight = 40;
  const visibleItems = 5;
  
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

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
        {label}
      </span>
      <div className="flex flex-col items-center">
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={decrementValue}
          className="p-1 text-muted-foreground/50 hover:text-primary transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </motion.button>
        
        <div 
          ref={containerRef}
          className="relative h-[120px] w-16 overflow-hidden"
          onWheel={handleWheel}
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)'
          }}
        >
          <motion.div
            className="absolute w-full"
            animate={{ y: -value * itemHeight + itemHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {items.map((item, index) => {
              const distance = Math.abs(index - value);
              const isSelected = index === value;
              
              return (
                <motion.div
                  key={index}
                  className={cn(
                    "h-10 flex items-center justify-center cursor-pointer transition-all duration-200",
                    isSelected 
                      ? "text-primary font-bold text-lg" 
                      : "text-muted-foreground/40 text-sm"
                  )}
                  style={{
                    opacity: isSelected ? 1 : Math.max(0.2, 1 - distance * 0.3),
                    transform: `scale(${isSelected ? 1.1 : Math.max(0.7, 1 - distance * 0.15)}) rotateX(${distance * 15 * (index < value ? 1 : -1)}deg)`,
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={() => onChange(index)}
                  whileHover={{ scale: isSelected ? 1.1 : 0.95 }}
                >
                  {item}
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Selection highlight */}
          <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 pointer-events-none">
            <div className="absolute inset-0 border-y border-primary/30 bg-primary/5 rounded-sm" />
          </div>
        </div>
        
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={incrementValue}
          className="p-1 text-muted-foreground/50 hover:text-primary transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
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
    return `${months[month]} ${day}, ${year}`;
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
            initial={{ opacity: 0, y: -10, scale: 0.95, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95, rotateX: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 p-4 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl"
            style={{ transformOrigin: 'top center', perspective: '1000px' }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            
            <div className="relative flex justify-center gap-2">
              <DialColumn
                label="Month"
                items={months}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
              <div className="flex items-center pt-6">
                <span className="text-2xl text-muted-foreground/30 font-light">/</span>
              </div>
              <DialColumn
                label="Day"
                items={days}
                value={selectedDay - 1}
                onChange={(val) => setSelectedDay(val + 1)}
              />
              <div className="flex items-center pt-6">
                <span className="text-2xl text-muted-foreground/30 font-light">/</span>
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
              className="w-full mt-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
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
