export default function EducationSection({ form, onChange, errors }) {
  const educationOptions = [
    "อนุบาล",
    "ประถม 1-6",
    "มัธยมต้น (ม.1-3)",
    "มัธยมปลาย (ม.4-6)",
    "ปวช. (เทียบเท่า ม.ปลาย)",
    "ปวส. (เทียบเท่า อนุปริญญา)",
    "ปริญญาตรี",
    "ปริญญาโท",
    "ปริญญาเอก",
    "การศึกษานอกระบบ (กศน.)",
    "การศึกษาตามอัธยาศัย",
    "อื่นๆโปรดระบุ",
  ];

  const handleEducationChange = (e) => {
    onChange(e);
    if (e.target.value !== "อื่นๆโปรดระบุ" && form.educationLevelOther) {
      onChange({ target: { name: "educationLevelOther", value: "" } });
    }
  };

  return (
    <>
      <div className="question-block">
        <label className="question-label" htmlFor="lineId">
          Line ID
        </label>
        <input
          id="lineId"
          name="lineId"
          type="text"
          placeholder="line id ของคุณ"
          value={form.lineId}
          onChange={onChange}
          className="gf-input"
        />
      </div>

      <div className="question-block" data-field-key="educationLevel">
        <label className="question-label" htmlFor="educationLevel">
          ระดับการศึกษา<span className="required-star">*</span>
        </label>
        <select
          id="educationLevel"
          name="educationLevel"
          value={form.educationLevel}
          onChange={handleEducationChange}
          className={`gf-select ${errors?.educationLevel ? "is-invalid" : ""}`}
        >
          <option value="">-- เลือก --</option>
          {educationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {form.educationLevel === "อื่นๆโปรดระบุ" ? (
          <input
            id="educationLevelOther"
            name="educationLevelOther"
            type="text"
            placeholder="โปรดระบุระดับการศึกษา"
            value={form.educationLevelOther}
            onChange={onChange}
            className="gf-input"
            data-field-key="educationLevelOther"
          />
        ) : null}
        {errors?.educationLevel ? (
          <div className="error-text">{errors.educationLevel.message}</div>
        ) : null}
      </div>

      <div className="question-block" data-field-key="instituteName">
        <label className="question-label" htmlFor="instituteName">
          ชื่อสถาบัน<span className="required-star">*</span>
        </label>
        <input
          id="instituteName"
          name="instituteName"
          type="text"
          placeholder="เช่น มหาวิทยาลัยศรีนครินทร์"
          value={form.instituteName}
          onChange={onChange}
          className={`gf-input ${errors?.instituteName ? "is-invalid" : ""}`}
          required
        />
        {errors?.instituteName ? (
          <div className="error-text">{errors.instituteName.message}</div>
        ) : null}
      </div>
    </>
  );
}
