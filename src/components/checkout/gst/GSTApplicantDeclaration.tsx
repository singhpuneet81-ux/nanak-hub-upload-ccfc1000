import React from "react";
import { FileText, Check, AlertTriangle } from "lucide-react";

interface GSTApplicantDeclarationProps {
  firstName: string;
  lastName: string;
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

export const GSTApplicantDeclaration: React.FC<GSTApplicantDeclarationProps> = ({
  firstName,
  lastName,
  accepted,
  onAcceptChange,
}) => {
  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Applicant";

  const declarationItems = [
    <>All information provided in this application is <strong>true and correct</strong> to the best of my knowledge.</>,
    <>I authorise <strong>Nanak Accountants & Associates</strong> to act as my registered tax agent in all matters relating to this GST registration.</>,
    <>I understand that Nanak Accountants will submit this application to the ATO on my behalf.</>,
    <>I understand that providing <strong>false or misleading information</strong> is a serious offence under Australian taxation law.</>,
  ];

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 md:p-6">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          <FileText size={18} className="text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">Applicant Declaration</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Required by the Australian Taxation Office (ATO)
          </p>
        </div>
      </div>

      {/* Declaration content */}
      <div className="bg-card border border-border rounded-lg p-4 mb-5">
        <p className="font-medium text-foreground mb-3">I declare that:</p>
        <ul className="space-y-3">
          {declarationItems.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-foreground">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} className="text-primary" />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Important notice */}
      <div className="bg-[hsl(45_93%_94%)] border border-[hsl(45_93%_70%)] rounded-lg p-4 mb-5">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-[hsl(45_93%_40%)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[hsl(45_93%_25%)]">Important Notice</p>
            <p className="text-xs text-[hsl(45_93%_35%)] mt-1">
              By signing and accepting this declaration, you confirm that you have read and understood all information provided above. This electronic signature has the same legal effect as a handwritten signature.
            </p>
          </div>
        </div>
      </div>

      {/* Checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="mt-0.5">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
              accepted
                ? "bg-primary border-primary"
                : "border-border bg-card hover:border-primary/50"
            }`}
            onClick={(e) => {
              e.preventDefault();
              onAcceptChange(!accepted);
            }}
          >
            {accepted && <Check size={14} className="text-white" />}
          </div>
        </div>
        <span className="text-sm text-foreground">
          <strong>I accept and agree to the above declaration</strong>
          <span className="text-destructive ml-0.5">*</span>
          <br />
          <span className="text-xs text-muted-foreground">
            By checking this box, I confirm that I have read, understood, and agree to all statements in this declaration
          </span>
        </span>
      </label>
    </div>
  );
};
