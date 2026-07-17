"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, Copy, Download, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { buildContractWithAgenticStark, EXAMPLE_INSTRUCTIONS, getContractTypeSuggestions } from "@/services/contractBuilder";

interface ContractBuilderBlockProps {
  onContractGenerated?: (contractCode: string, contractName: string, contractType: string) => void;
  onError?: (error: string) => void;
}

export default function ContractBuilderBlock({ 
  onContractGenerated, 
  onError 
}: ContractBuilderBlockProps) {
  const [instructions, setInstructions] = useState("");
  const [contractType, setContractType] = useState("Cairo");
  const [contractName, setContractName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuildContract = async () => {
    if (!instructions.trim()) {
      setError("Please provide contract instructions");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await buildContractWithAgenticStark({
        instructions: instructions.trim(),
        contractType: contractType as "Cairo" | "Solidity" | "Auto-detect",
        contractName: contractName || "GeneratedContract",
      });

      if (response.success) {
        setResult(response);
        onContractGenerated?.(response.contractCode, response.contractName, response.contractType);
      } else {
        setError(response.error || "Failed to build contract");
        onError?.(response.error || "Failed to build contract");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleSelect = (exampleKey: keyof typeof EXAMPLE_INSTRUCTIONS) => {
    setInstructions(EXAMPLE_INSTRUCTIONS[exampleKey]);
    const suggestions = getContractTypeSuggestions(EXAMPLE_INSTRUCTIONS[exampleKey]);
    if (suggestions.length === 1) {
      setContractType(suggestions[0]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadContract = (code: string, name: string, type: string) => {
    const extension = type === "Cairo" ? "cairo" : "sol";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Build Contract with Agentic Stark
          </CardTitle>
          <CardDescription>
            Generate smart contract code using Agentic Stark AI with natural language instructions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contract Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Contract Instructions</label>
            <Textarea
              placeholder="Create a minimal counter-like contract with increment/decrement and a getter."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-gray-500">
              Describe what you want your contract to do in natural language
            </div>
          </div>

          {/* Example Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Examples</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EXAMPLE_INSTRUCTIONS).map(([key, example]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleSelect(key as keyof typeof EXAMPLE_INSTRUCTIONS)}
                  className="text-xs"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Contract Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Type</label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo (Starknet)</SelectItem>
                  <SelectItem value="Solidity">Solidity (Ethereum)</SelectItem>
                  <SelectItem value="Auto-detect">Auto-detect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Name (Optional)</label>
              <Input
                placeholder="MyContract"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>
          </div>

          {/* Build Button */}
          <Button
            onClick={handleBuildContract}
            disabled={isLoading || !instructions.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Building Contract...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Build Contract
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Generated Contract
            </CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{result.contractType}</Badge>
                <span>{result.contractName}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contract Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Contract Code</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.contractCode)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadContract(result.contractCode, result.contractName, result.contractType)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{result.contractCode}</pre>
              </div>
            </div>

            {/* Explanation */}
            {result.explanation && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Explanation</label>
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  {result.explanation}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
