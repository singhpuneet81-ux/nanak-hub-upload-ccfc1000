import React from "react";
import { Check, FileText, PenLine } from "lucide-react";

interface DeclarationBoxProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  signature: string;
  onSignatureChange: (signature: string) => void;
}

export const DeclarationBox: React.FC<DeclarationBoxProps> = ({
  accepted,
  onAcceptChange,
  signature,
  onSignatureChange,
}) => {
  const declarationItems = [
    "All information provided in this application is true and correct",
    "I have the authority to register this business name",
    "I understand that providing false or misleading information is a serious offence",
    "I agree to comply with all ASIC requirements and regulations",
    "I have read and agree to the Terms and Conditions",
  ];

  return (
    <div className="space-y-4">
      <div className="section-header">
        <FileText size={16} />
        <span>Declaration & Signature</span>
      </div>

      <div className="declaration-box">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <FileText size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Applicant Declaration</h3>
            <p className="text-sm text-muted-foreground mt-0.5">I declare that:</p>
          </div>
        </div>

        <ul className="space-y-2 ml-11 mb-5">
          {declarationItems.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-muted-foreground">•</span>
              {item}
            </li>
          ))}
        </ul>

        <label className="flex items-start gap-3 cursor-pointer ml-11">
          <div className="mt-0.5">
            <div
              className={`checkbox-custom ${accepted ? "checkbox-custom-checked" : ""}`}
              onClick={() => onAcceptChange(!accepted)}
            >
              {accepted && <Check size={14} className="text-white" />}
            </div>
          </div>
          <span className="text-sm text-foreground">
            I accept the declaration and agree to the terms and conditions
            <span className="text-destructive ml-0.5">*</span>
          </span>
        </label>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 mb-2">
          <PenLine size={14} className="text-muted-foreground" />
          <label className="form-label !mb-0">
            Your Signature
            <span className="text-destructive ml-0.5">*</span>
          </label>
        </div>
        <input
          type="text"
          value={signature}
          onChange={(e) => onSignatureChange(e.target.value)}
          placeholder="Type your full name"
          className="soft-input font-serif italic text-lg"
          style={{ fontFamily: "'Brush Script MT', cursive, serif" }}
        />
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <span>🔒</span>
          By typing your name, you are providing a legal electronic signature
        </p>
      </div>
    </div>
  );
};
