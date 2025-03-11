import { 
  AuthorPapersParams, 
  AuthorSearchResult, 
  PapersResponse, 
  RecommendationsParams, 
  RecommendationsResponse 
} from "./types";

/**
 * Search for authors by name
 */
export async function searchAuthors(query: string): Promise<AuthorSearchResult> {
  const params = new URLSearchParams({ query });

  const response = await fetch(`/api/semanticscholar/search?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to search authors: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get papers by author
 */
export async function getAuthorPapers({ authorId, limit = 100, fields = [] }: AuthorPapersParams): Promise<PapersResponse> {
  const defaultFields = [
    "paperId", 
    "title", 
    "abstract", 
    "year", 
    "referenceCount", 
    "citationCount", 
    "influentialCitationCount", 
    "isOpenAccess", 
    "openAccessPdf", 
    "fieldsOfStudy", 
    "publicationVenue", 
    "authors", 
    "url",
    "externalIds"
  ];

  const params = new URLSearchParams({
    authorId,
    fields: [...defaultFields, ...fields].join(","),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/semanticscholar/papers?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get author papers: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get paper recommendations based on positive and negative paper IDs
 */
export async function getPaperRecommendations({
  positivePaperIds,
  negativePaperIds = [],
  fields = []
}: RecommendationsParams): Promise<RecommendationsResponse> {
  const defaultFields = [
    "paperId", 
    "title", 
    "abstract", 
    "year", 
    "referenceCount", 
    "citationCount", 
    "influentialCitationCount", 
    "isOpenAccess", 
    "openAccessPdf", 
    "fieldsOfStudy", 
    "publicationVenue", 
    "authors", 
    "url",
    "externalIds"
  ];

  // Create the request body
  const requestBody = {
    positivePaperIds,
    negativePaperIds,
    fields: [...defaultFields, ...fields].join(","),
    limit: 5, // Always limit to 5 papers
  };

  const response = await fetch("/api/semanticscholar/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get paper recommendations: ${response.statusText}`);
  }

  return response.json();
} 