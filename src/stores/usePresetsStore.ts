import { create } from "zustand";
import type { Block } from "../types/blocks";
import { nanoid } from "../types/nanoid";

const STORAGE_KEY = "stackpage_block_presets";

export interface BlockPreset {
  id: string;
  name: string;
  block: Block;
  createdAt: string;
}

function loadPresets(): BlockPreset[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function savePresets(presets: BlockPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

interface PresetsState {
  presets: BlockPreset[];
  savePreset: (name: string, block: Block) => void;
  deletePreset: (id: string) => void;
}

export const usePresetsStore = create<PresetsState>((set, get) => ({
  presets: loadPresets(),

  savePreset: (name, block) => {
    const preset: BlockPreset = {
      id: nanoid(),
      name,
      block: { ...block, id: nanoid() }, // give preset a new id
      createdAt: new Date().toISOString(),
    };
    const updated = [preset, ...get().presets];
    savePresets(updated);
    set({ presets: updated });
  },

  deletePreset: (id) => {
    const updated = get().presets.filter((p) => p.id !== id);
    savePresets(updated);
    set({ presets: updated });
  },
}));
