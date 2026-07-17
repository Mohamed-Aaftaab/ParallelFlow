import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockType } from "@/types";

interface BlockInputProps {
  input: NonNullable<BlockType["inputs"]>[number];
  value: string;
  onChange: (value: string) => void;
}

const BlockInput: React.FC<BlockInputProps> = ({ input, value, onChange }) => {
  if (input.type === "select") {
    return (
      <Select value={value || input.defaultValue} onValueChange={onChange}>
        <SelectTrigger className="w-full border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <SelectValue placeholder={input.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {input.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (input.type === "textarea") {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={input.placeholder}
        className="w-full border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] font-mono text-xs"
        rows={3}
        disabled
      />
    );
  }

  if (input.type === "file") {
    return (
      <Input
        type="file"
        accept={input.accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onChange(file.name);
          }
        }}
        className="w-full border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      />
    );
  }

  return (
    <div className="relative">
      <Input
        type={input.type}
        value={value || input.defaultValue || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={input.placeholder}
        className="w-full border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      />
      {input.unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
          {input.unit}
        </span>
      )}
    </div>
  );
};

export default BlockInput;

