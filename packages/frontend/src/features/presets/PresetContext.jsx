import React, { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorageState from '../../hooks/useLocalStorageState';
import { createEmptyPreset, migrateLegacyPresetStore } from './presetStore';

const PRESET_STORAGE_KEY = 'pnc-planner-presets-v1';
const PresetContext = createContext(null);

export function PresetProvider({ children }) {
  const [store, setStore] = useLocalStorageState(
    PRESET_STORAGE_KEY,
    () => migrateLegacyPresetStore(),
  );
  const activePreset = store.presets.find((preset) => preset.id === store.activePresetId)
    ?? store.presets[0];

  const updateActivePreset = useCallback((updater) => {
    setStore((current) => ({
      ...current,
      presets: current.presets.map((preset) => {
        if (preset.id !== current.activePresetId) return preset;
        const next = updater(preset);
        return { ...next, updatedAt: new Date().toISOString() };
      }),
    }));
  }, [setStore]);

  const actions = useMemo(() => ({
    switchPreset(id) {
      setStore((current) => (
        current.presets.some((preset) => preset.id === id)
          ? { ...current, activePresetId: id }
          : current
      ));
    },
    createPreset(name) {
      const preset = createEmptyPreset(name);
      setStore((current) => ({
        ...current,
        activePresetId: preset.id,
        presets: [...current.presets, preset],
      }));
    },
    duplicatePreset(name) {
      setStore((current) => {
        const source = current.presets.find((preset) => preset.id === current.activePresetId);
        if (!source) return current;
        const copy = {
          ...JSON.parse(JSON.stringify(source)),
          id: globalThis.crypto?.randomUUID?.()
            ?? `preset-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name,
          updatedAt: new Date().toISOString(),
        };
        return {
          ...current,
          activePresetId: copy.id,
          presets: [...current.presets, copy],
        };
      });
    },
    importPreset(value) {
      const source = value?.preset ?? value;
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        throw new TypeError('The selected file does not contain a preset.');
      }
      const preset = {
        ...createEmptyPreset(
          typeof source.name === 'string' ? `${source.name} imported` : 'Imported preset',
        ),
      };
      [
        'researchSelections',
        'buildingSelections',
        'researchLoadout',
        'buildingLoadout',
        'enabledResearch',
        'enabledResearchCategories',
        'enabledBuildings',
        'goals',
      ].forEach((field) => {
        if (source[field] != null && typeof source[field] === 'object') {
          preset[field] = JSON.parse(JSON.stringify(source[field]));
        }
      });
      setStore((current) => ({
        ...current,
        activePresetId: preset.id,
        presets: [...current.presets, preset],
      }));
    },
    renamePreset(name) {
      updateActivePreset((preset) => ({ ...preset, name }));
    },
    deletePreset() {
      setStore((current) => {
        if (current.presets.length <= 1) return current;
        const index = current.presets.findIndex(
          (preset) => preset.id === current.activePresetId,
        );
        const presets = current.presets.filter(
          (preset) => preset.id !== current.activePresetId,
        );
        return {
          ...current,
          presets,
          activePresetId: presets[Math.max(0, index - 1)]?.id ?? presets[0].id,
        };
      });
    },
  }), [setStore, updateActivePreset]);

  const value = useMemo(() => ({
    store,
    activePreset,
    updateActivePreset,
    ...actions,
  }), [store, activePreset, updateActivePreset, actions]);

  return <PresetContext.Provider value={value}>{children}</PresetContext.Provider>;
}

export function usePresets() {
  const context = useContext(PresetContext);
  if (!context) throw new Error('usePresets must be used inside PresetProvider.');
  return context;
}

export function usePresetField(field, fallback) {
  const { activePreset, updateActivePreset } = usePresets();
  const value = activePreset?.[field] ?? fallback;
  const setValue = useCallback((nextValue) => {
    updateActivePreset((preset) => {
      const currentValue = preset[field] ?? fallback;
      return {
        ...preset,
        [field]: typeof nextValue === 'function' ? nextValue(currentValue) : nextValue,
      };
    });
  }, [field, fallback, updateActivePreset]);

  return [value, setValue];
}
