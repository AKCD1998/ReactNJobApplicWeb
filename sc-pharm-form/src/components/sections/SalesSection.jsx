export default function SalesSection({ show, form, onChange, onFileChange }) {
  if (!show) return null;

  return (
    <>
      <div className="section-title">คำถามเฉพาะพนักงานขายหน้าร้าน</div>

      <div className="question-block">
        <div className="question-label">สาขาที่ต้องการทำงาน</div>
        <div className="option-grid">
          {["สาขาวัดช่องลม", "สาขาตลาดแม่กลอง"].map((item) => (
            <label key={item} className="option-item">
              <input
                type="radio"
                name="salesBranchPreference"
                value={item}
                checked={form.salesBranchPreference === item}
                onChange={onChange}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="workHistorySales">
          ประวัติการทำงาน
        </label>
        <textarea
          id="workHistorySales"
          name="workHistorySales"
          rows={3}
          placeholder="เล่าประสบการณ์ที่เกี่ยวข้อง"
          value={form.workHistorySales}
          onChange={onChange}
          className="gf-textarea"
        />
      </div>

      <div className="question-block two-col">
        <label className="question-label" htmlFor="expectedSalarySales">
          เงินเดือนที่คาดหวัง<span className="required-star">*</span>
          <input
            id="expectedSalarySales"
            name="expectedSalarySales"
            type="text"
            placeholder="เช่น 12,000"
            value={form.expectedSalarySales}
            onChange={onChange}
            className="gf-input"
            required
          />
        </label>

        <label className="question-label" htmlFor="availableStartDateSales">
          วันที่เริ่มงานได้<span className="required-star">*</span>
          <input
            id="availableStartDateSales"
            name="availableStartDateSales"
            type="date"
            value={form.availableStartDateSales}
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
                name="referralSourceSales"
                value={item}
                checked={form.referralSourceSales === item}
                onChange={onChange}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {form.referralSourceSales === "อื่นๆ" ? (
          <input
            name="referralOtherSales"
            type="text"
            placeholder="ระบุช่องทางอื่นๆ"
            value={form.referralOtherSales}
            onChange={onChange}
            className="gf-input"
          />
        ) : null}
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="birthDateSales">
          วันเกิด<span className="required-star">*</span>
        </label>
        <input
          id="birthDateSales"
          name="birthDateSales"
          type="date"
          value={form.birthDateSales}
          onChange={onChange}
          className="gf-input"
          required
        />
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="resumeFileSales">
          อัปโหลดเรซูเม่ (PDF/Word)
        </label>
        <input
          id="resumeFileSales"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => onFileChange(e, "sales")}
          className="gf-file"
        />
        {form.resumeFileNameSales ? (
          <div className="file-meta">ไฟล์ที่เลือก: {form.resumeFileNameSales}</div>
        ) : null}
      </div>
    </>
  );
}