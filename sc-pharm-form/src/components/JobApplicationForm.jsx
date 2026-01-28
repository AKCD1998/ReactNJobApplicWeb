import { useEffect, useMemo, useRef, useState } from "react";
import useJobApplicationForm from "./hooks/useJobApplicationForm";
import { SCHOOL_OPTIONS } from "./constants/options";
import BasicInfoSection from "./sections/BasicInfoSection";
import HeaderSection from "./sections/HeaderSection";
import PositionSection from "./sections/PositionSection";
import ReferenceCard from "./sections/ReferenceCard";
import SubmitRow from "./sections/SubmitRow";
import EducationSection from "./sections/EducationSection";
import PharmacistSection from "./sections/PharmacistSection";
import SalesSection from "./sections/SalesSection";
import ThemeToggle from "./sections/ThemeToggle";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const GUIDE_SCROLL_OFFSET = 120;
const GUIDE_SCROLL_DURATION = 600;
const GUIDE_OVERLAY_FADE_MS = 300;
const GUIDE_HIGHLIGHT_EXIT_MS = 320;

const REQUIRED_FIELD_CHECKS = [
  {
    key: "email",
    isMissing: (form) => {
      const email = form.email?.trim() || "";
      return !email || !EMAIL_PATTERN.test(email);
    },
  },
  { key: "fullName", isMissing: (form) => !form.fullName?.trim() },
  { key: "sex", isMissing: (form) => !form.sex },
  {
    key: "age",
    isMissing: (form) => {
      const age = String(form.age || "").trim();
      return !age || Number.isNaN(Number(age));
    },
  },
  {
    key: "phone",
    isMissing: (form) => {
      const digits = String(form.phone || "").replace(/\D/g, "");
      return !digits || !digits.startsWith("0") || digits.length !== 10;
    },
  },
  { key: "educationLevel", isMissing: (form) => !form.educationLevel },
  {
    key: "educationLevelOther",
    isMissing: (form) =>
      form.educationLevel === "อื่นๆโปรดระบุ" && !String(form.educationLevelOther || "").trim(),
  },
  { key: "instituteName", isMissing: (form) => !form.instituteName?.trim() },
  { key: "major", isMissing: (form) => !form.major?.trim() },
  { key: "positionApplied", isMissing: (form) => !form.positionApplied },
  {
    key: "pharmacistType",
    isMissing: (form) => form.positionApplied === "เภสัชกร" && !form.pharmacistType,
  },
  {
    key: "salesBranchPreference",
    isMissing: (form) =>
      form.positionApplied === "พนักงานขายหน้าร้าน" && !form.salesBranchPreference,
  },
  {
    key: "availableStartDateSales",
    isMissing: (form) =>
      form.positionApplied === "พนักงานขายหน้าร้าน" && !form.availableStartDateSales,
  },
  {
    key: "referralSourceSales",
    isMissing: (form) =>
      form.positionApplied === "พนักงานขายหน้าร้าน" && !form.referralSourceSales,
  },
  {
    key: "referralOtherSales",
    isMissing: (form) =>
      form.positionApplied === "พนักงานขายหน้าร้าน" &&
      form.referralSourceSales === "อื่นๆ" &&
      !String(form.referralOtherSales || "").trim(),
  },
  {
    key: "pharmacistBranchPreference",
    isMissing: (form) =>
      form.positionApplied === "เภสัชกร" && !form.pharmacistBranchPreference,
  },
  {
    key: "licenseNumber",
    isMissing: (form) => form.positionApplied === "เภสัชกร" && !form.licenseNumber?.trim(),
  },
  {
    key: "pharmacySchool",
    isMissing: (form) => form.positionApplied === "เภสัชกร" && !form.pharmacySchool,
  },
  {
    key: "pharmacySchoolOther",
    isMissing: (form) =>
      form.positionApplied === "เภสัชกร" &&
      form.pharmacySchool === "อื่น" &&
      !String(form.pharmacySchoolOther || "").trim(),
  },
  {
    key: "availableStartDatePharmacist",
    isMissing: (form) =>
      form.positionApplied === "เภสัชกร" && !form.availableStartDatePharmacist,
  },
  {
    key: "referralSourcePharmacist",
    isMissing: (form) =>
      form.positionApplied === "เภสัชกร" && !form.referralSourcePharmacist,
  },
  {
    key: "referralOtherPharmacist",
    isMissing: (form) =>
      form.positionApplied === "เภสัชกร" &&
      form.referralSourcePharmacist === "อื่นๆ" &&
      !String(form.referralOtherPharmacist || "").trim(),
  },
];

