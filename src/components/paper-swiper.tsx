"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaperRecommendations } from "@/lib/api";
import { useScholarTinder } from "@/lib/state";
import { ThumbsUp, ThumbsDown, ExternalLink, BookOpen, Users, Award, Calendar, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Paper } from "@/lib/types";

export function PaperSwiper() {
  const {
    author,
    authorPapers,
    currentPaper,
    recommendedPapers,
    likedPapers,
    dislikedPapers,
    addLikedPaper,
    addDislikedPaper,
    setRecommendedPapers,
    processing,
    setProcessing,
    refreshRecommendations,
    swipeCount,
  } = useScholarTinder();

  const [animationClass, setAnimationClass] = useState("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [noMorePapers, setNoMorePapers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    setProcessing(true);
    setError(null);
    
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
      
      console.log(`Using ${sortedAuthorPapers.length} most recent papers by the author for recommendations`);
      
      // Construct the positive paper IDs list:
      // 1. Start with the 5 most recent author's papers
      // 2. Add papers the user has liked
      const positivePaperIds = [
        ...sortedAuthorPapers.map(paper => paper.paperId),
        ...likedPapers.map(paper => paper.paperId)
      ];
      
      if (positivePaperIds.length === 0) {
        throw new Error("No papers available to base recommendations on");
      }
      
      // Use papers the user has disliked as negative examples
      // This helps the recommendation engine avoid similar papers
      const negativePaperIds = dislikedPapers.map(paper => paper.paperId);
      
      console.log(`Fetching recommendations with ${positivePaperIds.length} positive papers and ${negativePaperIds.length} negative papers`);
      
      const result = await getPaperRecommendations({
        positivePaperIds,
        negativePaperIds,
        limit: 10,
      });
      
      // Process the response based on actual API structure
      let papersList: Paper[] = [];
      
      if (Array.isArray(result.papers)) {
        // If the response has a papers array as expected
        papersList = result.papers;
      } else if (result.data && Array.isArray(result.data)) {
        // If the API returns data in a different format
        papersList = result.data as Paper[];
      } else if (result.recommendedPapers && Array.isArray(result.recommendedPapers)) {
        // If the API returns recommendedPapers array
        papersList = result.recommendedPapers as Paper[];
      }
      
      // Filter out papers that the user has already liked or disliked
      const allSeenPaperIds = [
        ...likedPapers.map(p => p.paperId),
        ...dislikedPapers.map(p => p.paperId)
      ];
      
      const filteredRecommendations = papersList.filter(
        paper => !allSeenPaperIds.includes(paper.paperId)
      );
      
      setRecommendedPapers(filteredRecommendations);
      
      if (filteredRecommendations.length === 0) {
        toast.info("No new recommendations found. Try again or modify your preferences.");
      } else {
        toast.success(`Found ${filteredRecommendations.length} paper recommendations`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to fetch recommendations: ${errorMessage}`);
      toast.error(`Recommendation error: ${errorMessage}`);
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
      setProcessing(false);
    }
  }, [authorPapers, likedPapers, dislikedPapers, setRecommendedPapers, setProcessing]);

  // On initial load, fetch paper recommendations based on author papers
  useEffect(() => {
    if (authorPapers.length > 0 && recommendedPapers.length === 0 && !processing) {
      fetchRecommendations();
    }
  }, [authorPapers, recommendedPapers.length, processing, fetchRecommendations]);

  // Check when we run out of papers
  useEffect(() => {
    if (recommendedPapers.length === 0 && !loadingRecommendations && authorPapers.length > 0) {
      setNoMorePapers(true);
    } else {
      setNoMorePapers(false);
    }
  }, [recommendedPapers.length, loadingRecommendations, authorPapers.length]);

  const handleRefresh = () => {
    refreshRecommendations();
  };

  const handleLike = useCallback(() => {
    if (!currentPaper || animationClass) return;
    setAnimationClass("slide-right");
    
    setTimeout(() => {
      addLikedPaper(currentPaper);
      setAnimationClass("");
      toast.success("Paper added to your liked list");
      
      // If we're running low on recommendations, fetch more
      if (recommendedPapers.length <= 2) {
        refreshRecommendations();
      }
    }, 300);
  }, [currentPaper, animationClass, addLikedPaper, recommendedPapers.length, refreshRecommendations]);

  const handleDislike = useCallback(() => {
    if (!currentPaper || animationClass) return;
    setAnimationClass("slide-left");
    
    setTimeout(() => {
      addDislikedPaper(currentPaper);
      setAnimationClass("");
      toast.info("Paper skipped");
      
      // If we're running low on recommendations, fetch more
      if (recommendedPapers.length <= 2) {
        refreshRecommendations();
      }
    }, 300);
  }, [currentPaper, animationClass, addDislikedPaper, recommendedPapers.length, refreshRecommendations]);

  // Add keyboard navigation - now defined after the handler functions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation if we have a current paper and not in processing state
      if (!currentPaper || processing || animationClass) return;
      
      if (e.key === "ArrowRight") {
        // Right arrow key = like (swipe right)
        e.preventDefault();
        handleLike();
      } else if (e.key === "ArrowLeft") {
        // Left arrow key = dislike (swipe left)
        e.preventDefault();
        handleDislike();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    // Cleanup function
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPaper, processing, animationClass, handleLike, handleDislike]);

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-6">
        <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md mb-4">
          {error}
        </div>
        <Button onClick={fetchRecommendations} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  // Loading state
  if (loadingRecommendations || processing) {
    return (
      <div className="w-full max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-wrap gap-2 mt-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  // No more papers state
  if (noMorePapers) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-6">
        <h2 className="text-xl font-bold mb-4">No More Papers!</h2>
        <p className="mb-6 text-muted-foreground">
          You&apos;ve gone through all our recommendations. Would you like to get more?
        </p>
        <Button onClick={refreshRecommendations} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Get More Recommendations
        </Button>
      </div>
    );
  }

  // No author selected yet
  if (!author || authorPapers.length === 0) {
    return null;
  }

  // No current paper
  if (!currentPaper) {
    return (
      <div className="w-full max-w-xl mx-auto text-center p-6">
        <h2 className="text-xl font-bold mb-4">Loading Recommendations</h2>
        <p className="mb-6 text-muted-foreground">
          We&apos;re preparing paper recommendations based on your profile.
        </p>
        <Button onClick={refreshRecommendations} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Get Recommendations
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="inline-flex items-center mr-4">
            <span className="inline-block mr-1">←</span> Dislike
          </span>
          <span className="inline-flex items-center">
            Like <span className="inline-block ml-1">→</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            Auto-refresh in {5 - swipeCount} swipes
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-sm sm:self-end" 
            onClick={handleRefresh}
            disabled={processing}
          >
            <RefreshCw className="h-3.5 w-3.5" /> 
            Refresh
          </Button>
        </div>
      </div>
      
      <div 
        ref={cardRef}
        className={`w-full ${animationClass}`}
      >
        <Card className="overflow-hidden border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 shrink-0"
                onClick={handleDislike}
                aria-label="Dislike paper"
                title="Dislike (Left Arrow)"
              >
                <ThumbsDown className="h-5 w-5" />
              </Button>
              
              <div className="flex-1">
                <CardTitle className="text-xl">
                  {currentPaper.title}
                </CardTitle>
                {currentPaper.publicationVenue?.name && (
                  <CardDescription className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {currentPaper.publicationVenue.name}
                  </CardDescription>
                )}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-green-100 text-green-500 hover:bg-green-200 hover:text-green-600 shrink-0"
                onClick={handleLike}
                aria-label="Like paper"
                title="Like (Right Arrow)"
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPaper.abstract && (
              <div className="border rounded-md p-4 bg-slate-50">
                <h3 className="text-sm font-semibold mb-2">Abstract</h3>
                <p className="text-sm leading-relaxed">
                  {currentPaper.abstract}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {currentPaper.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {currentPaper.year}
                </span>
              )}
              
              {currentPaper.authors && currentPaper.authors.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {currentPaper.authors.length} Authors
                </span>
              )}
              
              {typeof currentPaper.citationCount === 'number' && (
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" /> {currentPaper.citationCount} Citations
                </span>
              )}
            </div>

            {currentPaper.fieldsOfStudy && currentPaper.fieldsOfStudy.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentPaper.fieldsOfStudy.map((field, index) => (
                  <Badge key={index} variant="secondary">{field}</Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t pt-4">
            <a 
              href={currentPaper.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              <ExternalLink className="h-4 w-4" /> View on Semantic Scholar
            </a>
          </CardFooter>
        </Card>
      </div>

      {/* Mobile touch swipe instructions */}
      <div className="text-center mt-6 text-sm text-muted-foreground md:hidden">
        <p>Swipe left or right to dislike or like papers</p>
      </div>

      <style jsx>{`
        .slide-left {
          transform: translateX(-120%);
          transition: transform 0.3s ease-out;
          opacity: 0;
        }
        
        .slide-right {
          transform: translateX(120%);
          transition: transform 0.3s ease-out;
          opacity: 0;
        }
      `}</style>
    </div>
  );
} 