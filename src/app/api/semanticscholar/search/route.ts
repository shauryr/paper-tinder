import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.semanticscholar.org/graph/v1";
const API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY ;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const limit = searchParams.get("limit") || "10";
    
    if (!query) {
      return NextResponse.json(
        { error: "query parameter is required" },
        { status: 400 }
      );
    }
    
    // Construct the API URL with proper fields for author metadata
    const apiUrl = `${API_BASE_URL}/author/search?query=${encodeURIComponent(query)}&fields=name,url,paperCount,citationCount,hIndex,affiliations&limit=${limit}`;
    
    // Prepare headers
    const headers: HeadersInit = {
      "Accept": "application/json",
    };
    
    // Add API key to headers if available
    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }
    
    const response = await fetch(apiUrl, {
      headers,
      next: {
        revalidate: 60, // Cache for 60 seconds
      }
    });
    
    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorData = await response.json();
        errorDetail = JSON.stringify(errorData);
      } catch {
        errorDetail = "Could not parse error response";
      }
      
      throw new Error(`Semantic Scholar API error: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    const data = await response.json();
    
    // Format the response to match our expected format
    const processed = {
      authors: data.data?.map((author: {
        authorId: string;
        name?: string;
        url?: string;
        paperCount?: number;
        citationCount?: number;
        hIndex?: number;
        affiliations?: string[];
      }) => ({
        authorId: author.authorId,
        name: author.name || "",
        url: author.url || `https://www.semanticscholar.org/author/${author.authorId}`,
        paperCount: author.paperCount || 0,
        citationCount: author.citationCount || 0,
        hIndex: author.hIndex || 0,
        aliases: [], // Set as empty array since the field is not supported
        affiliations: author.affiliations || [],
      })) || [],
      next: data.next,
      offset: data.offset,
      total: data.total,
    };
    
    return NextResponse.json(processed);
  } catch (error) {
    console.error("Error searching for authors:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search for authors" },
      { status: 500 }
    );
  }
}