const getMissingRequiredKeys = (form) =>
  REQUIRED_FIELD_CHECKS.filter(({ isMissing }) => isMissing(form)).map(({ key }) => key);

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function StatusModal({ type, message, onClose }) {
  const isSuccess = type === "success";

  return (
    <div className="status-overlay" role="dialog" aria-modal="true">
      <div className="status-card">
        <div className={`status-icon ${isSuccess ? "success" : "error"}`}>
          {isSuccess ? (
            <svg className="status-svg" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="status-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="status-check" fill="none" d="M14 27l7 7 17-17" />
            </svg>
          ) : (
            <svg className="status-svg" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="status-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="status-cross" fill="none" d="M17 17l18 18M35 17L17 35" />
            </svg>
          )}
        </div>
        <div className="status-message">
          {message || (isSuccess
            ? "ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณที่สมัครงานกับเรา"
            : "ส่งไม่สำเร็จ กรุณาลองใหม่")}
        </div>
        <button className="status-button" type="button" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  );
}

export default function JobApplicationForm() {
  const isDev = import.meta.env.DEV;
  const {
    isDark, setIsDark,
    form, status, submitResult, isSubmitting,
    errors,
    flags: { showSalesBranch, showPharmBranch },
    handlers: {
      onChange,
      onPositionChange,
      onPharmacistTypeChange,
      onSubmit,
      resetForm
    },
    referenceData,
    } = useJobApplicationForm();

  const [modalType, setModalType] = useState(null);
  const [guideMode, setGuideMode] = useState({ active: false, targetKey: null });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const highlightRef = useRef(null);
  const exitHighlightRef = useRef(null);
  const exitTimerRef = useRef(null);
  const overlayTimerRef = useRef(null);
  const scrollStateRef = useRef({ token: 0, isScrolling: false, target: null });
  const missingMarkerWarnedRef = useRef(new Set());
  const [targetNodeExists, setTargetNodeExists] = useState(null);
  const targetListenersRef = useRef({ nodes: [], attachedTo: null });

  const missingRequiredKeys = useMemo(() => getMissingRequiredKeys(form), [form]);
  const isRequiredComplete = missingRequiredKeys.length === 0;
  const guidePhase = guideMode.active ? "active" : overlayVisible ? "exiting" : "idle";
  const inlineStatus = submitResult === "success" ? "" : status;

  useEffect(() => {
    if (!submitResult) return;
    setModalType(submitResult);
  }, [submitResult]);

  useEffect(() => {
    if (guideMode.active) {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }
      setOverlayVisible(true);
      requestAnimationFrame(() => setOverlayActive(true));
      return;
    }
    if (!overlayVisible) return;
    setOverlayActive(false);
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
    }
    overlayTimerRef.current = setTimeout(() => {
      setOverlayVisible(false);
    }, GUIDE_OVERLAY_FADE_MS);
  }, [guideMode.active, overlayVisible]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  const getFieldNode = (key) =>
    key ? document.querySelector(`[data-field-key="${key}"]`) : null;

  const handleTargetInteract = () => {
    if (!guideMode.active) return;
    setGuideMode({ active: false, targetKey: null });
  };

  const findNearestMissingKey = (keys) => {
    if (!keys?.length) return null;
    const viewportCenter = window.innerHeight / 2;
    let bestKey = null;
    let bestScore = Number.POSITIVE_INFINITY;

    keys.forEach((key) => {
      const el = getFieldNode(key);
      if (!el && isDev && !missingMarkerWarnedRef.current.has(key)) {
        console.warn(`[GuideMode] Missing data-field-key marker for "${key}".`);
        missingMarkerWarnedRef.current.add(key);
      }
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const score = Math.abs(center - viewportCenter);
      if (score < bestScore) {
        bestScore = score;
        bestKey = key;
      }
    });

    return bestKey || keys[0];
  };

  const smoothScrollToElement = (el) => {
    if (!el) {
      if (isDev) console.warn("[GuideMode] smoothScroll target is null.");
      return;
    }
    const state = scrollStateRef.current;
    if (state.isScrolling && state.target === el) return;

    const token = state.token + 1;
    state.token = token;
    state.isScrolling = true;
    state.target = el;

    const startY = window.scrollY;
    const rect = el.getBoundingClientRect();
    const targetY = Math.max(0, startY + rect.top - GUIDE_SCROLL_OFFSET);
    const startTime = performance.now();

    const step = (now) => {
      if (scrollStateRef.current.token !== token) {
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / GUIDE_SCROLL_DURATION);
      const eased = easeInOutCubic(t);
      const nextY = startY + (targetY - startY) * eased;
      window.scrollTo(0, nextY);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        if (scrollStateRef.current.token === token) {
          scrollStateRef.current.isScrolling = false;
        }
      }
    };

    requestAnimationFrame(step);
  };

  const startExitHighlight = (el) => {
    if (!el) return;
    el.classList.remove("guide-highlight");
    el.classList.add("guide-highlight-exit");

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }
    exitHighlightRef.current = el;
    exitTimerRef.current = setTimeout(() => {
      if (exitHighlightRef.current) {
        exitHighlightRef.current.classList.remove("guide-highlight-exit");
        exitHighlightRef.current = null;
      }
    }, GUIDE_HIGHLIGHT_EXIT_MS);
  };

  const startHighlight = (el) => {
    if (!el) return;
    if (exitHighlightRef.current === el) {
      el.classList.remove("guide-highlight-exit");
      exitHighlightRef.current = null;
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    }
    el.classList.add("guide-highlight");
  };

  useEffect(() => {
    if (guideMode.active && guideMode.targetKey) {
      const el = getFieldNode(guideMode.targetKey);
      if (!el) return;
      if (highlightRef.current && highlightRef.current !== el) {
        startExitHighlight(highlightRef.current);
      }
      startHighlight(el);
      highlightRef.current = el;
      return;
    }
    if (!guideMode.active && highlightRef.current) {
      startExitHighlight(highlightRef.current);
      highlightRef.current = null;
    }
  }, [guideMode.active, guideMode.targetKey]);

  useEffect(() => {
    if (!guideMode.active || !guideMode.targetKey) return;
    const el = getFieldNode(guideMode.targetKey);
    if (el) smoothScrollToElement(el);
  }, [guideMode.active, guideMode.targetKey]);

  useEffect(() => {
    if (isRequiredComplete) {
      if (guideMode.active) {
        setGuideMode({ active: false, targetKey: null });
      }
      return;
    }
    if (!guideMode.active) return;
    const currentKey = guideMode.targetKey;
    const currentStillMissing =
      currentKey && missingRequiredKeys.includes(currentKey) && getFieldNode(currentKey);
    if (currentStillMissing) return;

    const nextKey = findNearestMissingKey(missingRequiredKeys);
    if (nextKey && nextKey !== currentKey) {
      setGuideMode({ active: true, targetKey: nextKey });
    }
  }, [guideMode.active, guideMode.targetKey, isRequiredComplete, missingRequiredKeys]);

  useEffect(() => {
    if (!guideMode.active || !guideMode.targetKey) {
      if (targetListenersRef.current.nodes.length) {
        targetListenersRef.current.nodes.forEach((node) => {
          node.removeEventListener("focus", handleTargetInteract);
          node.removeEventListener("input", handleTargetInteract);
        });
        targetListenersRef.current = { nodes: [], attachedTo: null };
      }
      return;
    }

    const container = getFieldNode(guideMode.targetKey);
    if (!container) return;
    const nodes = Array.from(container.querySelectorAll("input, select, textarea"));
    nodes.forEach((node) => {
      node.addEventListener("focus", handleTargetInteract, { once: true });
      node.addEventListener("input", handleTargetInteract, { once: true });
    });
    targetListenersRef.current = { nodes, attachedTo: guideMode.targetKey };

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener("focus", handleTargetInteract);
        node.removeEventListener("input", handleTargetInteract);
      });
    };
  }, [guideMode.active, guideMode.targetKey]);

  useEffect(() => {
    if (!isDev) return;
    if (typeof document === "undefined") return;
    if (!missingRequiredKeys.length) {
      missingMarkerWarnedRef.current.clear();
      return;
    }
    const raf = requestAnimationFrame(() => {
      missingRequiredKeys.forEach((key) => {
        const node = document.querySelector(`[data-field-key="${key}"]`);
        if (!node && !missingMarkerWarnedRef.current.has(key)) {
          console.warn(`[GuideMode] Missing data-field-key marker for "${key}".`);
          missingMarkerWarnedRef.current.add(key);
        }
        if (node && missingMarkerWarnedRef.current.has(key)) {
          missingMarkerWarnedRef.current.delete(key);
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [isDev, missingRequiredKeys]);

  useEffect(() => {
    if (!isDev) return;
    if (typeof document === "undefined") return;
    if (!guideMode.targetKey) {
      setTargetNodeExists(null);
      return;
    }
    const node = document.querySelector(`[data-field-key="${guideMode.targetKey}"]`);
    setTargetNodeExists(!!node);
  }, [isDev, guideMode.targetKey, guideMode.active]);

  const activateGuideMode = () => {
    if (!missingRequiredKeys.length) return;
    const nextKey = findNearestMissingKey(missingRequiredKeys);
    if (!nextKey) return;

    if (guideMode.active && guideMode.targetKey === nextKey) {
      const el = getFieldNode(nextKey);
      if (el) smoothScrollToElement(el);
      return;
    }
    setGuideMode({ active: true, targetKey: nextKey });
  };

  const handleSubmit = (event) => {
    if (!isRequiredComplete) {
      event.preventDefault();
      event.stopPropagation();
      activateGuideMode();
      return;
    }
    onSubmit(event);
  };

  return (
  <div className={`page ${isDark ? "theme-dark" : ""}`}>
      <div className="form-card">
        <ThemeToggle 
        isDark={isDark} 
        onToggle={() => setIsDark(v => !v)} />

        <div className="form-banner" role="img" aria-label="Company banner" />
        <div className="accent-bar" />

        <div className="form-body">
          <HeaderSection />

          <div className="required-note">* ระบุว่าเป็นคำถามที่จำเป็น</div>

          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <div className="section-title">ข้อมูลพื้นฐาน</div>

            <BasicInfoSection form={form} onChange={onChange} errors={errors} />
           

            <EducationSection form={form} onChange={onChange} errors={errors} />

            <PositionSection
              form={form}
              onChange={onChange}
              errors={errors}
              onPositionChange={onPositionChange}
              onPharmacistTypeChange={onPharmacistTypeChange}
            />

            <ReferenceCard referenceData={referenceData} />

            {showSalesBranch ? (
              <SalesSection
                form={form}
                onChange={onChange}
                errors={errors}
              />
            ) : null}

            {showPharmBranch ? (
              <PharmacistSection
                form={form}
                onChange={onChange}
                errors={errors}
                schoolOptions={SCHOOL_OPTIONS}
              />
            ) : null}

            <SubmitRow
              status={inlineStatus}
              isSubmitting={isSubmitting}
              isDisabled={!isRequiredComplete}
            />

          </form>
        </div>
      </div>
      {overlayVisible ? (
        <div
          className={`guide-overlay ${overlayActive ? "is-active" : ""}`}
          aria-hidden="true"
        />
      ) : null}
      {isDev ? (
        <div
          style={{
            position: "fixed",
            right: "16px",
            bottom: "16px",
            padding: "12px 14px",
            background: "rgba(15, 23, 42, 0.9)",
            color: "#f8fafc",
            borderRadius: "10px",
            fontSize: "12px",
            lineHeight: 1.5,
            maxWidth: "320px",
            zIndex: 200,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>DEV: Guidance Debug</div>
          <div>isRequiredComplete: {String(isRequiredComplete)}</div>
          <div>missingRequiredKeys: {JSON.stringify(missingRequiredKeys)}</div>
          <div>
            guideMode:{" "}
            {JSON.stringify({
              active: guideMode.active,
              phase: guidePhase,
              targetKey: guideMode.targetKey,
            })}
          </div>
          <div>
            targetNodeExists: {guideMode.targetKey ? String(targetNodeExists) : "n/a"}
          </div>
        </div>
      ) : null}
      {modalType ? (
        <StatusModal
          type={modalType}
          message={status}
          onClose={() => {
            setModalType(null);
            resetForm();
            window.location.hash = "/apply";
          }}
        />
      ) : null}
    </div>
  );
}
