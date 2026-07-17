import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, AlertCircle, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import ExecuteButton from "./ExecuteButton";
import { BlockType, BlockValues } from "@/types";

interface Log {
  message: string;
  timestamp: Date;
  type: "info" | "success" | "error" | "warning";
}

interface WorkflowVisualizerProps {
  blocks: BlockType[];
  values: BlockValues;
  wallet?: { address: string; type: string };
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  blocks,
  values,
  wallet,
}) => {
  // Debug: Log wallet prop
  console.log("🐛 DEBUG: WorkflowVisualizer received wallet:", wallet);
  
  const [logs, setLogs] = useState<Log[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  const addLog = (
    message: string,
    type: "info" | "success" | "error" | "warning" = "info"
  ) => {
    setLogs((prev) => [...prev, { message, timestamp: new Date(), type }]);
  };

  const renderBlockValues = (blockIndex: number) => {
    const blockValue = values[`chain-${blockIndex}`];
    if (!blockValue) return null;

    return (
      <div className="mt-2 text-sm space-y-1">
        {Object.entries(blockValue).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="opacity-75">{key}:</span>
            <span className="font-mono text-xs">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const getFlowStatus = (
    blocks: BlockType[]
  ): {
    message: string;
    type: "warning" | "success" | "error";
  } => {
    const lastBlock = blocks[blocks.length - 1];

    if (lastBlock.id === "export_report") {
      return {
        message:
          "This workflow is complete and will export a transaction report at the end.",
        type: "success",
      };
    }

    if (lastBlock.id === "transaction_summary") {
      return {
        message:
          "This workflow will provide a detailed summary of all transactions.",
        type: "success",
      };
    }

    return {
      message:
        "Add more blocks to complete the workflow. Consider adding Transaction Summary and Export Report.",
      type: "warning",
    };
  };

  return (
    <div className="space-y-6">
      {blocks.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className={cn(
                "border-2 border-black rounded-xl",
                "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                "hover:translate-y-[-2px]",
                "transition-all duration-300"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{blocks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total operations in workflow
                </p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-2 border-black rounded-xl",
                "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                "hover:translate-y-[-2px]",
                "transition-all duration-300"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Execution Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border-2 border-black rounded-xl",
                "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
                "hover:translate-y-[-2px]",
                "transition-all duration-300"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {isExecuting ? "Running..." : "Ready"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isExecuting
                    ? `Step ${currentStep + 1} of ${blocks.length}`
                    : "Click Execute to start"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card
            className={cn(
              "border-2 border-black rounded-xl col-span-2",
              "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
              "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
              "hover:translate-y-[-2px]",
              "transition-all duration-300"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Execution Logs
              </CardTitle>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className={cn(
                    "px-2 py-1 text-xs",
                    "bg-white border-2 border-black rounded-lg",
                    "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                    "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                    "hover:translate-y-[-2px]",
                    "transition-all duration-200",
                    "flex items-center gap-1"
                  )}
                >
                  <RotateCcw size={12} />
                  Clear
                </button>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full rounded-lg border-2 border-black p-2">
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    No execution logs yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className={cn(
                          "font-mono text-xs p-2 rounded border-2 border-black",
                          "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                          log.type === "error" && "bg-red-50",
                          log.type === "success" && "bg-green-50",
                          log.type === "warning" && "bg-yellow-50",
                          log.type === "info" && "bg-blue-50"
                        )}
                      >
                        <span className="text-gray-500">
                          [{log.timestamp.toLocaleTimeString()}]
                        </span>{" "}
                        {log.message}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-2 border-black rounded-xl",
              "shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
              "hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
              "hover:translate-y-[-2px]",
              "transition-all duration-300"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Workflow Flow</CardTitle>
              <ExecuteButton
                blocks={blocks}
                values={values}
                onLog={addLog}
                onStepChange={setCurrentStep}
                onExecutionStart={() => {
                  setIsExecuting(true);
                  setProgress(0);
                }}
                onExecutionEnd={() => {
                  setIsExecuting(false);
                  setProgress(100);
                }}
                onProgress={setProgress}
                wallet={wallet}
              />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {blocks.map((block, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-4 rounded-lg bg-white border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex-1",
                        currentStep === index && "bg-blue-50 animate-pulse",
                        currentStep > index && "bg-green-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <block.icon size={16} className="text-black" />
                        <span className="font-medium">{block.name}</span>
                        {block.isLoop && (
                          <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded border border-indigo-300">
                            LOOP
                          </span>
                        )}
                      </div>
                      {renderBlockValues(index)}
                    </div>
                    {index < blocks.length - 1 && (
                      <ArrowRight className="text-black" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert
            className={cn(
              "border-2 border-black rounded-xl",
              "shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            )}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getFlowStatus(blocks).message}</AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
};

export default WorkflowVisualizer;

