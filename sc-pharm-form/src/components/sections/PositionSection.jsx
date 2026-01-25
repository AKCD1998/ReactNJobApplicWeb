export default function PositionSection({
  form,
  onChange,
  errors,
  onPositionChange,
  onPharmacistTypeChange,
}) {
  return (
    <>
    <div className="question-block">
      <label className="question-label" htmlFor="major">
        สาขาวิชา<span className="required-star">*</span>
      </label>
      <input
        id="major"
        name="major"
        type="text"
        placeholder="เช่น เภสัชศาสตร์"
        value={form.major}
        onChange={onChange}
        className={`gf-input ${errors?.major ? "is-invalid" : ""}`}
        required
      />
      {errors?.major ? <div className="error-text">{errors.major.message}</div> : null}
    </div>

    <div className="question-block">
      <div className="question-label">
        ตำแหน่งที่สมัคร<span className="required-star">*</span>
      </div>
      <div className={`option-grid ${errors?.positionApplied ? "is-invalid" : ""}`} id="positionApplied-group">
        {["พนักงานขายหน้าร้าน", "เภสัชกร"].map((item) => (
          <label key={item} className="option-item">
            <input
              type="radio"
              name="positionApplied"
              value={item}
              checked={form.positionApplied === item}
              onChange={(e) => onPositionChange(e.target.value)}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
      {errors?.positionApplied ? (
        <div className="error-text">{errors.positionApplied.message}</div>
      ) : null}
    </div>

    {form.positionApplied === "เภสัชกร" ? (
      <div className="question-block">
        <div className="question-label">
          ระบุตำแหน่งงานเภสัชกรที่ต้องการสมัคร<span className="required-star">*</span>
        </div>
        <div className={`option-grid ${errors?.pharmacistType ? "is-invalid" : ""}`} id="pharmacistType-group">
          {["เภสัชกรฟูลไทม์", "เภสัชกรพาร์ทไทม์"].map((item) => (
            <label key={item} className="option-item">
              <input
                type="radio"
                name="pharmacistType"
                value={item}
                checked={form.pharmacistType === item}
                onChange={(e) => onPharmacistTypeChange(e.target.value)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {errors?.pharmacistType ? (
          <div className="error-text">{errors.pharmacistType.message}</div>
        ) : null}
      </div>
    ) : null}
    </>
  );
}
