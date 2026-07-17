import { LucideIcon } from "lucide-react";

export interface BlockType {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
  description: string;
  category: 
    | "wallet"
    | "import"
    | "validation"
    | "balance"
    | "approval"
    | "transfer"
    | "monitoring"
    | "reporting";
  technology: "Starknet" | "ChippyPay" | "CSV" | "Reporting";
  inputs?: {
    type: "number" | "text" | "address" | "select" | "file" | "textarea";
    label: string;
    placeholder?: string;
    options?: string[];
    required?: boolean;
    unit?: string;
    accept?: string;
    defaultValue?: string;
  }[];
  compatibleWith: string[];
  isLoop?: boolean;
}

export interface BlockValues {
  [key: string]: {
    [key: string]: string;
  };
}

export interface Recipient {
  address: string;
  amount: string;
  status?: "pending" | "processing" | "success" | "failed";
  txHash?: string;
}

export interface TransactionSummary {
  totalRecipients: number;
  successfulTransfers: number;
  failedTransfers: number;
  totalAmount: string;
  totalGasFees: string;
  timestamp: number;
}

export interface WorkflowState {
  isConnected: boolean;
  walletAddress?: string;
  recipients: Recipient[];
  balance?: string;
  tokenAddress?: string;
  approvalStatus?: boolean;
  summary?: TransactionSummary;
}

