export const BRANCHES = [
  { id: "001", label: "สาขาตลาดแม่กลอง" },
  { id: "003", label: "สาขาวัดช่องลม" },
  { id: "004", label: "สาขาตลาดบางน้อย" },
  { id: "005", label: "สาขาถนนเอกชัยมหาชัย" },
];

const BRANCH_BY_ID = BRANCHES.reduce((acc, branch) => {
  acc[branch.id] = branch;
  return acc;
}, {});

// Edit these arrays to change which branches are recruiting this round.
export const pharmacistEnabled = ["005", "003"];
export const salesEnabled = ["004"];

export function getEnabledBranchIds(role) {
  if (role === "pharmacist") return [...pharmacistEnabled];
  if (role === "sales") return [...salesEnabled];
  return [];
}

export function getEnabledBranches(role) {
  const ids = getEnabledBranchIds(role);
  return ids.map((id) => BRANCH_BY_ID[id]).filter(Boolean);
}

export function resolveBranchLabel(value) {
  if (!value) return "";
  return BRANCH_BY_ID[value]?.label || value;
}
