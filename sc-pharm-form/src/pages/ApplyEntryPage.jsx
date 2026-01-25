export default function ApplyEntryPage({ onNavigate }) {
  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.location.assign(path);
  };

  return (
    <main className="entry-page">
      <div className="entry-shell">
        <header className="entry-header">
          <h1 className="entry-title">ร่วมเป็นส่วนหนึ่งของทีมศิริชัยเภสัช</h1>
          <p className="entry-subtitle">เลือกวิธีการสมัครที่คุณสะดวก</p>
        </header>

        <section className="entry-grid">
          <article className="entry-card entry-card--cv">
            <div className="entry-card-header">ฉันมี เรซูเม่ / CV แล้ว</div>
            <div className="entry-card-body">
              <div className="entry-card-subtitle">อัปโหลดไฟล์เรซูเม่ / CV ของคุณ</div>
              <div className="entry-card-media" aria-hidden="true">
                <svg viewBox="0 0 220 170" role="img" focusable="false">
                  <rect x="28" y="24" width="110" height="132" rx="8" fill="#ffffff" stroke="#9aa9c9" strokeWidth="4" />
                  <rect x="48" y="40" width="70" height="26" rx="4" fill="#4b6aa9" />
                  <text x="83" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill="#ffffff">CV</text>
                  <rect x="48" y="76" width="78" height="8" rx="4" fill="#c8d2e8" />
                  <rect x="48" y="92" width="70" height="8" rx="4" fill="#c8d2e8" />
                  <rect x="48" y="108" width="64" height="8" rx="4" fill="#c8d2e8" />
                  <circle cx="150" cy="118" r="28" fill="#1b63c8" />
                  <path d="M150 104v22M140 116l10-10 10 10" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <button
                className="entry-button entry-button--cv"
                type="button"
                onClick={() => goTo("/apply/cv")}
              >
                แนบเอกสาร
              </button>
            </div>
          </article>

          <article className="entry-card entry-card--form">
            <div className="entry-card-header">กรอกข้อมูลสมัครงาน</div>
            <div className="entry-card-body">
              <div className="entry-card-subtitle">กรอกข้อมูลในแบบฟอร์มของเรา</div>
              <div className="entry-card-media" aria-hidden="true">
                <svg viewBox="0 0 220 170" role="img" focusable="false">
                  <rect x="60" y="22" width="100" height="130" rx="8" fill="#ffffff" stroke="#c4a384" strokeWidth="4" />
                  <rect x="80" y="16" width="60" height="20" rx="6" fill="#7a5a40" />
                  <rect x="76" y="52" width="16" height="16" rx="4" fill="#f2f2f2" stroke="#d26f2d" strokeWidth="3" />
                  <path d="M80 60l4 4 6-8" stroke="#d26f2d" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <rect x="100" y="56" width="40" height="6" rx="3" fill="#c4b7aa" />
                  <rect x="76" y="78" width="16" height="16" rx="4" fill="#f2f2f2" stroke="#d26f2d" strokeWidth="3" />
                  <path d="M80 86l4 4 6-8" stroke="#d26f2d" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <rect x="100" y="82" width="40" height="6" rx="3" fill="#c4b7aa" />
                  <rect x="76" y="104" width="16" height="16" rx="4" fill="#f2f2f2" stroke="#d26f2d" strokeWidth="3" />
                  <path d="M80 112l4 4 6-8" stroke="#d26f2d" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <rect x="100" y="108" width="40" height="6" rx="3" fill="#c4b7aa" />
                  <rect x="24" y="82" width="42" height="52" rx="6" fill="#f1f1f1" stroke="#b9c3d8" strokeWidth="3" />
                  <circle cx="45" cy="100" r="9" fill="#f6c9a1" />
                  <rect x="38" y="112" width="16" height="18" rx="4" fill="#2f5da7" />
                  <rect x="150" y="60" width="46" height="70" rx="6" fill="#f7f7f7" stroke="#c4c4c4" strokeWidth="3" />
                  <circle cx="180" cy="108" r="12" fill="#1b63c8" />
                  <circle cx="180" cy="104" r="4" fill="#ffffff" />
                  <path d="M174 114c2.5-4 9.5-4 12 0" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M148 124l26-36 8 6-26 36z" fill="#1b63c8" />
                </svg>
              </div>
              <button
                className="entry-button entry-button--form"
                type="button"
                onClick={() => goTo("/apply/form")}
              >
                กรอกข้อมูล
              </button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
