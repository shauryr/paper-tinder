import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.semanticscholar.org/graph/v1";
const API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authorId = searchParams.get("authorId");
    const limit = searchParams.get("limit") || "100";
    const fields = searchParams.get("fields") || "paperId,title,abstract,year,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationVenue,authors,url,externalIds";
    
    if (!authorId) {
      return NextResponse.json(
        { error: "authorId parameter is required" },
        { status: 400 }
      );
    }
    
    // Log the request we're making for debugging
    console.log(`Making request to: ${API_BASE_URL}/author/${authorId}/papers?fields=${encodeURIComponent(fields)}&limit=${limit}`);

    // Prepare headers
    const headers: HeadersInit = {
      "Accept": "application/json",
    };
    
    // Add API key to headers if available
    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }

    const response = await fetch(
      `${API_BASE_URL}/author/${authorId}/papers?fields=${encodeURIComponent(fields)}&limit=${limit}`, 
      {
        headers,
        next: {
          revalidate: 60, // Cache for 60 seconds
        }
      }
    );

    // Log response status for debugging
    console.log(`Semantic Scholar API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error details from response body
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
    
    // Format the response to match expected format
    const processed = {
      ...data,
      papers: data.data || [], // Adapt to the actual response format
    };
    
    return NextResponse.json(processed);
  } catch (error) {
    console.error("Error fetching paper details:", error);
    return NextResponse.json({ error: "Failed to fetch paper details" }, { status: 500 });
  }
}