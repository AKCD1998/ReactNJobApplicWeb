import { useEffect, useState } from "react";

const SUBMIT_URL =
  "https://script.google.com/macros/s/AKfycbw3q1pme3bSxNNPCmJ4aZK85ps01Nx9QDkbL-4nJYcnbdcJZ3b9iihI6pfTN44UchMn/exec";

const SALES_REF_IMAGE = "";
const PHARM_FULL_REF_IMAGE = "";
const PHARM_PART_REF_IMAGE = "";

const SCHOOL_OPTIONS = Array.from({ length: 19 }, (_, i) => `มหาวิทยาลัย ${i + 1}`);

const SALES_DEFAULTS = {
  salesBranchPreference: "",
  workHistorySales: "",
  expectedSalarySales: "",
  availableStartDateSales: "",
  referralSourceSales: "",
  referralOtherSales: "",
  birthDateSales: "",
  resumeFileNameSales: "",
  resumeFileDataSales: "",
  resumeFileMimeSales: "",
};

const PHARM_DEFAULTS = {
  pharmacistBranchPreference: "",
  licenseNumber: "",
  pharmacySchool: "",
  pharmacySchoolOther: "",
  workHistoryPharmacist: "",
  expectedSalaryPharmacist: "",
  availableStartDatePharmacist: "",
  referralSourcePharmacist: "",
  referralOtherPharmacist: "",
  birthDatePharmacist: "",
  resumeFileNamePharmacist: "",
  resumeFileDataPharmacist: "",
  resumeFileMimePharmacist: "",
};

