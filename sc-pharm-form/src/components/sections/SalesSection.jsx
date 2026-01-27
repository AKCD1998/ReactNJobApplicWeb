import { useEffect } from "react";
import { getEnabledBranchIds, getEnabledBranches } from "../../config/branches";

export default function SalesSection({ show, form, onChange, errors }) {
  const branchOptions = getEnabledBranches("sales");
  const branchIds = getEnabledBranchIds("sales");

  useEffect(() => {
    if (form.salesBranchPreference && !branchIds.includes(form.salesBranchPreference)) {
      onChange({
        target: { name: "salesBranchPreference", value: "" },
      });
    }
  }, [form.salesBranchPreference, branchIds, onChange]);

  if (!show) return null;

  return (
    <>
      <div className="section-title">คำถามเฉพาะพนักงานขายหน้าร้าน</div>

      <div className="question-block">
        <div className="question-label">สาขาที่ต้องการทำงาน</div>
        <div className="option-grid">
          {branchOptions.map((branch) => (
            <label key={branch.id} className="option-item">
              <input
                type="radio"
                name="salesBranchPreference"
                value={branch.id}
                checked={form.salesBranchPreference === branch.id}
                onChange={onChange}
              />
              <span>{branch.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="question-block">
        <label className="question-label" htmlFor="availableStartDateSales">
          วันที่เริ่มงานได้<span className="required-star">*</span>
          <input
            id="availableStartDateSales"
            name="availableStartDateSales"
            type="date"
            value={form.availableStartDateSales}
            onChange={onChange}
            className={`gf-input ${errors?.availableStartDateSales ? "is-invalid" : ""}`}
            required
          />
        </label>
        {errors?.availableStartDateSales ? (
          <div className="error-text">{errors.availableStartDateSales.message}</div>
        ) : null}
      </div>

      <div className="question-block">
        <div className="question-label">
          ช่องทางที่รู้จักเรา<span className="required-star">*</span>
        </div>
        <div
          className={`option-grid ${errors?.referralSourceSales ? "is-invalid" : ""}`}
          id="referralSourceSales-group"
        >
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
            id="referralOtherSales"
            name="referralOtherSales"
            type="text"
            placeholder="ระบุช่องทางอื่นๆ"
            value={form.referralOtherSales}
            onChange={onChange}
            className={`gf-input ${errors?.referralOtherSales ? "is-invalid" : ""}`}
          />
        ) : null}
        {errors?.referralSourceSales ? (
          <div className="error-text">{errors.referralSourceSales.message}</div>
        ) : null}
        {errors?.referralOtherSales ? (
          <div className="error-text">{errors.referralOtherSales.message}</div>
        ) : null}
      </div>
    </>
  );
}
