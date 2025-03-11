import { NextRequest, NextResponse } from "next/server";

// The recommendations API has a different base URL than the main graph API
const API_BASE_URL = "https://api.semanticscholar.org/recommendations/v1";
const API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { positivePaperIds, negativePaperIds, limit = 10, fields } = body;
    
    if (!positivePaperIds || !Array.isArray(positivePaperIds) || positivePaperIds.length === 0) {
      return NextResponse.json(
        { error: "positivePaperIds array is required and must not be empty" },
        { status: 400 }
      );
    }
    
    // Default fields if not provided
    const fieldsToFetch = fields || "paperId,title,abstract,year,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationVenue,authors,url,externalIds";
    
    // Construct the request body
    const requestBody = {
      positivePaperIds,
      negativePaperIds: negativePaperIds || [],
    };
    
    // Log the request we're making for debugging
    console.log(`Making recommendation request with ${positivePaperIds.length} positive papers and ${negativePaperIds?.length || 0} negative papers`);
    console.log(`API Key available: ${!!API_KEY}`);
    
    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Add API key to headers if available
    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }
    
    // The recommendations API uses a different URL structure
    const response = await fetch(
      `${API_BASE_URL}/papers?fields=${encodeURIComponent(fieldsToFetch)}&limit=${limit}`, 
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
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
      papers: data.recommendedPapers || data.papers || [], // Adapt to the actual response format
    };
    
    return NextResponse.json(processed);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
} 