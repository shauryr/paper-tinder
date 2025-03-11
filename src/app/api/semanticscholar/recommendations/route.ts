import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.semanticscholar.org/recommendations/v1";
const API_KEY = "ntBvggeKiV43UDqpKXqRO2VSLJmI1Pt97u4Ewggv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.positivePaperIds || !Array.isArray(body.positivePaperIds) || body.positivePaperIds.length === 0) {
      return NextResponse.json(
        { error: "positivePaperIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Ensure fields is properly formatted
    const fields = body.fields || "paperId,title,abstract,year,referenceCount,citationCount,influentialCitationCount,isOpenAccess,openAccessPdf,fieldsOfStudy,publicationVenue,authors,url,externalIds";
    
    // Prepare the request body in the format expected by the API
    // Always limit to 5 papers regardless of what was requested
    const requestBody = {
      positivePaperIds: body.positivePaperIds,
      // Include negative paper IDs if provided
      negativePaperIds: body.negativePaperIds && body.negativePaperIds.length > 0 ? body.negativePaperIds : undefined,
      limit: 5, // Hard-coded to 5 papers
    };

    // Log the request we're making for debugging
    console.log(`Making request to: ${API_BASE_URL}/papers?fields=${encodeURIComponent(fields)}`);
    console.log("Request body:", JSON.stringify(requestBody));

    const response = await fetch(
      `${API_BASE_URL}/papers?fields=${encodeURIComponent(fields)}`, 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "x-api-key": API_KEY,
        },
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
      } catch (e) {
        errorDetail = "Could not parse error response";
      }
      
      throw new Error(`Semantic Scholar API error: ${response.status} ${response.statusText} - ${errorDetail}`);
    }

    const data = await response.json();
    
    // Format the response to match expected format
    const processed = {
      ...data,
      papers: data.recommendedPapers || data || [], // Adapt to the actual response format
    };
    
    return NextResponse.json(processed);
  } catch (error) {
    console.error("Error in recommendations API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
} 