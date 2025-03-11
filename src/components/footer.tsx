import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
      <div className="flex items-center justify-center gap-1">
        Made by{" "}
        <Link 
          href="https://shaurya.ai" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium hover:text-primary transition-colors"
        >
          Shaurya
        </Link>{" "}
        with{" "}
        <Heart className="h-3 w-3 text-red-500 inline" fill="currentColor" />{" "}
      </div>
    </footer>
  );
} 