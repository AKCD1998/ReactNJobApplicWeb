import { useMemo, useState } from "react";
import { INITIAL_FORM, SALES_DEFAULTS, PHARM_DEFAULTS } from "../constants/formDefaults";
import { APPLICATION_SUBMIT_URL, LINE_NOTIFY_URL, getReferenceData } from "../constants/options";
import { resolveBranchLabel } from "../../config/branches";

const FORM_VERSION = "v1";
const ENABLE_LINE_NOTIFY =
  String(import.meta.env.VITE_ENABLE_LINE_NOTIFY || "").trim().toLowerCase() === "true";

function buildPayload(form, clientTimeOverride) {
  const isSales = form.positionApplied === "พนักงานขายหน้าร้าน";
  const isPharmacist = form.positionApplied === "เภสัชกร";
  const clientTime = clientTimeOverride || new Date().toISOString();

  return {
    clientTime,
    formVersion: FORM_VERSION,
    email: form.email.trim(),
    fullName: form.fullName.trim(),
    nickName: form.nickName.trim(),
    sex: form.sex,
    age: form.age.trim(),
    phone: form.phone.trim(),
    lineId: form.lineId.trim(),
    educationLevel: form.educationLevel,
    educationLevelOther:
      form.educationLevel === "อื่นๆโปรดระบุ" ? form.educationLevelOther.trim() : "",
    instituteName: form.instituteName.trim(),
    major: form.major.trim(),
    positionApplied: form.positionApplied,
    pharmacistType: isPharmacist ? form.pharmacistType : "",
    salesBranchPreference: isSales ? resolveBranchLabel(form.salesBranchPreference) : "",
    availableStartDateSales: isSales ? form.availableStartDateSales : "",
    referralSourceSales: isSales ? form.referralSourceSales : "",
    referralOtherSales:
      isSales && form.referralSourceSales === "อื่นๆ" ? form.referralOtherSales.trim() : "",
    availableStartDate: isSales ? form.availableStartDateSales : form.availableStartDatePharmacist,
    referralSource: isSales ? form.referralSourceSales : form.referralSourcePharmacist,
    referralOther: isSales ? form.referralOtherSales.trim() : form.referralOtherPharmacist.trim(),
    pharmacistBranchPreference: isPharmacist ? resolveBranchLabel(form.pharmacistBranchPreference) : "",
    licenseNumber: isPharmacist ? form.licenseNumber.trim() : "",
    pharmacySchool: isPharmacist ? form.pharmacySchool : "",
    pharmacySchoolOther:
      isPharmacist && form.pharmacySchool === "อื่นๆ" ? form.pharmacySchoolOther.trim() : "",
    availableStartDatePharmacist: isPharmacist ? form.availableStartDatePharmacist : "",
    referralSourcePharmacist: isPharmacist ? form.referralSourcePharmacist : "",
    referralOtherPharmacist:
      isPharmacist && form.referralSourcePharmacist === "อื่นๆ"
        ? form.referralOtherPharmacist.trim()
        : "",
  };
}

