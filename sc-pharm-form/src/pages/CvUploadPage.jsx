import { useRef, useState } from "react";
import { CV_SUBMIT_URL } from "../components/constants/options";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
};

const isPdfFile = (file) => {
  if (!file) return false;
  const name = file.name?.toLowerCase() || "";
  return file.type === "application/pdf" || name.endsWith(".pdf");
};

function StatusModal({ type, onClose }) {
  const isSuccess = type === "success";

  return (
    <div className="status-overlay" role="dialog" aria-modal="true">
      <div className="status-card">
        <div className={`status-icon ${isSuccess ? "success" : "error"}`}>
          {isSuccess ? (
            <svg className="status-svg" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="status-circle" cx="26" cy="26" r="24" fill="none" />
              <path
                className="status-check"
                fill="none"
                d="M14 27l7 7 17-17"
              />
            </svg>
          ) : (
            <svg className="status-svg" viewBox="0 0 52 52" aria-hidden="true">
              <circle className="status-circle" cx="26" cy="26" r="24" fill="none" />
              <path className="status-cross" fill="none" d="M17 17l18 18M35 17L17 35" />
            </svg>
          )}
        </div>
        <div className="status-message">
          {isSuccess ? (
            <>
              ส่งเรซูเม่เรียบร้อย
              <br />
              ทางเราจะติดต่อกลับไปอย่างเร็วที่สุด
            </>
          ) : (
            <>ส่งไม่สำเร็จ กรุณาลองใหม่</>
          )}
        </div>
        <button className="status-button" type="button" onClick={onClose}>
          ปิด
        </button>
      </div>
    </div>
  );
}

export default function CvUploadPage({ onNavigate }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null);

  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.location.assign(path);
  };

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setFile = (file) => {
    if (!file) return;

    if (!isPdfFile(file)) {
      setError("กรุณาเลือกไฟล์ PDF เท่านั้น");
      setSelectedFile(null);
      resetInput();
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 10MB");
      setSelectedFile(null);
      resetInput();
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    setFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    setFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile || isSubmitting) return;

    setIsSubmitting(true);
    setModalType(null);

    const formData = new FormData();
    formData.append("cv", selectedFile);
    formData.append("position", "เภสัชกร");
    formData.append("source", "quick_cv");

    try {
      const response = await fetch(CV_SUBMIT_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setModalType("success");
    } catch (submitError) {
      console.error("CV upload error:", submitError);
      setModalType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="cv-page">
      <div className="cv-shell">
        <button className="cv-back" type="button" onClick={() => goTo("/apply")}>
          ← กลับไปหน้าเลือกวิธีสมัคร
        </button>

        <header className="cv-header">
          <h1 className="cv-title">แนบเรซูเม่ / CV</h1>
          <p className="cv-subtitle">อัปโหลดไฟล์ PDF เพื่อส่งใบสมัครอย่างรวดเร็ว</p>
        </header>

        <section
          className={`cv-dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openPicker}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openPicker();
            }
          }}
        >
          <div className="cv-drop-content">
            <div className="cv-plus" aria-hidden="true">
              +
            </div>
            <div className="cv-drop-text">
              คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์มาวางที่หน้านี้
            </div>
            <div className="cv-drop-hint">รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 10MB</div>
          </div>
          <input
            ref={fileInputRef}
            className="cv-file-input"
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
          />
        </section>

        {error ? <div className="cv-error">{error}</div> : null}

        {selectedFile ? (
          <div className="cv-file-meta">
            <div className="cv-file-info">
              <div className="cv-file-name">{selectedFile.name}</div>
              <div className="cv-file-size">{formatFileSize(selectedFile.size)}</div>
            </div>
            <button className="cv-change" type="button" onClick={openPicker}>
              เปลี่ยนไฟล์
            </button>
          </div>
        ) : null}

        <button
          className="cv-submit"
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || isSubmitting}
        >
          {isSubmitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
        </button>
      </div>

      {modalType ? (
        <StatusModal type={modalType} onClose={() => setModalType(null)} />
      ) : null}
    </main>
  );
}
