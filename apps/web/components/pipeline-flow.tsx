const stages = [
  { number: "01", label: "Acquire", copy: "Licensed aerial and satellite imagery" },
  { number: "02", label: "Screen", copy: "Classification, detection, and segmentation" },
  { number: "03", label: "Estimate", copy: "Capacity and technical yield ranges" },
  { number: "04", label: "Validate", copy: "Human, installer, and field evidence" },
  { number: "05", label: "Publish", copy: "Aggregated, versioned open data" },
];

export function PipelineFlow() {
  return (
    <ol className="pipeline-flow">
      {stages.map((stage) => (
        <li key={stage.number}>
          <span>{stage.number}</span>
          <div>
            <strong>{stage.label}</strong>
            <small>{stage.copy}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}
