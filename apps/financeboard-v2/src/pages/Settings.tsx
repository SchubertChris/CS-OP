import { useSettingsStore } from '../stores/settings.store';
import { Slider } from '../components/ui/Slider';
import { Panel } from '../components/ui/Panel';
import type { Theme, FontFamily } from '../types/settings';
import styles from './Settings.module.css';

const THEMES: { value: Theme; label: string; accent: string }[] = [
  { value: 'candlescope', label: 'Gold',    accent: '#d4a843' },
  { value: 'dark',        label: 'Blau',    accent: '#4d8fef' },
  { value: 'light',       label: 'Hell',    accent: '#0e7c75' },
  { value: 'ivory',       label: 'Ivory',   accent: '#946914' },
  { value: 'crimson',     label: 'Rot',     accent: '#ef4444' },
  { value: 'mono',        label: 'Mono',    accent: '#d4d4d4' },
];

const FONTS: { value: FontFamily; label: string }[] = [
  { value: 'default', label: 'Space Grotesk' },
  { value: 'inter',   label: 'Inter'         },
  { value: 'barlow',  label: 'Barlow'        },
  { value: 'outfit',  label: 'Outfit'        },
  { value: 'syne',    label: 'Syne'          },
];

export function Settings() {
  const { settings, set } = useSettingsStore();

  return (
    <div className={styles.page}>
      {/* Erscheinungsbild */}
      <Panel>
        <h2 className={styles.cardTitle}>Erscheinungsbild</h2>

        <div className={styles.section}>
          <span className={styles.label}>Theme</span>
          <div className={styles.themeGrid}>
            {THEMES.map((t) => (
              <button
                key={t.value}
                className={[styles.themeBtn, settings.theme === t.value ? styles.active : ''].join(' ')}
                style={{ '--theme-accent': t.accent } as React.CSSProperties}
                onClick={() => set({ theme: t.value })}
              >
                <span className={styles.themeColor} />
                <span className={styles.themeLabel}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <Slider
            label="Glas-Unschärfe"
            value={settings.blurPx}
            min={0}
            max={60}
            step={1}
            formatValue={(v) => `${v}px`}
            onChange={(v) => set({ blurPx: v })}
          />
        </div>

        <div className={styles.section}>
          <Slider
            label="Schriftgröße"
            value={settings.fontSize}
            min={12}
            max={18}
            step={1}
            formatValue={(v) => `${v}px`}
            onChange={(v) => set({ fontSize: v })}
          />
        </div>
      </Panel>

      {/* Schriftart */}
      <Panel>
        <h2 className={styles.cardTitle}>Schriftart</h2>
        <div className={styles.fontGrid}>
          {FONTS.map((f) => (
            <button
              key={f.value}
              className={[styles.fontBtn, settings.font === f.value ? styles.active : ''].join(' ')}
              data-font={f.value === 'default' ? undefined : f.value}
              onClick={() => set({ font: f.value })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Panel>

      {/* Verhalten */}
      <Panel>
        <h2 className={styles.cardTitle}>Verhalten</h2>

        <div className={styles.toggleRow}>
          <div>
            <span className={styles.label}>Automatisch speichern</span>
            <span className={styles.hint}>Änderungen sofort sichern</span>
          </div>
          <button
            className={[styles.toggle, settings.autosave ? styles.toggleOn : ''].join(' ')}
            onClick={() => set({ autosave: !settings.autosave })}
            role="switch"
            aria-checked={settings.autosave}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>

        <div className={styles.toggleRow}>
          <div>
            <span className={styles.label}>Tooltips anzeigen</span>
            <span className={styles.hint}>Erklärungen beim Hover</span>
          </div>
          <button
            className={[styles.toggle, settings.tooltips ? styles.toggleOn : ''].join(' ')}
            onClick={() => set({ tooltips: !settings.tooltips })}
            role="switch"
            aria-checked={settings.tooltips}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>

        <div className={styles.fieldRow}>
          <label className={styles.label}>Zahltag</label>
          <input
            type="number"
            className={styles.input}
            min={1}
            max={31}
            value={settings.zahltag}
            onChange={(e) => set({ zahltag: Math.min(31, Math.max(1, Number(e.target.value))) })}
          />
        </div>

        <div className={styles.fieldRow}>
          <label className={styles.label}>Benutzername</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Dein Name"
            value={settings.userName}
            onChange={(e) => set({ userName: e.target.value })}
          />
        </div>
      </Panel>
    </div>
  );
}
