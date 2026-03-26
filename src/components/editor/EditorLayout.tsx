import Topbar from "./Topbar";
import LeftSidebar from "./Sidebar/LeftSidebar";
import RightSidebar from "./Sidebar/RightSidebar";
import Canvas from "./Canvas";
import ExportDialog from "../export/ExportDialog";
import DeployDialog from "../deploy/DeployDialog";
import ThemeEditorModal from "./ThemeEditorModal";
import { useEditorStore } from "../../stores/useEditorStore";

export default function EditorLayout() {
  const isExportOpen = useEditorStore((s) => s.isExportDialogOpen);
  const isDeployOpen = useEditorStore((s) => s.isDeployDialogOpen);
  const isThemeOpen = useEditorStore((s) => s.isThemeEditorOpen);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f1f5f9]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
      {isExportOpen && <ExportDialog />}
      {isDeployOpen && <DeployDialog />}
      {isThemeOpen && <ThemeEditorModal />}
    </div>
  );
}
