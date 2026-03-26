import { useEditorStore } from "../stores/useEditorStore";
import Dashboard from "../components/project/Dashboard";
import EditorLayout from "../components/editor/EditorLayout";

export default function App() {
  const view = useEditorStore((s) => s.view);

  return view === "dashboard" ? <Dashboard /> : <EditorLayout />;
}
