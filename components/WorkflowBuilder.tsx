"use client";

import {
  getAvailableTechnologies,
  getBlocksByTechnology,
  blocks,
} from "@/constants/workflows";
import { Folder, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import WorkflowPiece from "./WorkflowPiece";
import WorkflowVisualizer from "./WorkflowVisualizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlockType, BlockValues } from "@/types";

const ScrollButtons: React.FC<{
  scrollRef: React.RefObject<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}> = ({ scrollRef, containerRef }) => {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current && containerRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowControls(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [scrollRef, containerRef]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!showControls) return null;

  return (
    <>
      <button
        onClick={() => scroll("left")}
        className={cn(
          "absolute left-2 top-1/2 -translate-y-1/2 z-10",
          "w-8 h-8 flex items-center justify-center",
          "bg-white border-2 border-black rounded-lg",
          "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
          "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
          "hover:translate-y-[-2px]",
          "transition-all duration-200"
        )}
      >
        ←
      </button>
      <button
        onClick={() => scroll("right")}
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 z-10",
          "w-8 h-8 flex items-center justify-center",
          "bg-white border-2 border-black rounded-lg",
          "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
          "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
          "hover:translate-y-[-2px]",
          "transition-all duration-200"
        )}
      >
        →
      </button>
    </>
  );
};

const ScrollableArea: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      <ScrollButtons scrollRef={scrollRef} containerRef={containerRef} />
      <ScrollArea
        className={cn("w-full whitespace-nowrap rounded-lg", className)}
      >
        <div ref={scrollRef} className="flex gap-6 px-12">
          {children}
        </div>
        <ScrollBar orientation="horizontal" className="bg-gray-200" />
      </ScrollArea>
    </div>
  );
};

