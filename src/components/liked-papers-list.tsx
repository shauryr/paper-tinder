"use client";

import { useScholarTinder } from "@/lib/state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, BookOpen } from "lucide-react";

export function LikedPapersList() {
  const { likedPapers, removeLikedPaper, author } = useScholarTinder();

  if (!author) {
    return null;
  }

  // If there are no liked papers, show a message
  if (likedPapers.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-slate-50">
        <p className="text-muted-foreground text-sm">
          Papers you like will appear here. 
          <br />
          Swipe right or press <span className="font-medium">→</span> to like a paper.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="hidden md:block">
        <h2 className="text-xl font-bold">Liked Papers ({likedPapers.length})</h2>
        <p className="text-sm text-muted-foreground">
          Papers you&apos;ve liked will appear here.
        </p>
        <Separator className="my-3" />
      </div>

      <div className="space-y-3 md:max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        {likedPapers.map((paper) => (
          <Card key={paper.paperId} className="transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base line-clamp-2">
                <a 
                  href={paper.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  {paper.title}
                </a>
              </CardTitle>
              {paper.publicationVenue?.name && (
                <CardDescription className="flex items-center gap-1 text-xs">
                  <BookOpen className="h-3 w-3" />
                  {paper.publicationVenue.name}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex flex-wrap gap-1 mb-3">
                {paper.year && (
                  <Badge variant="outline" className="text-xs">{paper.year}</Badge>
                )}
                {typeof paper.citationCount === 'number' && (
                  <Badge variant="outline" className="text-xs">
                    {paper.citationCount} citations
                  </Badge>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                  onClick={() => removeLikedPaper(paper.paperId)}
                  aria-label="Remove from liked papers"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 