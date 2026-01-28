export default function SubmitRow({ status, isSubmitting, isDisabled }) {
  return (
    <div className="submit-row">
      <button
        type="submit"
        className={`submit-btn cv-submit ${isDisabled ? "submit-disabled" : ""}`}
        disabled={isSubmitting}
        aria-disabled={isDisabled ? "true" : undefined}
      >
        {isSubmitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
      </button>
      {status ? <span className="status-text">{status}</span> : null}
    </div>
  );
}
