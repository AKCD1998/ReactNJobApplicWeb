export default function OnlineMarketingSection({ form, onChange, errors }) {
  return (
    <>
      <div className="section-title">คำถามเฉพาะพนักงานการตลาดออนไลน์</div>

      <div className="question-block" data-field-key="availableStartDateMarketing">
        <label className="question-label" htmlFor="availableStartDateMarketing">
          วันที่เริ่มงานได้<span className="required-star">*</span>
          <input
            id="availableStartDateMarketing"
            name="availableStartDateMarketing"
            type="date"
            value={form.availableStartDateMarketing}
            onChange={onChange}
            className={`gf-input ${errors?.availableStartDateMarketing ? "is-invalid" : ""}`}
            required
          />
        </label>
        {errors?.availableStartDateMarketing ? (
          <div className="error-text">{errors.availableStartDateMarketing.message}</div>
        ) : null}
      </div>

      <div className="question-block" data-field-key="referralSourceMarketing">
        <div className="question-label">
          ช่องทางที่รู้จักเรา<span className="required-star">*</span>
        </div>
        <div
          className={`option-grid ${errors?.referralSourceMarketing ? "is-invalid" : ""}`}
          id="referralSourceMarketing-group"
        >
          {["Facebook page", "Line official account", "Pharm-job.com", "LinkedIn", "อื่นๆ"].map((item) => (
            <label key={item} className="option-item">
              <input
                type="radio"
                name="referralSourceMarketing"
                value={item}
                checked={form.referralSourceMarketing === item}
                onChange={onChange}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {form.referralSourceMarketing === "อื่นๆ" ? (
          <input
            id="referralOtherMarketing"
            name="referralOtherMarketing"
            type="text"
            placeholder="ระบุช่องทางอื่นๆ"
            value={form.referralOtherMarketing}
            onChange={onChange}
            className={`gf-input ${errors?.referralOtherMarketing ? "is-invalid" : ""}`}
            data-field-key="referralOtherMarketing"
          />
        ) : null}
        {errors?.referralSourceMarketing ? (
          <div className="error-text">{errors.referralSourceMarketing.message}</div>
        ) : null}
        {errors?.referralOtherMarketing ? (
          <div className="error-text">{errors.referralOtherMarketing.message}</div>
        ) : null}
      </div>
    </>
  );
}
