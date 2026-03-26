import type { ProjectMeta } from "../../types/project";

interface Props {
  meta: ProjectMeta;
  onOpen: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ meta, onOpen, onDelete }: Props) {
  const date = new Date(meta.updatedAt).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:border-[#2563eb] hover:shadow-md transition-all group">
      {/* Preview area */}
      <div
        className="h-36 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] flex items-center justify-center cursor-pointer"
        onClick={onOpen}
      >
        <div className="text-4xl opacity-30">🌐</div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-semibold text-[#1e293b] text-sm truncate cursor-pointer hover:text-[#2563eb]"
          onClick={onOpen}
        >
          {meta.name}
        </h3>
        {meta.description && (
          <p className="text-xs text-[#64748b] mt-0.5 truncate">{meta.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#94a3b8]">Updated {date}</span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onOpen}
              className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium"
            >
              Open
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-600 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
