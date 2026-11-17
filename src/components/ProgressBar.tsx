export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-gold transition-all duration-300" style={{ width: `${percent}%` }} />
    </div>
  );
}
