import React, { useRef } from 'react';
import { Copy, Download, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { usePresets } from './PresetContext';

export default function PresetControl() {
  const {
    store,
    activePreset,
    switchPreset,
    createPreset,
    duplicatePreset,
    importPreset,
    renamePreset,
    deletePreset,
  } = usePresets();
  const importInputRef = useRef(null);

  const requestName = (message, initialValue) => {
    const value = window.prompt(message, initialValue)?.trim();
    return value || null;
  };

  return (
    <div className="preset-control" aria-label="Saved presets">
      <label>
        <span>Preset</span>
        <select
          value={activePreset?.id ?? ''}
          onChange={(event) => switchPreset(event.target.value)}
        >
          {store.presets.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
      </label>
      <div className="preset-actions">
        <button
          type="button"
          title="Create blank preset"
          aria-label="Create blank preset"
          onClick={() => {
            const name = requestName('Name this preset', 'New account');
            if (name) createPreset(name);
          }}
        ><Plus size={15} /></button>
        <button
          type="button"
          title="Duplicate preset"
          aria-label="Duplicate preset"
          onClick={() => {
            const name = requestName('Name the duplicate', `${activePreset?.name ?? 'Preset'} copy`);
            if (name) duplicatePreset(name);
          }}
        ><Copy size={15} /></button>
        <button
          type="button"
          title="Rename preset"
          aria-label="Rename preset"
          onClick={() => {
            const name = requestName('Rename this preset', activePreset?.name ?? '');
            if (name) renamePreset(name);
          }}
        ><Pencil size={15} /></button>
        <button
          type="button"
          title="Export preset"
          aria-label="Export preset"
          onClick={() => {
            const blob = new Blob(
              [JSON.stringify({ version: 1, preset: activePreset }, null, 2)],
              { type: 'application/json' },
            );
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${(activePreset?.name ?? 'preset').replace(/[^a-z0-9]+/gi, '-')}.json`;
            link.click();
            URL.revokeObjectURL(url);
          }}
        ><Download size={15} /></button>
        <button
          type="button"
          title="Import preset"
          aria-label="Import preset"
          onClick={() => importInputRef.current?.click()}
        ><Upload size={15} /></button>
        <button
          type="button"
          title="Delete preset"
          aria-label="Delete preset"
          disabled={store.presets.length <= 1}
          onClick={() => {
            if (window.confirm(`Delete preset "${activePreset?.name}"?`)) deletePreset();
          }}
        ><Trash2 size={15} /></button>
      </div>
      <input
        ref={importInputRef}
        className="visually-hidden"
        type="file"
        accept="application/json,.json"
        onChange={async (event) => {
          const [file] = event.target.files;
          if (!file) return;
          try {
            importPreset(JSON.parse(await file.text()));
          } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Unable to import preset.');
          } finally {
            event.target.value = '';
          }
        }}
      />
    </div>
  );
}
