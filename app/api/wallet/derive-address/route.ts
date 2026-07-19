import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";

export async function POST(request: NextRequest) {
  try {
    const { privateKey } = await request.json();

    if (!privateKey) {
      return NextResponse.json(
        { error: "Private key is required" },
        { status: 400 }
      );
    }

    // Validate private key format
    const cleanKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    if (cleanKey.length !== 66) {
      return NextResponse.json(
        { error: "Invalid private key format. Must be 32 bytes (64 hex characters + optional 0x prefix)" },
        { status: 400 }
      );
    }

    // Derive EVM account using viem
    const account = privateKeyToAccount(cleanKey as `0x${string}`);
    const address = account.address;

    // Address derived successfully — do not log sensitive data

    return NextResponse.json({
      success: true,
      address: address,
      // publicKey omitted — not needed by frontend and reduces sensitive data exposure
    });
  } catch (error: any) {
    console.error("❌ Error deriving EVM wallet address:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to derive wallet address",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
