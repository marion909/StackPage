const ONBOARDING_KEY = "stackpage_onboarded";

export function hasSeenOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingSeen() {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

interface Props {
  onCreateProject: () => void;
  onDismiss: () => void;
}

export default function OnboardingModal({ onCreateProject, onDismiss }: Props) {
  function handleCreate() {
    markOnboardingSeen();
    onCreateProject();
  }

  function handleDismiss() {
    markOnboardingSeen();
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#2563eb] to-[#7c3aed] px-8 py-10 text-center">
          <div className="text-5xl mb-4">🌐</div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to StackPage</h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Build beautiful websites visually — no coding required. Drag blocks onto the canvas,
            customize your theme, and export clean HTML in one click.
          </p>
        </div>

        {/* Features */}
        <div className="px-8 py-6 flex flex-col gap-3">
          {[
            { icon: "🧱", label: "Drag-and-drop blocks onto the canvas" },
            { icon: "🎨", label: "Customize colors, fonts, and layout" },
            { icon: "📦", label: "Export a production-ready static site" },
            { icon: "🚀", label: "Deploy via FTP in a single click" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm text-[#374151]">
              <span className="text-xl shrink-0">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={handleCreate}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Create my first project →
          </button>
          <button
            onClick={handleDismiss}
            className="w-full text-[#64748b] hover:text-[#374151] py-2 text-sm transition-colors"
          >
            I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