const AvailablePieces: React.FC<{
  onDragStart: (block: BlockType) => () => void;
  chainBlocks: BlockType[];
}> = ({ onDragStart, chainBlocks }) => {
  const technologies = getAvailableTechnologies();

  return (
    <Card className="bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-black font-black text-2xl">
          Available Workflow Blocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={technologies[0]} className="w-full">
          <TabsList className="w-full flex gap-4 bg-transparent border-b-2 border-black p-0 h-auto pb-2 overflow-x-auto whitespace-nowrap">
            {technologies.map((tech) => (
              <TabsTrigger
                key={tech}
                value={tech}
                className={cn(
                  "border-2 border-black rounded-xl px-4 py-2 font-bold",
                  "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                  "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                  "hover:translate-y-[-2px]",
                  "transition-all duration-200",
                  "data-[state=active]:bg-purple-600 data-[state=active]:text-white",
                  "flex items-center gap-2"
                )}
              >
                <Folder size={16} />
                {tech}
              </TabsTrigger>
            ))}
          </TabsList>
          {technologies.map((tech) => (
            <TabsContent
              key={tech}
              value={tech}
              className="mt-6 border-2 border-black rounded-2xl p-4 bg-purple-50/20"
            >
              <ScrollableArea>
                <div className="flex gap-6">
                  {blocks
                    .filter((block) => block.technology === tech)
                    .map((block) => (
                      <div key={block.id} className="flex-shrink-0">
                        <WorkflowPiece
                          block={block}
                          onDragStart={onDragStart(block)}
                          chainBlocks={chainBlocks}
                        />
                      </div>
                    ))}
                </div>
              </ScrollableArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface WorkflowBuilderProps {
  wallet?: { address: string; type: string };
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ wallet }) => {
  const [chainBlocks, setChainBlocks] = useState<BlockType[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<BlockType | null>(null);
  const [blockValues, setBlockValues] = useState<BlockValues>({});
  const [initialized, setInitialized] = useState(false);

  // Auto-add Connect Wallet block if wallet is connected
  useEffect(() => {
    if (wallet && !initialized && chainBlocks.length === 0) {
      const connectWalletBlock = getBlocksByTechnology("Monad").find((b) => b.id === "connect_wallet");
      
      if (connectWalletBlock) {
        setChainBlocks([connectWalletBlock]);
        setBlockValues({
          "chain-0": {
            "Wallet Type": wallet.type === "Browser Extension" 
              ? "Browser Wallet Extension" 
              : wallet.type.includes("Private Key") 
              ? "Load with Private Key" 
              : "Browser Wallet Extension",
          },
        });
        setInitialized(true);
      }
    }
  }, [wallet, initialized, chainBlocks.length]);

  const resetChain = () => {
    setChainBlocks([]);
    setBlockValues({});
    setInitialized(false);
  };

  const handleValueChange = (blockId: string, key: string, value: string) => {
    setBlockValues((prev) => ({
      ...prev,
      [blockId]: {
        ...(prev[blockId] || {}),
        [key]: value,
      },
    }));
  };

  const removeBlock = (index: number) => {
    setChainBlocks((prev) => {
      const newBlocks = prev.filter((_, i) => i !== index);
      const newValues = { ...blockValues };
      for (let i = index; i < prev.length; i++) {
        delete newValues[`chain-${i}`];
      }
      setBlockValues(newValues);
      return newBlocks;
    });
  };

  const isCompatibleWithChain = (block: BlockType): boolean => {
    if (chainBlocks.length === 0) return true;
    const lastBlock = chainBlocks[chainBlocks.length - 1];
    return lastBlock.compatibleWith.includes(block.id);
  };

  const handleDragStart = (block: BlockType) => () => {
    setDraggedBlock(block);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedBlock && isCompatibleWithChain(draggedBlock)) {
      setChainBlocks((prev) => [...prev, draggedBlock]);
    }
    setDraggedBlock(null);
  };

  return (
    <div className="bg-[#FFFDFA] p-0">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="px-6 py-2.5 bg-purple-100 rounded-xl border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <span className="text-purple-900 font-extrabold flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected via {wallet?.type}
              </span>
            </div>
          </div>

          <p className="text-gray-600 font-bold text-lg">
            Drag and drop blocks to construct your Monad pipeline visually
          </p>
          
          {chainBlocks.length > 0 && (
            <div className="px-4 py-2 bg-purple-50 border-2 border-black rounded-xl inline-block shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <span className="text-purple-800 font-bold text-sm">
                💡 Next: drag "{chainBlocks[chainBlocks.length - 1].compatibleWith.map(id => {
                  const block = blocks.find(b => b.id === id);
                  return block?.name;
                }).join('" or "')}" to add step
              </span>
            </div>
          )}
        </div>

        <AvailablePieces onDragStart={handleDragStart} chainBlocks={chainBlocks} />

        <Card
          className="bg-white border-4 border-black rounded-3xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all duration-300"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-black font-black text-2xl">
              ParallelFlow Pipeline
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={resetChain}
              className={cn(
                "bg-white border-2 border-black rounded-xl p-4",
                "shadow-[2px_2px_0_0_rgba(0,0,0,1)]",
                "hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                "hover:translate-y-[-2px]",
                "transition-all duration-200",
                "text-black font-bold",
                chainBlocks.length === 0 && "opacity-50 cursor-not-allowed"
              )}
              disabled={chainBlocks.length === 0}
            >
              <RotateCcw size={16} className="mr-2" />
              Reset Pipeline
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border-4 border-black border-dashed rounded-2xl p-4 bg-gray-50/50">
              <ScrollableArea className="p-4">
                {chainBlocks.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500 font-extrabold w-full select-none">
                    Drag blocks here to construct a transaction pipeline
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    {chainBlocks.map((block, index) => (
                      <div
                        className="relative group transition-transform hover:translate-y-[-2px]"
                        key={`chain-${block.id}-${index}`}
                      >
                        <WorkflowPiece
                          block={block}
                          isChainPiece={true}
                          isCompatible={
                            index === 0 ||
                            chainBlocks[index - 1].compatibleWith.includes(
                              block.id
                            )
                          }
                          position={
                            index === 0
                              ? "first"
                              : index === chainBlocks.length - 1
                              ? "last"
                              : "middle"
                          }
                          values={blockValues[`chain-${index}`] || {}}
                          onValueChange={(key, value) =>
                              handleValueChange(`chain-${index}`, key, value)
                          }
                          onRemove={() => removeBlock(index)}
                          chainBlocks={chainBlocks}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollableArea>
            </div>
          </CardContent>
        </Card>

        {chainBlocks.length > 0 && (
          <WorkflowVisualizer
            blocks={chainBlocks}
            values={blockValues}
            wallet={wallet}
          />
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
