export const POSITION_TYPES = {
  SALES: "sales",
  PHARMACIST: "pharmacist",
  MARKETING: "marketing",
};

export const POSITION_IDS = {
  SALES: "พนักงานขายหน้าร้าน",
  MARKETING: "พนักงานการตลาดออนไลน์ (Online Marketing Officer)",
  PHARM_FULL: "เภสัชกรฟูลไทม์",
  PHARM_PART: "เภสัชกรพาร์ทไทม์",
};

export const PHARM_POSITION_APPLIED = "เภสัชกร";

export const POSITIONS = [
  {
    id: POSITION_IDS.SALES,
    label: "พนักงานขายหน้าร้าน",
    enabled: true,
    type: POSITION_TYPES.SALES,
  },
  {
    id: POSITION_IDS.MARKETING,
    label: "พนักงานการตลาดออนไลน์ (Online Marketing Officer)",
    enabled: true,
    type: POSITION_TYPES.MARKETING,
  },
  {
    id: POSITION_IDS.PHARM_FULL,
    label: "เภสัชกรฟูลไทม์",
    enabled: true,
    type: POSITION_TYPES.PHARMACIST,
    note: "(เฉพาะผู้สำเร็จการศึกษา ปริญญาตรี เภสัชศาสตรบัณฑิต (ภ.บ.) เท่านั้น)",
  },
  {
    id: POSITION_IDS.PHARM_PART,
    label: "เภสัชกรพาร์ทไทม์",
    enabled: true,
    type: POSITION_TYPES.PHARMACIST,
    note: "(เฉพาะผู้สำเร็จการศึกษา ปริญญาตรี เภสัชศาสตรบัณฑิต (ภ.บ.) เท่านั้น)",
  },
];

const POSITION_BY_ID = POSITIONS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export function getEnabledPositions() {
  return POSITIONS.filter((item) => item.enabled);
}

export function hasEnabledPositions() {
  return getEnabledPositions().length > 0;
}

export function hasEnabledPositionType(type) {
  return getEnabledPositions().some((item) => item.type === type);
}

export function getPositionById(id) {
  if (!id) return null;
  return POSITION_BY_ID[id] || null;
}

export function getEnabledPositionById(id) {
  const position = getPositionById(id);
  return position?.enabled ? position : null;
}

export function getSelectedPositionId(form) {
  if (!form?.positionApplied) return "";
  if (form.positionApplied === PHARM_POSITION_APPLIED) {
    return form.pharmacistType || "";
  }
  return form.positionApplied;
}

export function getEnabledPositionFromForm(form) {
  const selectedId = getSelectedPositionId(form);
  return getEnabledPositionById(selectedId);
}

export function isPositionSelectionMissing(form) {
  if (!hasEnabledPositions()) return false;
  if (!form?.positionApplied) return true;

  if (form.positionApplied === PHARM_POSITION_APPLIED) {
    if (!hasEnabledPositionType(POSITION_TYPES.PHARMACIST)) return true;
    if (!form.pharmacistType) return false;
  }

  return !getEnabledPositionFromForm(form);
}

export function resolveSelectionToFormValues(selectedId) {
  const selected = getPositionById(selectedId);
  if (!selected) return null;

  if (selected.type === POSITION_TYPES.PHARMACIST) {
    return {
      positionApplied: PHARM_POSITION_APPLIED,
      pharmacistType: selected.id,
    };
  }

  return {
    positionApplied: selected.id,
    pharmacistType: "",
  };
}

export function getReferenceStepFromPosition(position) {
  if (!position) return "";

  if (position.type === POSITION_TYPES.SALES) return "sales";
  if (position.type === POSITION_TYPES.MARKETING) return "marketing";
  if (position.id === POSITION_IDS.PHARM_FULL) return "pharm-full";
  if (position.id === POSITION_IDS.PHARM_PART) return "pharm-part";

  return "";
}

export function getReferenceStepFromForm(form) {
  return getReferenceStepFromPosition(getEnabledPositionFromForm(form));
}
