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

export default function JobApplicationForm() {
  const {
    isDark, setIsDark,
    form, status, isSubmitting,
    errors,
    flags: { showReference, showSalesBranch, showPharmBranch },
    handlers: {
      onChange,
      onPositionChange,
      onPharmacistTypeChange,
      onSubmit,
      setBranchUnlocked
    },
    referenceData,
    } = useJobApplicationForm();

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

            <ReferenceCard
              show={showReference}
              referenceData={referenceData}
              onUnlock={() => setBranchUnlocked(true)}
            />

              <SalesSection
                show={showSalesBranch}
                form={form}
                onChange={onChange}
                errors={errors}
              />


 
              <PharmacistSection
                show={showPharmBranch}
                form={form}
                onChange={onChange}
                errors={errors}
                schoolOptions={SCHOOL_OPTIONS}
              />

            <SubmitRow status={status} isSubmitting={isSubmitting} />

          </form>
        </div>
      </div>
    </div>
  );
}
