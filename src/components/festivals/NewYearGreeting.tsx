import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function NewYearGreeting() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

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
      {/* Top Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60]">
          <div className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 py-3 text-center">
            <span className="text-white font-bold text-lg tracking-wide">
              🎆 Happy New Year 2026! 🎆
            </span>
          </div>
        </div>
      )}

      {/* Greeting Popup */}
      <Dialog open={showGreeting} onOpenChange={setShowGreeting}>
        <DialogContent className="sm:max-w-md border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-900 via-amber-800 to-yellow-900 p-0 overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <h1 className="text-4xl font-bold text-yellow-300">
              🎆 Happy New Year! 🎆
            </h1>

            <p className="text-lg text-yellow-100/90">
              Wishing you a wonderful year ahead filled with joy, success, and endless possibilities!
            </p>

            <div className="text-5xl font-bold text-yellow-400">
              2026
            </div>

            <p className="text-yellow-200/70 text-sm">
              Thank you for being with us!
            </p>

            <Button
              onClick={handleThankYou}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold px-8 py-3 rounded-full text-lg"
            >
              Thank You!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
