type StorefrontSetupChecklistProgressProps = Readonly<{
  completedCount: number;
  requiredCount: number;
  formatProgress: (values: { completed: number; required: number }) => string;
}>;

export function StorefrontSetupChecklistProgress({
  completedCount,
  requiredCount,
  formatProgress,
}: StorefrontSetupChecklistProgressProps) {
  return (
    <span className="tabular-nums text-mds-black-900">
      {formatProgress({ completed: completedCount, required: requiredCount })}
    </span>
  );
}
