import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.semanticscholar.org/graph/v1";
const API_KEY = "ntBvggeKiV43UDqpKXqRO2VSLJmI1Pt97u4Ewggv";

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

    const response = await fetch(
      `${API_BASE_URL}/author/${authorId}/papers?fields=${encodeURIComponent(fields)}&limit=${limit}`, 
      {
        headers: {
          "Accept": "application/json",
          "x-api-key": API_KEY,
        },
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
      } catch (e) {
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
    console.error("Error in author papers API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
} 