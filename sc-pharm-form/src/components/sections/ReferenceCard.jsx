export default function ReferenceCard({ show, referenceData, onUnlock }) {
  if (!show || !referenceData) return null;

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
        <ul>
          {referenceData.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button type="button" className="primary-btn" onClick={() => onUnlock?.()}>
          สมัครตำแหน่งนี้
        </button>
        <div className="reference-hint">
          ใส่ URL รูปใน SALES_REF_IMAGE / PHARM_*_REF_IMAGE ได้ตามต้องการ
        </div>
      </div>
    </div>
  );
}
