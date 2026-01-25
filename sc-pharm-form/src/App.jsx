import { useCallback, useEffect, useState } from "react";
import JobApplicationForm from "./components/JobApplicationForm";
import ApplyEntryPage from "./pages/ApplyEntryPage";
import CvUploadPage from "./pages/CvUploadPage";
import "./App.css";
import "./index.css";
import "./pages/apply.css";

const normalizePath = (path) => {
  if (!path) return "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
};

export default function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback(
    (nextPath) => {
      const normalized = normalizePath(nextPath);
      if (normalized === path) return;
      window.history.pushState({}, "", normalized);
      setPath(normalized);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [path]
  );

  if (path === "/apply") {
    return <ApplyEntryPage onNavigate={navigate} />;
  }

  if (path === "/apply/cv") {
    return <CvUploadPage onNavigate={navigate} />;
  }

  if (path === "/apply/form" || path === "/") {
    return <JobApplicationForm />;
  }

  return <ApplyEntryPage onNavigate={navigate} />;
}
