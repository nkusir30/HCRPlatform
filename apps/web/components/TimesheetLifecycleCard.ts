import { toast } from "sonner";
// TimesheetLifecycleCard: status-driven (DRAFT→ACCEPTED→APPROVED/DISAPPROVED).
// Replaces legacy 3-hidden-divs + native alert().
export function acceptTimesheet(publicId: string, totalsHash: string) {
  return fetch(`/api/v1/timesheets/${publicId}/accept`,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attested: true, totalsHash }) })
    .then(async r => { if (r.status === 409) throw new Error("Already accepted");
      if (!r.ok) throw new Error("Accept failed"); return r.json(); })
    .then(d => { toast.success("Thanks — we'll let you know when it's approved."); return d; })
    .catch(e => { toast.error(e.message); throw e; });
}
