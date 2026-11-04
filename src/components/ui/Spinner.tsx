export function Spinner({ label }: { label?: string }) {
  return (
    <div className="loading-state">
      <div className="spinner" role="status" aria-label={label ?? "Cargando"} />
      {label ? <span className="ml-1">{label}</span> : null}
    </div>
  );
}
