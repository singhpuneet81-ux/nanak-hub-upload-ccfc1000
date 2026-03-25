export const GSTStepper = ({ currentStep, onStepClick }: any) => {
  const steps = ["Your Details", "Package", "Review & Pay"];
  return (
    <div className="flex justify-center gap-6 py-4">
      {steps.map((s, i) => (
        <button key={i} onClick={()=>onStepClick(i+1)}
          className={currentStep===i+1?"font-bold":"text-muted-foreground"}>
          {i+1}. {s}
        </button>
      ))}
    </div>
  );
};