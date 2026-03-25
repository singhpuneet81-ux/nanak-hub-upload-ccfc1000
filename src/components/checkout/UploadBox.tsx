import React, { useCallback, useState } from "react";
import { Upload, Check, FileText } from "lucide-react";

interface UploadBoxProps {
  label?: string;
  optional?: boolean;
  accept?: string;
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
}

export const UploadBox: React.FC<UploadBoxProps> = ({
  label = "Identification",
  optional = true,
  accept = "image/*,.pdf",
  onFileSelect,
  selectedFile,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  
  const file = selectedFile ?? internalFile;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setInternalFile(droppedFile);
      onFileSelect?.(droppedFile);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setInternalFile(selectedFile);
      onFileSelect?.(selectedFile);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    document.getElementById("file-upload-input")?.click();
  }, []);

  return (
    <div className="w-full">
      <div className="section-header">
        <FileText size={16} />
        <span>
          {label}
          {optional && <span className="text-muted-foreground font-normal ml-1">(Optional)</span>}
        </span>
      </div>
      
      <div
        className={`upload-box ${isDragging ? "border-primary bg-primary/5" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          id="file-upload-input"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        {file ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--success-light))] flex items-center justify-center">
              <Check className="text-[hsl(var(--success))]" size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary">
                ✓ {file.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click or drag to replace
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="text-muted-foreground" size={22} />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click or drag to replace
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
