export default function PharmacistSection({ show, form, onChange, onFileChange, schoolOptions }) {
  if (!show) return null;

  return (
    <>
      <div className="section-title">คำถามเฉพาะเภสัชกร</div>

      <div className="question-block">
        <div className="question-label">สาขาที่ต้องการทำงาน</div>
        <div className="option-grid">
          {[
            "สาขาตลาดบางน้อย",
            "สาขาวัดช่องลม",
            "Telepharmacies and Mobile pharmacist",
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
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="licenseNumber">
          เลขใบประกอบวิชาชีพ (ถ้ามี)
        </label>
        <input
          id="licenseNumber"
          name="licenseNumber"
          type="text"
          placeholder="เลขที่ใบประกอบวิชาชีพ"
          value={form.licenseNumber}
          onChange={onChange}
          className="gf-input"
        />
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="pharmacySchool">
          สถาบันที่จบเภสัชศาสตร์
        </label>
        <select
          id="pharmacySchool"
          name="pharmacySchool"
          value={form.pharmacySchool}
          onChange={onChange}
          className="gf-select"
        >
          <option value="">-- เลือก --</option>
          {SCHOOL_OPTIONS.map((school) => (
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
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="workHistoryPharmacist">
          ประวัติการทำงาน
        </label>
        <textarea
          id="workHistoryPharmacist"
          name="workHistoryPharmacist"
          rows={3}
          placeholder="เล่าประสบการณ์ที่เกี่ยวข้อง"
          value={form.workHistoryPharmacist}
          onChange={onChange}
          className="gf-textarea"
        />
      </div>

      <div className="question-block two-col">
        <label className="question-label" htmlFor="expectedSalaryPharmacist">
          เงินเดือนที่คาดหวัง<span className="required-star">*</span>
          <input
            id="expectedSalaryPharmacist"
            name="expectedSalaryPharmacist"
            type="text"
            placeholder="เช่น 25,000"
            value={form.expectedSalaryPharmacist}
            onChange={onChange}
            className="gf-input"
            required
          />
        </label>

        <label className="question-label" htmlFor="availableStartDatePharmacist">
          วันที่เริ่มงานได้<span className="required-star">*</span>
          <input
            id="availableStartDatePharmacist"
            name="availableStartDatePharmacist"
            type="date"
            value={form.availableStartDatePharmacist}
            onChange={onChange}
            className="gf-input"
            required
          />
        </label>
      </div>

      <div className="question-block">
        <div className="question-label">
          ช่องทางที่รู้จักเรา<span className="required-star">*</span>
        </div>
        <div className="option-grid">
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
            name="referralOtherPharmacist"
            type="text"
            placeholder="ระบุช่องทางอื่นๆ"
            value={form.referralOtherPharmacist}
            onChange={onChange}
            className="gf-input"
          />
        ) : null}
      </div>

      {form.pharmacistType === "เภสัชกรฟูลไทม์" ? (
        <div className="question-block">
          <label className="question-label" htmlFor="birthDatePharmacist">
            วันเกิด<span className="required-star">*</span>
          </label>
          <input
            id="birthDatePharmacist"
            name="birthDatePharmacist"
            type="date"
            value={form.birthDatePharmacist}
            onChange={onChange}
            className="gf-input"
            required
          />
        </div>
      ) : null}

      <div className="question-block">
        <label className="question-label" htmlFor="resumeFilePharmacist">
          อัปโหลดเรซูเม่ (PDF/Word)
        </label>
        <input
          id="resumeFilePharmacist"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => onFileChange(e, "pharmacist")}
          className="gf-file"
        />
        {form.resumeFileNamePharmacist ? (
          <div className="file-meta">ไฟล์ที่เลือก: {form.resumeFileNamePharmacist}</div>
        ) : null}
      </div>
    </>
  );
}