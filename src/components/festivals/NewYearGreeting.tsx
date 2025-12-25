import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export function NewYearGreeting() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  useEffect(() => {
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem("newYearGreetingSeen");
    
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const isNewYearPeriod = (month === 11 && day >= 25) || (month === 0 && day <= 5);
    
    if (isNewYearPeriod && lastSeen !== today) {
      setTimeout(() => {
        setShowGreeting(true);
        setShowBanner(true);
      }, 1500);
    } else if (isNewYearPeriod) {
      setShowBanner(true);
    }
  }, []);

  const handleThankYou = () => {
    const today = new Date().toDateString();
    localStorage.setItem("newYearGreetingSeen", today);
    setShowGreeting(false);
  };

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60]">
          <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 py-2.5 text-center">
            <span className="text-white font-semibold text-sm tracking-wide">
              Happy New Year 2026 — Enjoy 15% Off on All Orders
            </span>
          </div>
        </div>
      )}

      <Dialog open={showGreeting} onOpenChange={setShowGreeting}>
        <DialogContent className="sm:max-w-lg border border-amber-500/30 bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 p-0 overflow-hidden">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80" 
              alt="New Year Celebration"
              className="w-full h-48 object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-950" />
          </div>
          
          <div className="px-8 pb-8 pt-2 text-center space-y-5">
            <p className="text-amber-300/80 text-sm uppercase tracking-widest">
              Wishing You a Prosperous
            </p>
            
            <h1 className="text-4xl font-bold text-amber-100 tracking-tight">
              Happy New Year 2026
            </h1>

            <p className="text-xl text-amber-200">
              {userName}
            </p>

            <div className="py-4">
              <div className="inline-block bg-amber-800/50 border border-amber-600/40 rounded-lg px-6 py-3">
                <p className="text-amber-300/70 text-xs uppercase tracking-wider mb-1">
                  Exclusive Offer
                </p>
                <p className="text-3xl font-bold text-amber-100">
                  15% OFF
                </p>
                <p className="text-amber-300/60 text-xs mt-1">
                  On All Orders
                </p>
              </div>
            </div>

            <p className="text-amber-300/60 text-sm">
              Thank you for being with us this year
            </p>

            <Button
              onClick={handleThankYou}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-medium px-10 py-2.5 rounded-full"
            >
              Thank You
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
