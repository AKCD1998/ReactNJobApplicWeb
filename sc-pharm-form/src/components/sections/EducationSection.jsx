export default function EducationSection({ form, onChange }) {
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

    <div className="question-block">
      <label className="question-label" htmlFor="educationLevel">
        ระดับการศึกษา
      </label>
      <input
        id="educationLevel"
        name="educationLevel"
        type="text"
        placeholder="เช่น ปริญญาตรี"
        value={form.educationLevel}
        onChange={onChange}
        className="gf-input"
      />
    </div>

    <div className="question-block">
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
        className="gf-input"
        required
      />
    </div>
    </>
  );
}