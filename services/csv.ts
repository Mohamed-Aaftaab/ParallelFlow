import Papa from "papaparse";
import { Recipient } from "@/types";

export interface CSVRow {
  address: string;
  amount: string;
}

export const parseCSV = (file: File): Promise<Recipient[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const recipients: Recipient[] = results.data.map((row: any) => ({
            address: row.address?.trim() || "",
            amount: row.amount?.trim() || "0",
            status: "pending" as const,
          }));

          // Validate that we have required fields
          const isValid = recipients.every(
            (r) => r.address && r.amount && parseFloat(r.amount) > 0
          );

          if (!isValid) {
            reject(
              new Error(
                "Invalid CSV format. Ensure each row has 'address' and 'amount' columns."
              )
            );
            return;
          }

          resolve(recipients);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

export const generateSampleCSV = (): string => {
  const sampleData = `address,amount
0x0742d3e5cfe8b4e8e3a7b9c8f5e4d3c2b1a0f9e8d7c6b5a49384756e8a,100
0x0843e4f6dgf9c5f9f4b8cab9g6f5e4d3c2b1b0gaf9e8d7c6b5b49384756f9b,200
0x0944f5g7ehgad6gag5c9dbaah7g6f5e4d3c2c1hbgafae9e8d7d6c5c49384757gac,150`;
  
  return sampleData;
};

export const downloadCSV = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportTransactionReport = (
  recipients: Recipient[],
  format: "CSV" | "JSON" | "PDF",
  filename: string
): void => {
  if (format === "CSV") {
    const csvData = Papa.unparse(recipients);
    downloadCSV(csvData, `${filename}.csv`);
  } else if (format === "JSON") {
    const jsonData = JSON.stringify(recipients, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } else if (format === "PDF") {
    // PDF generation would require a library like jsPDF
    // For now, we'll just download as JSON
    console.warn("PDF export not implemented, falling back to JSON");
    exportTransactionReport(recipients, "JSON", filename);
  }
};

