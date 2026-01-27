export default function ReferenceCard({ referenceData }) {
  const data = referenceData || {
    title: "ข้อมูลอ้างอิง",
    image: "",
    sections: [
      {
        heading: "รายละเอียด",
        items: ["ยังไม่มีข้อมูลอ้างอิงสำหรับตำแหน่งนี้"],
      },
    ],
    note: "",
  };

  return (
    <div className="reference-card">
      <div className="reference-image-wrap">
        {data.image ? (
          <img src={data.image} alt={data.title} />
        ) : (
          <div className="reference-placeholder">{data.title}</div>
        )}
      </div>
      <div className="reference-body">
        <h3>{data.title}</h3>
        {data.sections?.map((section) => (
          <div key={section.heading} className="ref-section">
            <h4 className="ref-heading">{section.heading}</h4>
            <ul className="ref-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        {data.note ? <p className="ref-note">{data.note}</p> : null}
      </div>
    </div>
  );
}
