export default function PositionSection({
  form,
  onChange,
  errors,
  onPositionChange,
  onPharmacistTypeChange,
}) {
  const selectedRole =
    form.positionApplied === "พนักงานขายหน้าร้าน"
      ? "พนักงานขายหน้าร้าน"
      : form.positionApplied === "เภสัชกร" && form.pharmacistType
        ? form.pharmacistType
        : "";

  const handleRoleChange = (value) => {
    if (value === "พนักงานขายหน้าร้าน") {
      onPositionChange("พนักงานขายหน้าร้าน");
      onPharmacistTypeChange("");
      return;
    }

    if (value === "เภสัชกรฟูลไทม์") {
      onPositionChange("เภสัชกร");
      onPharmacistTypeChange("เภสัชกรฟูลไทม์");
      return;
    }

    if (value === "เภสัชกรพาร์ทไทม์") {
      onPositionChange("เภสัชกร");
      onPharmacistTypeChange("เภสัชกรพาร์ทไทม์");
    }
  };

  const roleError = errors?.positionApplied || errors?.pharmacistType;

  return (
    <>
      <div className="question-block" data-field-key="major">
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

      <div className="question-block" data-field-key="positionApplied">
        <div className="question-label">
          ตำแหน่งที่ต้องการสมัคร<span className="required-star">*</span>
        </div>
        <div
          className={`option-grid ${roleError ? "is-invalid" : ""}`}
          id="positionApplied-group"
        >
          {[
            { value: "พนักงานขายหน้าร้าน", label: "พนักงานขายหน้าร้าน" },
            {
              value: "เภสัชกรฟูลไทม์",
              label: "เภสัชกรฟูลไทม์",
              note: "(เฉพาะผู้สำเร็จการศึกษา ปริญญาตรี เภสัชศาสตรบัณฑิต (ภ.บ.) เท่านั้น)",
            },
            {
              value: "เภสัชกรพาร์ทไทม์",
              label: "เภสัชกรพาร์ทไทม์",
              note: "(เฉพาะผู้สำเร็จการศึกษา ปริญญาตรี เภสัชศาสตรบัณฑิต (ภ.บ.) เท่านั้น)",
            },
          ].map((item) => (
            <label key={item.value} className="option-item">
              <input
                type="radio"
                name="positionAppliedMerged"
                value={item.value}
                checked={selectedRole === item.value}
                onChange={(e) => handleRoleChange(e.target.value)}
              />
              <span>
                {item.label}{" "}
                {item.note ? (
                  <span style={{ color: "#d93025", fontWeight: 700 }}>{item.note}</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
        {roleError ? (
          <div className="error-text">
            {errors?.positionApplied?.message || errors?.pharmacistType?.message}
          </div>
        ) : null}
      </div>
    </>
  );
}
