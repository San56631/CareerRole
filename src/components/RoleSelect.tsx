import { ROLE_GROUPS } from "@/lib/roles";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  includeEmpty?: boolean;
};

export default function RoleSelect({ value, onChange, className, includeEmpty }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        "border border-line rounded-card px-4 py-2 text-sm bg-bg text-textPrimary w-full"
      }
    >
      {includeEmpty && <option value="">Select a role</option>}
      {/* Keeps legacy values like "SDE" valid */}
      {value && !ROLE_GROUPS.some((g) => g.roles.includes(value)) && (
        <option value={value}>{value}</option>
      )}
      {ROLE_GROUPS.map((g) => (
        <optgroup key={g.group} label={g.group}>
          {g.roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
