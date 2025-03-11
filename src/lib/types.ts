export interface Author {
  authorId: string;
  name: string;
  url: string;
  paperCount: number;
  citationCount: number;
  hIndex: number;
  aliases?: string[];
  affiliations?: string[];
}

export interface AuthorSearchResult {
  authors: Author[];
  next?: string;
  offset?: number;
  total?: number;
  data?: any[];
}

export interface PaperAuthor {
  authorId: string;
  name: string;
}

export interface Paper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  referenceCount?: number;
  citationCount?: number;
  influentialCitationCount?: number;
  isOpenAccess?: boolean;
  openAccessPdf?: {
    url: string;
    status: string;
  };
  fieldsOfStudy?: string[];
  publicationVenue?: {
    id?: string;
    name?: string;
    type?: string;
    url?: string;
    alternate_names?: string[];
  };
  authors: PaperAuthor[];
  url: string;
  externalIds?: Record<string, string>;
}

export interface PapersResponse {
  papers: Paper[];
  next?: string;
  offset?: number;
  total?: number;
  data?: Paper[];
}

export interface RecommendationsResponse {
  papers: Paper[];
  data?: Paper[];
  recommendedPapers?: Paper[];
}

export interface AuthorPapersParams {
  authorId: string;
  limit?: number;
  fields?: string[];
}

export interface RecommendationsParams {
  positivePaperIds: string[];
  negativePaperIds?: string[];
  limit?: number;
  fields?: string[];
} 