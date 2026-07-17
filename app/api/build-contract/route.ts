import { NextRequest, NextResponse } from "next/server";
import { buildContractWithAgenticStark, validateContractInstructions } from "@/services/contractBuilder";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Build Contract API called");
    
    const body = await request.json();
    const { instructions, contractType, contractName } = body;

    // Validate the request
    if (!instructions) {
      return NextResponse.json(
        { success: false, error: "Contract instructions are required" },
        { status: 400 }
      );
    }

    // Validate instructions
    const validation = validateContractInstructions(instructions);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    console.log("📝 Contract request:", {
      instructions: instructions.substring(0, 100) + "...",
      contractType,
      contractName,
    });

    // Build contract with Agentic Stark
    const result = await buildContractWithAgenticStark({
      instructions,
      contractType: contractType || "Cairo",
      contractName: contractName || "GeneratedContract",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log("✅ Contract built successfully");

    return NextResponse.json({
      success: true,
      contractCode: result.contractCode,
      contractName: result.contractName,
      contractType: result.contractType,
      explanation: result.explanation,
    });

  } catch (error) {
    console.error("❌ Build Contract API error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Contract Builder API",
    endpoints: {
      POST: "/api/build-contract",
      description: "Build contract with Agentic Stark",
      parameters: {
        instructions: "string (required) - Natural language instructions for the contract",
        contractType: "string (optional) - Cairo, Solidity, or Auto-detect",
        contractName: "string (optional) - Name for the generated contract",
      },
    },
  });
}
