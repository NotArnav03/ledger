export default function Blink({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      {label ? (
        <span className="small-caps" style={{ fontSize: 10 }}>
          {label}
        </span>
      ) : null}
      <span className="blink" aria-label="loading" />
    </span>
  );
}
