export default function PharmacistSection({ show, form, onChange, schoolOptions, errors }) {
  if (!show) return null;

  return (
    <>
      <div className="section-title">คำถามเฉพาะเภสัชกร</div>

      <div className="question-block">
        <div className="question-label">สาขาที่ต้องการทำงาน<span className="required-star">*</span></div>
        <div
          className={`option-grid ${errors?.pharmacistBranchPreference ? "is-invalid" : ""}`}
          id="pharmacistBranchPreference-group"
        >
          {[
            "สาขาตลาดบางน้อย",
            "สาขาวัดช่องลม",
          ].map((item) => (
            <label key={item} className="option-item">
              <input
                type="radio"
                name="pharmacistBranchPreference"
                value={item}
                checked={form.pharmacistBranchPreference === item}
                onChange={onChange}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {errors?.pharmacistBranchPreference ? (
          <div className="error-text">{errors.pharmacistBranchPreference.message}</div>
        ) : null}
      </div>

      <div className="question-block">
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

      <div className="question-block">
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
          />
        ) : null}
        {errors?.pharmacySchool ? (
          <div className="error-text">{errors.pharmacySchool.message}</div>
        ) : null}
      </div>

      <div className="question-block">
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


      <div className="question-block">
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
