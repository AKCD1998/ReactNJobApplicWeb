export default function SubmitRow({ status, isSubmitting }) {
  return (
    <div className="submit-row">
      <button type="submit" className="submit-btn cv-submit" disabled={isSubmitting}>
        {isSubmitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
      </button>
      {status ? <span className="status-text">{status}</span> : null}
    </div>
  );
}
