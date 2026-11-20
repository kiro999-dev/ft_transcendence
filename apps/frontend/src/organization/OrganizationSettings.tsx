import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../lib/api";
import type { Role, OrgMember } from "./organization_types";
import { Spinner } from "./componenets/Spinner";
import { OrganizationNameCard } from "./componenets/OrganizationNameCard";
import {AddMemberModal} from "./componenets/AddMemberModal"
import { TeamMembersCard } from "./componenets/TeamMembersCard";
import { Sidebar } from "../home/componenets/SideBar";

export const OrgSettings = () => {
  const { accessToken, user } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [orgRes, membersRes] = await Promise.all([
          apiFetch("/organization/us", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          apiFetch("/organization/users", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (orgRes.ok) {
          const orgData = await orgRes.json();
          setOrgName(orgData.organization_name);
        }

        if (membersRes.ok) {
          setMembers(await membersRes.json());
        }
      } catch {
        toast.error("Could not load organization settings");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) load();
  }, [accessToken]);

  const currentUserRole = user?.role as Role | undefined;
  const Username = `${user?.first_name} ${user?.last_name}`
  return (
    <div className="flex min-h-screen">
      <Sidebar userName={Username} userEmail={user.email}></Sidebar>
   
    <div className="min-h-screen bg-white px-4 py-12 flex-2">
      
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Organization settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your agency's name and team.
        </p>

        {loading ? (
          <Spinner />
        ) : (
          
          <div className="mt-8">

            <OrganizationNameCard
              name={orgName}
              canEdit={currentUserRole === "owner"}
              accessToken={accessToken}
              onSaved={setOrgName}
            />

            <TeamMembersCard
              members={members}
              currentUserId={user?.id}
              currentUserRole={currentUserRole}
              accessToken={accessToken}
              onAddClick={() => setShowAddModal(true)}
              onRemoved={(id) =>
                setMembers((prev) => prev.filter((m) => m.id !== id))
              }
              onRoleChanged={(id, role) =>
                setMembers((prev) =>
                  prev.map((m) => (m.id === id ? { ...m, role } : m)),
                )
              }
            />
          </div>
        )}
      </div>

      {showAddModal && (
        <AddMemberModal
          accessToken={accessToken}
          onClose={() => setShowAddModal(false)}
          onAdded={(member) => setMembers((prev) => [...prev, member])}
        />
      )}
    </div>
    </div>
  );
};
