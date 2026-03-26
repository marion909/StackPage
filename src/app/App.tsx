import { useEditorStore } from "../stores/useEditorStore";
import Dashboard from "./project/Dashboard";
import EditorLayout from "./editor/EditorLayout";

export default function App() {
  const view = useEditorStore((s) => s.view);

  return view === "dashboard" ? <Dashboard /> : <EditorLayout />;
}
