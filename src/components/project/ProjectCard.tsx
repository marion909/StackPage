import type { ProjectMeta } from "../../types/project";
import { useI18n } from "../../i18n";

interface Props {
  meta: ProjectMeta;
  onOpen: () => void;
  onDelete: () => void;
  onRename: () => void;
  onDuplicate: () => void;
}

export default function ProjectCard({ meta, onOpen, onDelete, onRename, onDuplicate }: Props) {
  const { t } = useI18n();
  const date = new Date(meta.updatedAt).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:border-[#2563eb] hover:shadow-md transition-all group">
      {/* Preview area */}
      <div
        className="h-36 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={onOpen}
      >
        {meta.thumbnail ? (
          <img
            src={meta.thumbnail}
            alt={`${meta.name} preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl opacity-30">🌐</div>
        )}
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
        {(meta.author || (meta.tags && meta.tags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {meta.author && (
              <span className="text-xs text-[#94a3b8]">by {meta.author}</span>
            )}
            {meta.tags?.map((tag) => (
              <span key={tag} className="text-xs bg-[#f1f5f9] text-[#64748b] px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-[#94a3b8]">{t("project.updatedAt")} {date}</span>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onOpen}
              className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium"
            >
              {t("project.open")}
            </button>
            <button
              onClick={onRename}
              className="text-xs text-[#64748b] hover:text-[#374151] font-medium"
            >
              {t("project.rename")}
            </button>
            <button
              onClick={onDuplicate}
              className="text-xs text-[#64748b] hover:text-[#374151] font-medium"
            >
              {t("project.duplicate")}
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-600 font-medium"
            >
              {t("project.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
