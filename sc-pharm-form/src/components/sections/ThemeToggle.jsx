export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
          type="button"
          className="theme-toggle"
          onClick={onToggle}
          aria-label="Toggle dark mode"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>
  );
}
