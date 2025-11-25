import LineSummary from "../LineSummary";

export default function LineSummaryExample() {
  return (
    <div className="p-4 space-y-4">
      <LineSummary lines={["Northern", "Central"]} />
      <LineSummary lines={["Northern", "Piccadilly"]} />
      <LineSummary lines={["Northern"]} />
    </div>
  );
}
