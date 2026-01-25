export default function validateForm(form, { referenceStep, branchUnlocked }) {
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
    if (!form.positionApplied) return "กรุณาเลือกตำแหน่งที่สมัคร";
    if (form.positionApplied === "เภสัชกร" && !form.pharmacistType) {
      return "กรุณาเลือกประเภทเภสัชกร";
    }
    if (referenceStep && !branchUnlocked) return "กรุณาอ่านข้อมูลอ้างอิงและกดสมัครตำแหน่งนี้";

    if (form.positionApplied === "พนักงานขายหน้าร้าน") {
      if (!form.availableStartDateSales) return "กรุณาเลือกวันที่เริ่มงานได้";
      if (!form.referralSourceSales) return "กรุณาเลือกช่องทางที่รู้จักเรา";
      if (form.referralSourceSales === "อื่นๆ" && !form.referralOtherSales.trim()) {
        return "กรุณาระบุช่องทางอื่นๆ";
      }
    }

    if (form.positionApplied === "เภสัชกร") {
      if (!form.availableStartDatePharmacist) return "กรุณาเลือกวันที่เริ่มงานได้";
      if (!form.referralSourcePharmacist) return "กรุณาเลือกช่องทางที่รู้จักเรา";
      if (form.referralSourcePharmacist === "อื่นๆ" && !form.referralOtherPharmacist.trim()) {
        return "กรุณาระบุช่องทางอื่นๆ";
      }
    }

    return "";
  }
