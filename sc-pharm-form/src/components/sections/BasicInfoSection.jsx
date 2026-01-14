export default function BasicInfoSection({ form, onChange }) {
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



    </>
  )
}
