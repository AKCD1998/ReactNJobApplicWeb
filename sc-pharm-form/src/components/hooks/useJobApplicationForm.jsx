import { useEffect, useMemo, useState } from "react";
import fileToDataUrl from "../utils/fileToDataUrl";
import { INITIAL_FORM, SALES_DEFAULTS, PHARM_DEFAULTS } from "../constants/formDefaults";
import { SUBMIT_URL } from "../constants/options";
import validateForm from "../utils/validateFrom";
import buildPayload from "../utils/buildPayload";
import { getReferenceData } from "../constants/options";

export default function useJobApplicationForm() {
  const [isDark, setIsDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [referenceStep, setReferenceStep] = useState("");
  const [branchUnlocked, setBranchUnlocked] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    if (isDark) document.body.setAttribute("data-theme", "dark");
    else document.body.removeAttribute("data-theme");
  }, [isDark]);

  const flags = useMemo(() => {
    const showReference = !!referenceStep && !branchUnlocked;
    const showSalesBranch = form.positionApplied === "พนักงานขายหน้าร้าน" && branchUnlocked;
    const showPharmBranch = form.positionApplied === "เภสัชกร" && branchUnlocked;
    return { showReference, showSalesBranch, showPharmBranch };
  }, [referenceStep, branchUnlocked, form.positionApplied]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }

  function onPositionChange(value) {
    setBranchUnlocked(false);
    setStatus("");
    setReferenceStep(value === "พนักงานขายหน้าร้าน" ? "sales" : "");
    setForm(p => ({
      ...p,
      positionApplied: value,
      pharmacistType: value === "เภสัชกร" ? p.pharmacistType : "",
      ...SALES_DEFAULTS,
      ...(value === "พนักงานขายหน้าร้าน" ? {} : PHARM_DEFAULTS),
    }));
  }

  function onPharmacistTypeChange(value) {
    setBranchUnlocked(false);
    setStatus("");
    setReferenceStep(value === "เภสัชกรฟูลไทม์" ? "pharm-full" : "pharm-part");
    setForm(p => ({ ...p,
      pharmacistType: value,
       ...PHARM_DEFAULTS,
      }));
  }

  async function onFileChange(e, branch) {
    const file = e.target.files?.[0];

    if (!file) {
      setForm(p =>
        branch === "sales"
          ? { ...p, resumeFileNameSales: "", resumeFileDataSales: "", resumeFileMimeSales: "" }
          : { ...p, resumeFileNamePharmacist: "", resumeFileDataPharmacist: "", resumeFileMimePharmacist: "" }
      );
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setForm(p =>
      branch === "sales"
        ? { ...p, resumeFileNameSales: file.name, resumeFileDataSales: dataUrl, resumeFileMimeSales: file.type }
        : { ...p, resumeFileNamePharmacist: file.name, resumeFileDataPharmacist: dataUrl, resumeFileMimePharmacist: file.type }
    );
  }

  async function onSubmit(e) {
    e.preventDefault();

    const error = validateForm(form, { referenceStep, branchUnlocked });
    if (error) return setStatus(error);

    setStatus("");
    setIsSubmitting(true);

    const payload = buildPayload(form);

    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Submission failed");

      setStatus("ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณที่สมัครงานกับเรา");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      setStatus("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }
    const referenceData = getReferenceData(referenceStep);
    
    return {
      isDark, setIsDark,
      isSubmitting, setIsSubmitting,
      form, setForm,
      flags,
      referenceData,
      handlers: {
        onChange,
        onPositionChange,
        onPharmacistTypeChange,
        onFileChange,
        onSubmit,
        setBranchUnlocked },
    };
}
