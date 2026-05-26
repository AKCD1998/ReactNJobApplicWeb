export default function ReferenceCard({ referenceData }) {
  const data = referenceData || {
    title: "กรุณาระบุสายงานที่ต้องการสมัคร",
    image: "",
    sections: [
      {
        heading: "รายละเอียด",
        items: ["กรุณาระบุสายงานที่ต้องการสมัคร"],
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
              {section.items.map((item) => {
                const text = typeof item === "string" ? item : item.text;
                const className = typeof item === "string" ? "" : item.className || "";

                return (
                  <li key={text} className={className}>
                    {text}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {data.note ? <p className="ref-note">{data.note}</p> : null}
      </div>
    </div>
  );
}
