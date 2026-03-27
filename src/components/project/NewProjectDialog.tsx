import { useState } from "react";
import { PAGE_TEMPLATES } from "../../lib/pageTemplates";
import type { PageTemplate } from "../../lib/pageTemplates";

interface Props {
  onClose: () => void;
  onCreate: (name: string, description: string, template: PageTemplate) => void;
  onCreateOffline: (name: string, description: string, template: PageTemplate) => void;
}

export default function NewProjectDialog({ onClose, onCreate, onCreateOffline }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate>(PAGE_TEMPLATES[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), selectedTemplate);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Project name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Website"
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`flex items-start gap-2 p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedTemplate.id === tpl.id
                      ? "border-[#2563eb] bg-[#eff6ff]"
                      : "border-[#e2e8f0] hover:border-[#bfdbfe]"
                  }`}
                >
                  <span className="text-xl leading-none mt-0.5">{tpl.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[#1e293b]">{tpl.name}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{tpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#d1d5db] text-[#374151] px-4 py-2 rounded-lg text-sm hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Choose Folder & Create
            </button>
          </div>
          <button
            type="button"
            onClick={() => onCreateOffline(name.trim() || "New Project", description.trim(), selectedTemplate)}
            className="w-full text-xs text-[#64748b] hover:text-[#374151] underline"
          >
            Create without saving (in-memory only)
          </button>
        </form>
      </div>
    </div>
  );
}
