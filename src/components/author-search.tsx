"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Author, Paper } from "@/lib/types";
import { searchAuthors, getAuthorPapers } from "@/lib/api";
import { useScholarTinder } from "@/lib/state";
import { toast } from "sonner";
import { FileText, Award, Building, BarChart2, Search } from "lucide-react";

export function AuthorSearch() {
  const { setAuthor, setAuthorPapers, processing, setProcessing } = useScholarTinder();
  const [query, setQuery] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      // Make the API call
      const result = await searchAuthors(query);
      
      // Set the authors from the result
      setAuthors(result.authors || []);
      
      // Show toast with results info
      if (!result.authors || result.authors.length === 0) {
        toast.info(`No authors found for "${query}". Try a different search term.`);
      } else {
        toast.success(`Found ${result.authors.length} authors matching "${query}"`);
        if (result.total && result.total > result.authors.length) {
          toast.info(`Showing ${result.authors.length} of ${result.total} total results`);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to search for authors: ${errorMessage}`);
      toast.error(`Search failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset hasSearched when query changes
  useEffect(() => {
    setHasSearched(false);
  }, [query]);

  const handleSelectAuthor = async (author: Author) => {
    setProcessing(true);
    try {
      // First, set the selected author in the state
      setAuthor(author);
      
      // Then, fetch all papers by this author
      const result = await getAuthorPapers({ authorId: author.authorId });
      
      // Process the response based on actual API structure
      let papersList: Paper[] = [];
      
      if (Array.isArray(result.papers)) {
        // If the response has a papers array as expected
        papersList = result.papers;
      } else if (result.data && Array.isArray(result.data)) {
        // If the API returns data in a different format
        papersList = result.data;
      }
      
      // Update the author papers in the state
      setAuthorPapers(papersList);
      
      // Show toast with number of papers loaded
      toast.success(`Loaded ${papersList.length} papers by ${author.name}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to fetch author papers: ${errorMessage}`);
      toast.error(`Failed to load papers: ${errorMessage}`);
      console.error(err);
      
      // Reset author since we couldn't load papers
      setAuthor(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Find Your Semantic Scholar Profile</h1>
        <p className="text-muted-foreground mb-6">
          Search for your name to find your Semantic Scholar profile. We&apos;ll use your papers 
          to recommend new papers you might be interested in.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Search by author name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          disabled={loading || processing}
        />
        <Button type="submit" disabled={loading || processing}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-[100px]" />
              </CardFooter>
            </Card>
          ))
        ) : (
          authors.map((author) => (
            <Card key={author.authorId} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-medium text-sm">
                      {author.name.split(" ").map(name => name[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{author.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {author.affiliations && author.affiliations.length > 0 
                        ? author.affiliations[0] 
                        : "No affiliation"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <FileText className="h-3 w-3" /> Papers
                    </div>
                    <span className="font-semibold">{author.paperCount}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Award className="h-3 w-3" /> Citations
                    </div>
                    <span className="font-semibold">{author.citationCount}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <BarChart2 className="h-3 w-3" /> h-index
                    </div>
                    <span className="font-semibold">{author.hIndex}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSelectAuthor(author)}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? "Loading Papers..." : "Select Profile"}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}

        {!loading && query && !hasSearched && (
          <div className="text-center p-6 border rounded-md bg-slate-50">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <p className="text-muted-foreground">
                Press Enter or click Search to find authors matching &quot;{query}&quot;
              </p>
            </div>
          </div>
        )}

        {!loading && hasSearched && authors.length === 0 && query && (
          <div className="text-center text-muted-foreground p-6">
            No authors found for &quot;{query}&quot;. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
} 