const INITIAL_FORM = {
  email: "",
  fullName: "",
  nickName: "",
  sex: "",
  age: "",
  phone: "",
  lineId: "",
  educationLevel: "",
  instituteName: "",
  major: "",
  positionApplied: "",
  pharmacistType: "",
  ...SALES_DEFAULTS,
  ...PHARM_DEFAULTS,
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [referenceStep, setReferenceStep] = useState("");
  const [branchUnlocked, setBranchUnlocked] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    if (isDark) {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }
  }, [isDark]);

  const showReference = referenceStep && !branchUnlocked;
  const showSalesBranch = form.positionApplied === "พนักงานขายหน้าร้าน" && branchUnlocked;
  const showPharmBranch = form.positionApplied === "เภสัชกร" && branchUnlocked;

  function onChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function onPositionChange(value) {
    setBranchUnlocked(false);
    setStatus("");
    setReferenceStep(value === "พนักงานขายหน้าร้าน" ? "sales" : "");
    setForm((p) => ({
      ...p,
      positionApplied: value,
      pharmacistType: value === "เภสัชกร" ? p.pharmacistType : "",
      ...SALES_DEFAULTS,
      ...(value === "พนักงานขายหน้าร้าน" ? {} : PHARM_DEFAULTS),
    }));
  }

  function onPharmacistTypeChange(value) {
    setBranchUnlocked(false);
    setStatus("");
    setReferenceStep(value === "เภสัชกรฟูลไทม์" ? "pharm-full" : "pharm-part");
    setForm((p) => ({
      ...p,
      pharmacistType: value,
      ...PHARM_DEFAULTS,
    }));
  }

  async function onFileChange(e, branch) {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((p) =>
        branch === "sales"
          ? { ...p, resumeFileNameSales: "", resumeFileDataSales: "", resumeFileMimeSales: "" }
          : {
              ...p,
              resumeFileNamePharmacist: "",
              resumeFileDataPharmacist: "",
              resumeFileMimePharmacist: "",
            }
      );
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    setForm((p) =>
      branch === "sales"
        ? {
            ...p,
            resumeFileNameSales: file.name,
            resumeFileDataSales: dataUrl,
            resumeFileMimeSales: file.type,
          }
        : {
            ...p,
            resumeFileNamePharmacist: file.name,
            resumeFileDataPharmacist: dataUrl,
            resumeFileMimePharmacist: file.type,
          }
    );
  }

  function validate() {
    if (!form.email.trim()) return "กรุณากรอกอีเมล";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return "รูปแบบอีเมลไม่ถูกต้อง";
    if (!form.fullName.trim()) return "กรุณากรอกชื่อ-นามสกุล";
    if (!form.age.trim() || Number.isNaN(Number(form.age))) return "กรุณากรอกอายุเป็นตัวเลข";
    if (!form.phone.trim()) return "กรุณากรอกเบอร์โทร";
    if (!/^[0-9+()\-\s]{9,}$/.test(form.phone.trim())) return "รูปแบบเบอร์โทรไม่ถูกต้อง";
    if (!form.instituteName.trim()) return "กรุณากรอกชื่อสถาบัน";
    if (!form.major.trim()) return "กรุณากรอกสาขาวิชา";
    if (!form.positionApplied) return "กรุณาเลือกตำแหน่งที่สมัคร";
    if (form.positionApplied === "เภสัชกร" && !form.pharmacistType) {
      return "กรุณาเลือกประเภทเภสัชกร";
    }
    if (referenceStep && !branchUnlocked) return "กรุณาอ่านข้อมูลอ้างอิงและกดสมัครตำแหน่งนี้";

    if (form.positionApplied === "พนักงานขายหน้าร้าน") {
      if (!form.expectedSalarySales.trim()) return "กรุณากรอกเงินเดือนที่คาดหวัง";
      if (!form.availableStartDateSales) return "กรุณาเลือกวันที่เริ่มงานได้";
      if (!form.referralSourceSales) return "กรุณาเลือกช่องทางที่รู้จักเรา";
      if (form.referralSourceSales === "อื่นๆ" && !form.referralOtherSales.trim()) {
        return "กรุณาระบุช่องทางอื่นๆ";
      }
      if (!form.birthDateSales) return "กรุณาเลือกวันเกิด";
    }

    if (form.positionApplied === "เภสัชกร") {
      if (!form.expectedSalaryPharmacist.trim()) return "กรุณากรอกเงินเดือนที่คาดหวัง";
      if (!form.availableStartDatePharmacist) return "กรุณาเลือกวันที่เริ่มงานได้";
      if (!form.referralSourcePharmacist) return "กรุณาเลือกช่องทางที่รู้จักเรา";
      if (form.referralSourcePharmacist === "อื่นๆ" && !form.referralOtherPharmacist.trim()) {
        return "กรุณาระบุช่องทางอื่นๆ";
      }
      if (form.pharmacistType === "เภสัชกรฟูลไทม์" && !form.birthDatePharmacist) {
        return "กรุณาเลือกวันเกิด";
      }
    }

    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }

    setStatus("");
    setIsSubmitting(true);

    const isSales = form.positionApplied === "พนักงานขายหน้าร้าน";
    const resumeFileName = isSales ? form.resumeFileNameSales : form.resumeFileNamePharmacist;
    const resumeFileData = isSales ? form.resumeFileDataSales : form.resumeFileDataPharmacist;
    const resumeFileMime = isSales ? form.resumeFileMimeSales : form.resumeFileMimePharmacist;

    const payload = {
      submittedAt: new Date().toISOString(),
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      nickName: form.nickName.trim(),
      sex: form.sex,
      age: form.age.trim(),
      phone: form.phone.trim(),
      lineId: form.lineId.trim(),
      educationLevel: form.educationLevel.trim(),
      instituteName: form.instituteName.trim(),
      major: form.major.trim(),
      positionApplied: form.positionApplied,
      pharmacistType: form.positionApplied === "เภสัชกร" ? form.pharmacistType : "",
      pharmacistBranchPreference: form.positionApplied === "เภสัชกร" ? form.pharmacistBranchPreference : "",
      salesBranchPreference: form.positionApplied === "พนักงานขายหน้าร้าน" ? form.salesBranchPreference : "",
      licenseNumber: form.positionApplied === "เภสัชกร" ? form.licenseNumber.trim() : "",
      pharmacySchool: form.positionApplied === "เภสัชกร" ? form.pharmacySchool : "",
      pharmacySchoolOther: form.positionApplied === "เภสัชกร" ? form.pharmacySchoolOther.trim() : "",
      birthDate: isSales
        ? form.birthDateSales
        : form.pharmacistType === "เภสัชกรฟูลไทม์"
        ? form.birthDatePharmacist
        : "",
      workHistory: isSales ? form.workHistorySales.trim() : form.workHistoryPharmacist.trim(),
      expectedSalary: isSales ? form.expectedSalarySales.trim() : form.expectedSalaryPharmacist.trim(),
      availableStartDate: isSales ? form.availableStartDateSales : form.availableStartDatePharmacist,
      referralSource: isSales ? form.referralSourceSales : form.referralSourcePharmacist,
      referralOther: isSales ? form.referralOtherSales.trim() : form.referralOtherPharmacist.trim(),
      resumeFileName,
      resumeFileUrlOrBase64: resumeFileData,
      resumeFileMimeType: resumeFileMime,
      resumeFile: resumeFileData
        ? { fileName: resumeFileName, mimeType: resumeFileMime, base64: resumeFileData }
        : null,
    };

    try {
      const res = await fetch(SUBMIT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submit failed");
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Submit failed");

      setStatus("ส่งข้อมูลสำเร็จ ✅");
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      setStatus("ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  }

  const referenceData = {
    sales: {
      title: "พนักงานขายหน้าร้าน",
      image: SALES_REF_IMAGE,
      bullets: ["รายได้เริ่มต้นแข่งขันได้", "มีค่าคอมและโบนัส", "สวัสดิการพื้นฐานครบ"],
    },
    "pharm-full": {
      title: "เภสัชกรฟูลไทม์",
      image: PHARM_FULL_REF_IMAGE,
      bullets: ["รายได้ประจำ + อินเซนทีฟ", "สวัสดิการครบ", "ทำงานเป็นทีม"],
    },
    "pharm-part": {
      title: "เภสัชกรพาร์ทไทม์",
      image: PHARM_PART_REF_IMAGE,
      bullets: ["ค่าตอบแทนรายชั่วโมง", "เลือกกะทำงานได้", "เหมาะกับผู้มีงานหลัก"],
    },
  }[referenceStep];

  return (
    <div className={`page ${isDark ? "theme-dark" : ""}`}>
      <div className="form-card">
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setIsDark((v) => !v)}
          aria-label="Toggle dark mode"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>

        <div className="form-banner" role="img" aria-label="Company banner" />
        <div className="accent-bar" />

        <div className="form-body">
          <div>
            <h1 className="title">ลงทะเบียนสมัครงานร้านศิริชัยเภสัช</h1>
            <div className="title-note">(บริษัท เอสซีกรุ๊ป 1989 จำกัด)</div>
            <p className="subtitle">
              กรุณากรอกข้อมูลให้ครบถ้วน ระบบจะนำส่งเข้าสู่ทีม HR เพื่อพิจารณาคุณสมบัติต่อไป
            </p>
          </div>

          <div className="required-note">* ระบุว่าเป็นคำถามที่จำเป็น</div>

          <form onSubmit={onSubmit} className="form-grid">
            <div className="section-title">ข้อมูลพื้นฐาน</div>

            <div className="question-block">
              <label className="question-label" htmlFor="email">
                อีเมล<span className="required-star">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@email.com"
                value={form.email}
                onChange={onChange}
                className="gf-input"
                required
              />
            </div>

            <div className="question-block">
              <label className="question-label" htmlFor="fullName">
                ชื่อ-นามสกุล<span className="required-star">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="เช่น กิตติศักดิ์ ใจดี"
                value={form.fullName}
                onChange={onChange}
                className="gf-input"
                required
              />
            </div>

            <div className="question-block">
              <label className="question-label" htmlFor="nickName">
                ชื่อเล่น
              </label>
              <input
                id="nickName"
                name="nickName"
                type="text"
                placeholder="เช่น ต้น"
                value={form.nickName}
                onChange={onChange}
                className="gf-input"
              />
            </div>

            <div className="question-block">
              <div className="question-label">
                เพศ<span className="required-star">*</span>
              </div>
              <div className="option-grid">
                {["ชาย", "หญิง", "LGBTQ+"].map((item) => (
                  <label key={item} className="option-item">
                    <input type="radio" name="sex" value={item} checked={form.sex === item} onChange={onChange} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="question-block two-col">
              <label className="question-label" htmlFor="age">
                อายุ<span className="required-star">*</span>
                <input
                  id="age"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  placeholder="เช่น 25"
                  value={form.age}
                  onChange={onChange}
                  className="gf-input"
                  required
                />
              </label>

              <label className="question-label" htmlFor="phone">
                เบอร์โทร<span className="required-star">*</span>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="0xx-xxx-xxxx"
                  value={form.phone}
                  onChange={onChange}
                  className="gf-input"
                  required
                />
              </label>
            </div>

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

            {showReference && referenceData ? (
              <div className="reference-card">
                <div className="reference-image-wrap">
                  {referenceData.image ? (
                    <img src={referenceData.image} alt={referenceData.title} />
                  ) : (
                    <div className="reference-placeholder">{referenceData.title}</div>
                  )}
                </div>
                <div className="reference-body">
                  <h3>{referenceData.title}</h3>
                  <ul>
                    {referenceData.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button type="button" className="primary-btn" onClick={() => setBranchUnlocked(true)}>
                    สมัครตำแหน่งนี้
                  </button>
                  <div className="reference-hint">
                    ใส่ URL รูปใน SALES_REF_IMAGE / PHARM_*_REF_IMAGE ได้ตามต้องการ
                  </div>
                </div>
              </div>
            ) : null}

            {showSalesBranch ? (
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
            ) : null}

            {showPharmBranch ? (
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
            ) : null}

            <div className="submit-row">
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
              </button>
              {status ? <span className="status-text">{status}</span> : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
