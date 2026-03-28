import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useProjectStore } from "../../../stores/useProjectStore";
import { useEditorStore } from "../../../stores/useEditorStore";
import { createNewPage } from "../../../types/project";
import type { Page } from "../../../types/project";
import { exportPageToFile, importPageFromFile } from "../../../lib/tauri";

function SortablePage({
  page,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  page: Page;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(page.name);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function commitRename() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== page.name) onRename(trimmed);
    setEditing(false);
  }

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-1 px-2 py-1">
      <button
        {...listeners}
        {...attributes}
        className="text-[#94a3b8] cursor-grab hover:text-[#64748b] p-0.5 shrink-0"
        title="Drag to reorder"
      >
        ⠿
      </button>

      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setValue(page.name);
              setEditing(false);
            }
          }}
          className="flex-1 text-xs px-1.5 py-1 border border-[#2563eb] rounded focus:outline-none"
        />
      ) : (
        <button
          onClick={onSelect}
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 text-left text-xs px-2 py-1.5 rounded transition-colors truncate ${
            isActive
              ? "bg-[#eff6ff] text-[#2563eb] font-medium"
              : "text-[#374151] hover:bg-[#f9fafb]"
          }`}
        >
          {page.name}
        </button>
      )}

      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-[#94a3b8] hover:text-red-500 text-xs p-0.5 shrink-0 transition-opacity"
        title="Delete page"
      >
        ×
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); exportPageToFile(page); }}
        className="opacity-0 group-hover:opacity-100 text-[#94a3b8] hover:text-[#374151] text-xs p-0.5 shrink-0 transition-opacity"
        title="Export page"
      >
        ↓
      </button>
    </div>
  );
}

export default function PagesPanel() {
  const project = useProjectStore((s) => s.project);
  const addPage = useProjectStore((s) => s.addPage);
  const updatePage = useProjectStore((s) => s.updatePage);
  const deletePage = useProjectStore((s) => s.deletePage);
  const reorderPages = useProjectStore((s) => s.reorderPages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const setActivePageId = useEditorStore((s) => s.setActivePageId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const pages = project?.pages.slice().sort((a, b) => a.order - b.order) ?? [];
  const activePage = pages.find((p) => p.id === activePageId) ?? null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = [...pages];
    reordered.splice(newIndex, 0, reordered.splice(oldIndex, 1)[0]);
    reorderPages(reordered.map((p) => p.id));
  }

  function handleAddPage() {
    const name = `Page ${pages.length + 1}`;
    const page = createNewPage(name, pages.length);
    addPage(page);
    setActivePageId(page.id);
  }

  async function handleImportPage() {
    const imported = await importPageFromFile();
    if (!imported) return;
    // Assign a fresh order and add
    const page: Page = { ...imported, order: pages.length };
    addPage(page);
    setActivePageId(page.id);
  }

  function handleDeletePage(pageId: string) {
    if (pages.length <= 1) return alert("Cannot delete the last page.");
    if (!confirm("Delete this page?")) return;
    deletePage(pageId);
    if (activePageId === pageId) {
      const remaining = pages.filter((p) => p.id !== pageId);
      setActivePageId(remaining[0]?.id ?? null);
    }
  }

  return (
    <div className="p-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {pages.map((page) => (
            <SortablePage
              key={page.id}
              page={page}
              isActive={page.id === activePageId}
              onSelect={() => setActivePageId(page.id)}
              onRename={(name) => {
                const updates: { name: string; slug?: string } = { name };
                if (page.slug !== "index") {
                  updates.slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || page.slug;
                }
                updatePage(page.id, updates);
              }}
              onDelete={() => handleDeletePage(page.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAddPage}
        className="w-full mt-2 text-xs text-[#2563eb] hover:bg-[#eff6ff] py-1.5 rounded transition-colors border border-dashed border-[#bfdbfe]"
      >
        + Add Page
      </button>
      <button
        onClick={handleImportPage}
        className="w-full mt-1 text-xs text-[#64748b] hover:bg-[#f9fafb] py-1.5 rounded transition-colors border border-dashed border-[#e2e8f0]"
      >
        ↑ Import Page
      </button>

      {activePage && <PageSEOSection page={activePage} onUpdate={(u) => updatePage(activePage.id, u)} />}
    </div>
  );
}

function PageSEOSection({ page, onUpdate }: { page: Page; onUpdate: (u: Partial<Page>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 border-t border-[#f0f0f0] pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold text-[#64748b] uppercase tracking-wide hover:text-[#374151] px-1"
      >
        <span>SEO</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-3 px-1">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#64748b]">Page Title</span>
            <input
              type="text"
              value={page.title ?? ""}
              onChange={(e) => onUpdate({ title: e.target.value || undefined })}
              placeholder="My Page | Site Name"
              className="border border-[#d1d5db] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#2563eb]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#64748b]">Meta Description</span>
            <textarea
              value={page.metaDescription ?? ""}
              onChange={(e) => onUpdate({ metaDescription: e.target.value || undefined })}
              placeholder="Brief page description for search engines…"
              rows={2}
              className="border border-[#d1d5db] rounded-lg px-2 py-1.5 text-xs resize-none focus:outline-none focus:border-[#2563eb]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#64748b]">OG Title</span>
            <input
              type="text"
              value={page.ogTitle ?? ""}
              onChange={(e) => onUpdate({ ogTitle: e.target.value || undefined })}
              placeholder="Social media title"
              className="border border-[#d1d5db] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#2563eb]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#64748b]">OG Image URL</span>
            <input
              type="text"
              value={page.ogImage ?? ""}
              onChange={(e) => onUpdate({ ogImage: e.target.value || undefined })}
              placeholder="https://example.com/og.jpg"
              className="border border-[#d1d5db] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#2563eb]"
            />
          </label>
        </div>
      )}
    </div>
  );
}
