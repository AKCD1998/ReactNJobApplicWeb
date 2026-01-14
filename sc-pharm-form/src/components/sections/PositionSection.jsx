export default function PositionSection({
  form,
  onChange,
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
        className="gf-input"
        required
      />
    </div>

    <div className="question-block">
      <div className="question-label">
        ตำแหน่งที่สมัคร<span className="required-star">*</span>
      </div>
      <div className="option-grid">
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
    </div>

    {form.positionApplied === "เภสัชกร" ? (
      <div className="question-block">
        <div className="question-label">
          ประเภทเภสัชกร<span className="required-star">*</span>
        </div>
        <div className="option-grid">
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
      </div>
    ) : null}
    </>
  );
}
