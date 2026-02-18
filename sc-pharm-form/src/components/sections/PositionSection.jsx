import {
  POSITION_TYPES,
  getEnabledPositions,
  getSelectedPositionId,
  resolveSelectionToFormValues,
} from "../../config/positions";

export default function PositionSection({
  form,
  onChange,
  errors,
  onPositionChange,
  onPharmacistTypeChange,
}) {
  const enabledPositions = getEnabledPositions();
  const selectedRole = getSelectedPositionId(form);

  const handleRoleChange = (value) => {
    const next = resolveSelectionToFormValues(value);
    if (!next) return;
    onPositionChange(next.positionApplied);
    onPharmacistTypeChange(next.pharmacistType);
  };

  const hasEnabledPharmacist = enabledPositions.some(
    (position) => position.type === POSITION_TYPES.PHARMACIST
  );
  const roleError = hasEnabledPharmacist
    ? errors?.positionApplied || errors?.pharmacistType
    : errors?.positionApplied;

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
          {enabledPositions.map((item) => (
            <label key={item.id} className="option-item">
              <input
                type="radio"
                name="positionAppliedMerged"
                value={item.id}
                checked={selectedRole === item.id}
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
