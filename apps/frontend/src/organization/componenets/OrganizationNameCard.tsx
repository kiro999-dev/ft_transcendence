import { useState ,useEffect} from "react";
import { apiFetch } from "../../lib/api";
import toast from "react-hot-toast";
export const OrganizationNameCard = ({
  name,
  canEdit,
  accessToken,
  onSaved,
}: {
  name: string;
  canEdit: boolean;
  accessToken: string | null;
  onSaved: (name: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => setValue(name), [name]);

  const startEdit = () => {
    setValue(name);
    setError(undefined);
    setEditing(true);
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setError("Agency name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 150) {
      setError("Agency name must be at most 150 characters");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch("/organization/us", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationName: trimmed }),
      });

      if (!res.ok) {
        toast.error("Could not update the agency name");
        return;
      }

      onSaved(trimmed);
      setEditing(false);
      toast.success("Agency name updated");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">Agency name</h2>
      <p className="mt-1 text-sm text-slate-600">
        This is the name your team and clients see.
      </p>

      <div className="mt-5">
        {editing ? (
          <div>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={`w-full max-w-sm rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-600/20"
              }`}
            />
            {error && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-slate-900">{name}</p>
            {canEdit && (
              <button
                onClick={startEdit}
                className="text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};