function validateRequiredFields(form) {
  const errors = {};
  const fieldOrder = [];

  const addError = (name, message, fieldId) => {
    if (!errors[name]) {
      errors[name] = { message, fieldId };
      fieldOrder.push(name);
    }
  };

  if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
    addError("email", "กรุณากรอกข้อมูล", "email");
  }
  if (!form.fullName.trim()) addError("fullName", "กรุณากรอกข้อมูล", "fullName");
  if (!form.sex) addError("sex", "กรุณากรอกข้อมูล", "sex-group");
  if (!form.age.trim() || Number.isNaN(Number(form.age))) {
    addError("age", "กรุณากรอกข้อมูล", "age");
  }
  const phoneDigits = String(form.phone || "").replace(/\D/g, "");
  if (!phoneDigits || !phoneDigits.startsWith("0") || phoneDigits.length !== 10) {
    addError("phone", "กรุณากรอกข้อมูล", "phone");
  }
  if (!form.educationLevel) addError("educationLevel", "กรุณากรอกข้อมูล", "educationLevel");
  if (!form.instituteName.trim()) addError("instituteName", "กรุณากรอกข้อมูล", "instituteName");
  if (!form.major.trim()) addError("major", "กรุณากรอกข้อมูล", "major");
  if (!form.positionApplied) addError("positionApplied", "กรุณากรอกข้อมูล", "positionApplied-group");

  if (form.positionApplied === "เภสัชกร") {
    if (!form.pharmacistType) addError("pharmacistType", "กรุณากรอกข้อมูล", "pharmacistType-group");
    if (!form.pharmacistBranchPreference) {
      addError("pharmacistBranchPreference", "กรุณากรอกข้อมูล", "pharmacistBranchPreference-group");
    }
    if (!form.licenseNumber.trim()) addError("licenseNumber", "กรุณากรอกข้อมูล", "licenseNumber");
    if (!form.pharmacySchool) addError("pharmacySchool", "กรุณากรอกข้อมูล", "pharmacySchool");
    if (!form.availableStartDatePharmacist) {
      addError("availableStartDatePharmacist", "กรุณากรอกข้อมูล", "availableStartDatePharmacist");
    }
    if (!form.referralSourcePharmacist) {
      addError("referralSourcePharmacist", "กรุณากรอกข้อมูล", "referralSourcePharmacist-group");
    }
    if (form.referralSourcePharmacist === "อื่นๆ" && !form.referralOtherPharmacist.trim()) {
      addError("referralOtherPharmacist", "กรุณากรอกข้อมูล", "referralOtherPharmacist");
    }
  }

  if (form.positionApplied === "พนักงานขายหน้าร้าน") {
    if (!form.availableStartDateSales) {
      addError("availableStartDateSales", "กรุณากรอกข้อมูล", "availableStartDateSales");
    }
    if (!form.referralSourceSales) {
      addError("referralSourceSales", "กรุณากรอกข้อมูล", "referralSourceSales-group");
    }
    if (form.referralSourceSales === "อื่นๆ" && !form.referralOtherSales.trim()) {
      addError("referralOtherSales", "กรุณากรอกข้อมูล", "referralOtherSales");
    }
  }

  const firstKey = fieldOrder[0];
  const firstInvalidFieldId = firstKey ? errors[firstKey].fieldId : null;
  return { isValid: fieldOrder.length === 0, errors, firstInvalidFieldId };
}

function logPayloadDiagnostics(payload, errors) {
  console.group("Job Application Payload");
  console.log("Meta", { clientTime: payload.clientTime, formVersion: payload.formVersion });

  console.group("Basic Info");
  console.table({
    email: payload.email,
    fullName: payload.fullName,
    nickName: payload.nickName,
    sex: payload.sex,
    age: payload.age,
    phone: payload.phone,
    lineId: payload.lineId,
  });
  console.groupEnd();

  console.group("Education");
  console.table({
    educationLevel: payload.educationLevel,
    educationLevelOther: payload.educationLevelOther,
    instituteName: payload.instituteName,
    major: payload.major,
  });
  console.groupEnd();

  console.group("Position");
  console.table({
    positionApplied: payload.positionApplied,
    pharmacistType: payload.pharmacistType,
  });
  console.groupEnd();

  console.group("Sales");
  console.table({
    salesBranchPreference: payload.salesBranchPreference,
    availableStartDateSales: payload.availableStartDateSales,
    referralSourceSales: payload.referralSourceSales,
    referralOtherSales: payload.referralOtherSales,
  });
  console.groupEnd();

  console.group("Pharmacist");
  console.table({
    pharmacistBranchPreference: payload.pharmacistBranchPreference,
    licenseNumber: payload.licenseNumber,
    pharmacySchool: payload.pharmacySchool,
    pharmacySchoolOther: payload.pharmacySchoolOther,
    availableStartDatePharmacist: payload.availableStartDatePharmacist,
    referralSourcePharmacist: payload.referralSourcePharmacist,
    referralOtherPharmacist: payload.referralOtherPharmacist,
  });
  console.groupEnd();

  const errorKeys = Object.keys(errors || {});
  if (errorKeys.length) {
    console.warn("Missing required fields:", errorKeys);
  }

  console.groupEnd();
}

