import { useCallback, useEffect, useState } from "react";
import JobApplicationForm from "./components/JobApplicationForm";
import ApplyEntryPage from "./pages/ApplyEntryPage";
import CvUploadPage from "./pages/CvUploadPage";
import "./App.css";
import "./index.css";
import "./pages/apply.css";

const normalizePath = (path) => {
  if (!path) return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
};

const getHashPath = () => normalizePath(window.location.hash.replace(/^#/, ""));

export default function App() {
  const [path, setPath] = useState(() => getHashPath());

  useEffect(() => {
    const handleHashChange = () => {
      setPath(getHashPath());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback(
    (nextPath) => {
      const normalized = normalizePath(nextPath);
      if (normalized === path) return;
      window.location.hash = normalized;
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [path]
  );

  if (path === "/apply/form") {
    return <JobApplicationForm />;
  }

  if (path === "/apply/cv") {
    return <CvUploadPage onNavigate={navigate} />;
  }

  if (path === "/apply" || path === "/") {
    return <ApplyEntryPage onNavigate={navigate} />;
  }

  return <ApplyEntryPage onNavigate={navigate} />;
}
