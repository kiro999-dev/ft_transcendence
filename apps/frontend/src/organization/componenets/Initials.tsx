
export const Initials = ({
  firstName,
  lastName,
}: {
  firstName?: string;
  lastName?: string;
}) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
    {(firstName?.[0] ?? "") + (lastName?.[0] ?? "")}
  </div>
);