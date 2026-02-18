import {
  PHARM_POSITION_APPLIED,
  POSITION_TYPES,
  getEnabledPositionFromForm,
  hasEnabledPositionType,
  isPositionSelectionMissing,
} from "../../config/positions";

export default function validateForm(form) {
  const activePositionType = getEnabledPositionFromForm(form)?.type || "";

  if (!form.email.trim()) return "กรุณากรอกอีเมล";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (!form.fullName.trim()) return "กรุณากรอกชื่อ-นามสกุล";
  if (!form.age.trim() || Number.isNaN(Number(form.age))) return "กรุณากรอกอายุเป็นตัวเลข";
  const phoneDigits = String(form.phone || "").replace(/\D/g, "");
  if (!phoneDigits) return "กรุณากรอกเบอร์โทร";
  if (!phoneDigits.startsWith("0")) return "เบอร์โทรต้องขึ้นต้นด้วย 0";
  if (phoneDigits.length !== 10) return "เบอร์โทรต้องมี 10 หลัก";
  if (!form.instituteName.trim()) return "กรุณากรอกชื่อสถาบัน";
  if (!form.major.trim()) return "กรุณากรอกสาขาวิชา";
  if (isPositionSelectionMissing(form)) return "กรุณาเลือกตำแหน่งที่สมัคร";
  if (
    form.positionApplied === PHARM_POSITION_APPLIED &&
    hasEnabledPositionType(POSITION_TYPES.PHARMACIST) &&
    !form.pharmacistType
  ) {
    return "กรุณาเลือกประเภทเภสัชกร";
  }

  if (activePositionType === POSITION_TYPES.SALES) {
    if (!form.availableStartDateSales) return "กรุณาเลือกวันที่เริ่มงานได้";
    if (!form.referralSourceSales) return "กรุณาเลือกช่องทางที่รู้จักเรา";
    if (form.referralSourceSales === "อื่นๆ" && !form.referralOtherSales.trim()) {
      return "กรุณาระบุช่องทางอื่นๆ";
    }
  }

  if (activePositionType === POSITION_TYPES.MARKETING) {
    if (!form.availableStartDateMarketing) return "กรุณาเลือกวันที่เริ่มงานได้";
    if (!form.referralSourceMarketing) return "กรุณาเลือกช่องทางที่รู้จักเรา";
    if (form.referralSourceMarketing === "อื่นๆ" && !form.referralOtherMarketing.trim()) {
      return "กรุณาระบุช่องทางอื่นๆ";
    }
  }

  if (activePositionType === POSITION_TYPES.PHARMACIST) {
    if (!form.availableStartDatePharmacist) return "กรุณาเลือกวันที่เริ่มงานได้";
    if (!form.referralSourcePharmacist) return "กรุณาเลือกช่องทางที่รู้จักเรา";
    if (form.referralSourcePharmacist === "อื่นๆ" && !form.referralOtherPharmacist.trim()) {
      return "กรุณาระบุช่องทางอื่นๆ";
    }
  }

  return "";
}
