import { initials } from "./leadUtils";

export function Avatar({ name }: { name: string }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-light text-sm font-bold text-primary">
      {initials(name)}
    </div>
  );
}
