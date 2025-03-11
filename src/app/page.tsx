"use client";

import { useState, useEffect } from "react";
import { useScholarTinder } from "@/lib/state";
import { AuthorSearch } from "@/components/author-search";
import { PaperSwiper } from "@/components/paper-swiper";
import { LikedPapersList } from "@/components/liked-papers-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { Footer } from "@/components/footer";

export default function Home() {
  const { author, resetState, likedPapers } = useScholarTinder();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile or desktop
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close mobile menu when switching back to desktop
  useEffect(() => {
    if (!isMobile) {
      setShowMobileMenu(false);
    }
  }, [isMobile]);

  // Toggle mobile liked papers menu
  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="container mx-auto py-8 px-4 flex-grow">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary text-center mx-auto">Paper Tinder</h1>
          <div className="flex items-center gap-2">
            {author && likedPapers.length > 0 && isMobile && (
              <Button 
                variant="outline" 
                size="icon"
                className="md:hidden relative"
                onClick={toggleMobileMenu}
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {likedPapers.length}
                </span>
              </Button>
            )}
            {author && (
              <Button 
                variant="ghost" 
                className="flex items-center gap-1" 
                onClick={resetState}
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
            )}
          </div>
        </header>

        {!author ? (
          <AuthorSearch />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <PaperSwiper />
              </div>
              <div className="hidden md:block">
                <LikedPapersList />
              </div>
            </div>
            
            {/* Mobile liked papers panel */}
            {showMobileMenu && (
              <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={toggleMobileMenu}>
                <div 
                  className="absolute right-0 top-0 bottom-0 w-[85%] max-w-md bg-white shadow-lg p-4 overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Liked Papers ({likedPapers.length})</h2>
                    <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </div>
                  <LikedPapersList />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  );
}
