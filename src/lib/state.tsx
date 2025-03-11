"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Author, Paper } from "./types";
import { getPaperRecommendations } from "./api";
import { toast } from "sonner";

interface ScholarTinderState {
  author: Author | null;
  authorPapers: Paper[];
  currentPaper: Paper | null;
  recommendedPapers: Paper[];
  likedPapers: Paper[];
  dislikedPapers: Paper[];
  processing: boolean;
  swipeCount: number;
  setAuthor: (author: Author | null) => void;
  setAuthorPapers: (papers: Paper[]) => void;
  setRecommendedPapers: (papers: Paper[]) => void;
  addLikedPaper: (paper: Paper) => void;
  addDislikedPaper: (paper: Paper) => void;
  removeLikedPaper: (paperId: string) => void;
  resetState: () => void;
  nextPaper: () => void;
  setProcessing: (value: boolean) => void;
  refreshRecommendations: () => Promise<void>;
  resetSwipeCount: () => void;
}

const defaultState: ScholarTinderState = {
  author: null,
  authorPapers: [],
  currentPaper: null,
  recommendedPapers: [],
  likedPapers: [],
  dislikedPapers: [],
  processing: false,
  swipeCount: 0,
  setAuthor: () => {},
  setAuthorPapers: () => {},
  setRecommendedPapers: () => {},
  addLikedPaper: () => {},
  addDislikedPaper: () => {},
  removeLikedPaper: () => {},
  resetState: () => {},
  nextPaper: () => {},
  setProcessing: () => {},
  refreshRecommendations: async () => {},
  resetSwipeCount: () => {},
};

const ScholarTinderContext = createContext<ScholarTinderState>(defaultState);

export function useScholarTinder() {
  return useContext(ScholarTinderContext);
}

