import { useEditorStore } from "../../../stores/useEditorStore";
import PagesPanel from "./PagesPanel";
import ComponentsPanel from "./ComponentsPanel";

export default function LeftSidebar() {
  const tab = useEditorStore((s) => s.leftSidebarTab);
  const setTab = useEditorStore((s) => s.setLeftSidebarTab);

  return (
    <aside className="w-60 bg-white border-r border-[#e2e8f0] flex flex-col shrink-0 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#e2e8f0] shrink-0">
        <button
          onClick={() => setTab("pages")}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
            tab === "pages"
              ? "text-[#2563eb] border-b-2 border-[#2563eb]"
              : "text-[#64748b] hover:text-[#1e293b]"
          }`}
        >
          Pages
        </button>
        <button
          onClick={() => setTab("components")}
          className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
            tab === "components"
              ? "text-[#2563eb] border-b-2 border-[#2563eb]"
              : "text-[#64748b] hover:text-[#1e293b]"
          }`}
        >
          Components
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "pages" ? <PagesPanel /> : <ComponentsPanel />}
      </div>
    </aside>
  );
}
