import { useEffect } from "react";
import { getEnabledBranchIds, getEnabledBranches } from "../../config/branches";

export default function PharmacistSection({ form, onChange, schoolOptions, errors }) {
  const branchOptions = getEnabledBranches("pharmacist");
  const branchIds = getEnabledBranchIds("pharmacist");

  useEffect(() => {
    if (
      form.pharmacistBranchPreference &&
      !branchIds.includes(form.pharmacistBranchPreference)
    ) {
      onChange({
        target: { name: "pharmacistBranchPreference", value: "" },
      });
    }
  }, [form.pharmacistBranchPreference, branchIds, onChange]);

  return (
    <>
      <div className="section-title">คำถามเฉพาะเภสัชกร</div>

      <div className="question-block" data-field-key="pharmacistBranchPreference">
        <div className="question-label">สาขาที่ต้องการทำงาน<span className="required-star">*</span></div>
        <div
          className={`option-grid ${errors?.pharmacistBranchPreference ? "is-invalid" : ""}`}
          id="pharmacistBranchPreference-group"
        >
          {branchOptions.map((branch) => (
            <label key={branch.id} className="option-item">
              <input
                type="radio"
                name="pharmacistBranchPreference"
                value={branch.id}
                checked={form.pharmacistBranchPreference === branch.id}
                onChange={onChange}
              />
              <span>{branch.label}</span>
            </label>
          ))}
        </div>
        {errors?.pharmacistBranchPreference ? (
          <div className="error-text">{errors.pharmacistBranchPreference.message}</div>
        ) : null}
      </div>

      <div className="question-block" data-field-key="licenseNumber">
        <label className="question-label" htmlFor="licenseNumber">
          เลขใบประกอบวิชาชีพ (ระบุแค่ตัวเลขหลัง ภ.)<span className="required-star">*</span>
        </label>
        <input
          id="licenseNumber"
          name="licenseNumber"
          type="text"
          placeholder="เลขที่ใบประกอบวิชาชีพ"
          value={form.licenseNumber}
          onChange={onChange}
          className={`gf-input ${errors?.licenseNumber ? "is-invalid" : ""}`}
        />
        {errors?.licenseNumber ? (
          <div className="error-text">{errors.licenseNumber.message}</div>
        ) : null}
      </div>

      <div className="question-block" data-field-key="pharmacySchool">
        <label className="question-label" htmlFor="pharmacySchool">
          สถาบันที่จบเภสัชศาสตร์<span className="required-star">*</span>
        </label>
        <select
          id="pharmacySchool"
          name="pharmacySchool"
          value={form.pharmacySchool}
          onChange={onChange}
          className={`gf-select ${errors?.pharmacySchool ? "is-invalid" : ""}`}
        >
          <option value="">-- เลือก --</option>
          {schoolOptions.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
          <option value="อื่น">อื่น (ระบุ)</option>
        </select>
        {form.pharmacySchool === "อื่น" ? (
          <input
            name="pharmacySchoolOther"
            type="text"
            placeholder="ระบุสถาบัน"
            value={form.pharmacySchoolOther}
            onChange={onChange}
            className="gf-input"
            data-field-key="pharmacySchoolOther"
          />
        ) : null}
        {errors?.pharmacySchool ? (
          <div className="error-text">{errors.pharmacySchool.message}</div>
        ) : null}
      </div>

      <div className="question-block" data-field-key="availableStartDatePharmacist">
        <label className="question-label" htmlFor="availableStartDatePharmacist">
          วันที่เริ่มงานได้<span className="required-star">*</span>
          <input
            id="availableStartDatePharmacist"
            name="availableStartDatePharmacist"
            type="date"
            value={form.availableStartDatePharmacist}
            onChange={onChange}
            className={`gf-input ${errors?.availableStartDatePharmacist ? "is-invalid" : ""}`}
            required
          />
        </label>
        {errors?.availableStartDatePharmacist ? (
          <div className="error-text">{errors.availableStartDatePharmacist.message}</div>
        ) : null}
      </div>


      <div className="question-block" data-field-key="referralSourcePharmacist">
        <div className="question-label">
          ช่องทางที่รู้จักเรา<span className="required-star">*</span>
        </div>
        <div
          className={`option-grid ${errors?.referralSourcePharmacist ? "is-invalid" : ""}`}
          id="referralSourcePharmacist-group"
        >
          {["Facebook page", "Line official account", "Pharm-job.com", "LinkedIn", "อื่นๆ"].map((item) => (
            <label key={item} className="option-item">
              <input
                type="radio"
                name="referralSourcePharmacist"
                value={item}
                checked={form.referralSourcePharmacist === item}
                onChange={onChange}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {form.referralSourcePharmacist === "อื่นๆ" ? (
          <input
            id="referralOtherPharmacist"
            name="referralOtherPharmacist"
            type="text"
            placeholder="ระบุช่องทางอื่นๆ"
            value={form.referralOtherPharmacist}
            onChange={onChange}
            className={`gf-input ${errors?.referralOtherPharmacist ? "is-invalid" : ""}`}
            data-field-key="referralOtherPharmacist"
          />
        ) : null}
        {errors?.referralSourcePharmacist ? (
          <div className="error-text">{errors.referralSourcePharmacist.message}</div>
        ) : null}
        {errors?.referralOtherPharmacist ? (
          <div className="error-text">{errors.referralOtherPharmacist.message}</div>
        ) : null}
      </div>

    </>
  );
}
