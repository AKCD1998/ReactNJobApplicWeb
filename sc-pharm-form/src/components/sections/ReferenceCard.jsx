export default function ReferenceCard({ show, referenceData, onUnlock }) {
  if (!show || !referenceData) return null;
  const showHint = import.meta.env.DEV;

  return (
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
        {referenceData.sections?.map((section) => (
          <div key={section.heading} className="ref-section">
            <h4 className="ref-heading">{section.heading}</h4>
            <ul className="ref-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        {referenceData.note ? <p className="ref-note">{referenceData.note}</p> : null}
        <button type="button" className="primary-btn" onClick={() => onUnlock?.()}>
          สมัครตำแหน่งนี้
        </button>
        {showHint ? (
          <div className="reference-hint">
            ใส่ URL รูปใน SALES_REF_IMAGE / PHARM_*_REF_IMAGE ได้ตามต้องการ
          </div>
        ) : null}
      </div>
    </div>
  );
}
