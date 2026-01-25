const stripPhoneDigits = (value) => String(value || "").replace(/\D/g, "").slice(0, 10);

const formatThaiPhone = (digits) => {
  if (!digits) return "";
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 10);
  return [part1, part2, part3].filter(Boolean).join("-");
};

export default function BasicInfoSection({ form, onChange, errors }) {
  const phoneDigits = stripPhoneDigits(form.phone);

  const handlePhoneChange = (event) => {
    const digits = stripPhoneDigits(event.target.value);
    onChange({ target: { name: "phone", value: digits } });
  };

  return (
    <>
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
        className={`gf-input ${errors?.email ? "is-invalid" : ""}`}
        required
      />
      {errors?.email ? <div className="error-text">{errors.email.message}</div> : null}
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
          className={`gf-input ${errors?.fullName ? "is-invalid" : ""}`}
          required
        />
        {errors?.fullName ? <div className="error-text">{errors.fullName.message}</div> : null}
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

        <div className={`option-grid ${errors?.sex ? "is-invalid" : ""}`} id="sex-group">
          {["ชาย", "หญิง", "LGBTQ+"].map((item) => (
            <label key={item} className="option-item">
              <input type="radio" name="sex" value={item} checked={form.sex === item} onChange={onChange} />
              <span>{item}</span>
            </label>
          ))}
        </div>
        {errors?.sex ? <div className="error-text">{errors.sex.message}</div> : null}
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
            className={`gf-input ${errors?.age ? "is-invalid" : ""}`}
            required
          />
        </label>
        {errors?.age ? <div className="error-text">{errors.age.message}</div> : null}



        <label className="question-label" htmlFor="phone">

          เบอร์โทร<span className="required-star">*</span>
          
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="0xx-xxx-xxxx"
            value={formatThaiPhone(phoneDigits)}
            onChange={handlePhoneChange}
            className={`gf-input ${errors?.phone ? "is-invalid" : ""}`}
            inputMode="numeric"
            autoComplete="tel"
            required
          />
        </label>
        {errors?.phone ? <div className="error-text">{errors.phone.message}</div> : null}
      </div>



    </>
  )
}