export default function useJobApplicationForm() {
  const [isDark, setIsDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [submitResult, setSubmitResult] = useState("");
  const [lineNotifyStatus, setLineNotifyStatus] = useState("idle");
  const [lineNotifyError, setLineNotifyError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const flags = useMemo(() => {
    const showSalesBranch = form.positionApplied === "พนักงานขายหน้าร้าน";
    const showPharmBranch = form.positionApplied === "เภสัชกร";
    return { showSalesBranch, showPharmBranch };
  }, [form.positionApplied]);

  const requiredValidation = useMemo(() => validateRequiredFields(form), [form]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function onPositionChange(value) {
    setStatus("");
    setErrors(prev => {
      const next = { ...prev };
      delete next.positionApplied;
      delete next.pharmacistType;
      delete next.availableStartDateSales;
      delete next.referralSourceSales;
      delete next.referralOtherSales;
      delete next.availableStartDatePharmacist;
      delete next.referralSourcePharmacist;
      delete next.referralOtherPharmacist;
      delete next.pharmacistBranchPreference;
      delete next.licenseNumber;
      delete next.pharmacySchool;
      return next;
    });
    setForm(p => ({
      ...p,
      positionApplied: value,
      pharmacistType: value === "เภสัชกร" ? p.pharmacistType : "",
      ...SALES_DEFAULTS,
      ...(value === "พนักงานขายหน้าร้าน" ? {} : PHARM_DEFAULTS),
    }));
  }

  function onPharmacistTypeChange(value) {
    setStatus("");
    setErrors(prev => {
      const next = { ...prev };
      delete next.pharmacistType;
      return next;
    });
    setForm(p => ({ ...p,
      pharmacistType: value,
       ...PHARM_DEFAULTS,
      }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    const payload = buildPayload(form);
    logPayloadDiagnostics(payload, requiredValidation.errors);

    if (!requiredValidation.isValid) {
      setErrors(requiredValidation.errors);
      setStatus("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      setSubmitResult("");

      const targetId = requiredValidation.firstInvalidFieldId;
      if (targetId) {
        requestAnimationFrame(() => {
          const target = document.getElementById(targetId);
          if (!target) return;
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = target.matches("input, select, textarea, button")
            ? target
            : target.querySelector("input, select, textarea, button");
          focusable?.focus();
        });
      }
      return;
    }

    setStatus("");
    setErrors({});
    setSubmitResult("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      const res = await fetch(APPLICATION_SUBMIT_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.gasOk) throw new Error(data?.error || "Submission failed");

      setStatus("ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณที่สมัครงานกับเรา");
      setSubmitResult("success");

      if (ENABLE_LINE_NOTIFY) {
        void (async () => {
          setLineNotifyStatus("sending");
          setLineNotifyError("");

          if (!LINE_NOTIFY_URL) {
            setLineNotifyStatus("error");
            setLineNotifyError("Missing VITE_LINE_NOTIFY_ENDPOINT");
            console.warn("[LINE Notify] Missing endpoint configuration.");
            return;
          }

          try {
            const notifyRes = await fetch(LINE_NOTIFY_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fullName: payload.fullName,
                positionApplied: payload.positionApplied,
                phone: payload.phone,
                email: payload.email,
                clientTime: payload.clientTime,
              }),
            });

            const notifyData = await notifyRes.json().catch(() => null);
            if (notifyRes.ok && notifyData?.ok) {
              setLineNotifyStatus("ok");
              return;
            }

            const errorMessage =
              notifyData?.error ||
              (notifyRes.ok ? "LINE notify returned ok=false" : `HTTP ${notifyRes.status}`);
            setLineNotifyStatus(notifyData?.skipped ? "skipped" : "error");
            setLineNotifyError(errorMessage);
            console.warn("[LINE Notify] failed (non-blocking):", {
              status: notifyRes.status,
              body: notifyData,
            });
          } catch (notifyError) {
            const errorMessage = notifyError?.message || String(notifyError);
            setLineNotifyStatus("error");
            setLineNotifyError(errorMessage);
            console.warn("[LINE Notify] request error (non-blocking):", notifyError);
          }
        })();
      }
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      setStatus("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
      setSubmitResult("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("");
    setSubmitResult("");
    setLineNotifyStatus("idle");
    setLineNotifyError("");
    setIsSubmitting(false);
  }
    const referenceStep = form.positionApplied === "พนักงานขายหน้าร้าน"
      ? "sales"
      : form.positionApplied === "เภสัชกร"
        ? (form.pharmacistType === "เภสัชกรฟูลไทม์"
          ? "pharm-full"
          : form.pharmacistType === "เภสัชกรพาร์ทไทม์"
            ? "pharm-part"
            : "")
        : "";
    const referenceData = getReferenceData(referenceStep);
    
    return {
      isDark, setIsDark,
      isSubmitting, setIsSubmitting,
      form, setForm,
      status,
      submitResult,
      lineNotify: {
        enabled: ENABLE_LINE_NOTIFY,
        status: lineNotifyStatus,
        error: lineNotifyError,
      },
      errors,
      flags,
      referenceData,
    handlers: {
      onChange,
      onPositionChange,
      onPharmacistTypeChange,
      onSubmit,
      resetForm },
    };
}