export function ScholarTinderProvider({ children }: { children: ReactNode }) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [authorPapers, setAuthorPapers] = useState<Paper[]>([]);
  const [recommendedPapers, setRecommendedPapers] = useState<Paper[]>([]);
  const [likedPapers, setLikedPapers] = useState<Paper[]>([]);
  const [dislikedPapers, setDislikedPapers] = useState<Paper[]>([]);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [swipeCount, setSwipeCount] = useState<number>(0);

  // Initialize or update current paper when recommended papers change
  useEffect(() => {
    if (recommendedPapers.length > 0 && !currentPaper) {
      setCurrentPaper(recommendedPapers[0]);
    }
  }, [recommendedPapers, currentPaper]);

  const resetSwipeCount = useCallback(() => {
    setSwipeCount(0);
  }, []);

  const addLikedPaper = (paper: Paper) => {
    setLikedPapers((prev) => {
      // Check if paper already exists
      if (prev.some((p) => p.paperId === paper.paperId)) {
        return prev;
      }
      return [...prev, paper];
    });
    
    // Increment swipe count
    setSwipeCount(prev => prev + 1);
    
    nextPaper();
  };

  const addDislikedPaper = (paper: Paper) => {
    setDislikedPapers((prev) => {
      // Check if paper already exists
      if (prev.some((p) => p.paperId === paper.paperId)) {
        return prev;
      }
      return [...prev, paper];
    });
    
    // Increment swipe count
    setSwipeCount(prev => prev + 1);
    
    nextPaper();
  };

  const removeLikedPaper = (paperId: string) => {
    setLikedPapers((prev) => prev.filter((p) => p.paperId !== paperId));
  };

  const nextPaper = () => {
    if (!currentPaper || recommendedPapers.length <= 1) {
      setCurrentPaper(null);
      return;
    }
    
    // Remove the current paper from recommended papers
    const newRecommendedPapers = recommendedPapers.filter(
      (p) => p.paperId !== currentPaper.paperId
    );
    
    setRecommendedPapers(newRecommendedPapers);
    
    // Set the next paper as current
    if (newRecommendedPapers.length > 0) {
      setCurrentPaper(newRecommendedPapers[0]);
    } else {
      setCurrentPaper(null);
    }
  };

  const refreshRecommendations = useCallback(async () => {
    // Only attempt to refresh if we have positive papers to base recommendations on
    if (!authorPapers.length && !likedPapers.length) {
      toast.error("No papers available to base recommendations on");
      return;
    }

    setProcessing(true);
    
    try {
      // Get the 5 most recent papers by the author
      const sortedAuthorPapers = [...authorPapers]
        .sort((a, b) => {
          // Sort by year (descending), handle undefined years
          const yearA = a.year || 0;
          const yearB = b.year || 0;
          return yearB - yearA;
        })
        .slice(0, 5); // Take only the 5 most recent
      
      // Combine author's recent papers and liked papers for positive examples
      const positivePaperIds = [
        ...sortedAuthorPapers.map(paper => paper.paperId),
        ...likedPapers.map(paper => paper.paperId)
      ];
      
      // Use disliked papers as negative examples
      const negativePaperIds = dislikedPapers.map(paper => paper.paperId);
      
      console.log(`Refreshing recommendations with ${positivePaperIds.length} positive papers (including ${sortedAuthorPapers.length} recent author papers) and ${negativePaperIds.length} negative papers`);
      
      const result = await getPaperRecommendations({
        positivePaperIds,
        negativePaperIds,
        limit: 10,
      });
      
      // Process the response based on actual API structure
      let papersList: Paper[] = [];
      
      if (Array.isArray(result.papers)) {
        papersList = result.papers;
      } else if (result.data && Array.isArray(result.data)) {
        papersList = result.data;
      } else if (result.recommendedPapers && Array.isArray(result.recommendedPapers)) {
        papersList = result.recommendedPapers;
      }
      
      // Filter out papers we've already seen
      const allSeenPaperIds = [
        ...likedPapers.map(p => p.paperId),
        ...dislikedPapers.map(p => p.paperId)
      ];
      
      const filteredRecommendations = papersList.filter(
        paper => !allSeenPaperIds.includes(paper.paperId)
      );
      
      // Update state with new recommendations
      setRecommendedPapers(filteredRecommendations);
      
      if (filteredRecommendations.length === 0) {
        toast.info("No new recommendations found. Try adding more liked papers.");
      } else {
        toast.success(`Found ${filteredRecommendations.length} paper recommendations`);
      }
      
      // Reset swipe count after refreshing
      resetSwipeCount();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to refresh recommendations: ${errorMessage}`);
      console.error("Failed to refresh recommendations:", error);
    } finally {
      setProcessing(false);
    }
  }, [authorPapers, likedPapers, dislikedPapers, setRecommendedPapers, setProcessing, resetSwipeCount]);

  // Check if we need to auto-refresh based on swipe count
  useEffect(() => {
    const AUTO_REFRESH_THRESHOLD = 5;
    
    if (swipeCount >= AUTO_REFRESH_THRESHOLD && !processing) {
      console.log(`Auto-refreshing after ${swipeCount} swipes`);
      refreshRecommendations();
      resetSwipeCount();
    }
  }, [swipeCount, processing, refreshRecommendations, resetSwipeCount]);

  const resetState = () => {
    setAuthor(null);
    setAuthorPapers([]);
    setRecommendedPapers([]);
    setLikedPapers([]);
    setDislikedPapers([]);
    setCurrentPaper(null);
    setProcessing(false);
    setSwipeCount(0);
  };

  const value = {
    author,
    authorPapers,
    currentPaper,
    recommendedPapers,
    likedPapers,
    dislikedPapers,
    processing,
    swipeCount,
    setAuthor,
    setAuthorPapers,
    setRecommendedPapers,
    addLikedPaper,
    addDislikedPaper,
    removeLikedPaper,
    resetState,
    nextPaper,
    setProcessing,
    refreshRecommendations,
    resetSwipeCount,
  };

  return (
    <ScholarTinderContext.Provider value={value}>
      {children}
    </ScholarTinderContext.Provider>
  );
} 