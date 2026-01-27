import { useEffect, useState } from "react";
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
  const inlineStatus = submitResult === "success" ? "" : status;

  useEffect(() => {
    if (!submitResult) return;
    setModalType(submitResult);
  }, [submitResult]);

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

          <form onSubmit={onSubmit} className="form-grid">
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

            <SubmitRow status={inlineStatus} isSubmitting={isSubmitting} />

          </form>
        </div>
      </div>
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
