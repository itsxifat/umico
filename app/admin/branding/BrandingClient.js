'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminInput';
import styles from './branding.module.css';

const DEFAULT_LIGHT = { primary: '#F4D4CE', secondary: '#3B2418', accent: '#BA9371', background: '#FAF6F1', text: '#2A1810' };
const DEFAULT_DARK = { primary: '#E8B5AD', secondary: '#F0E6DC', accent: '#C9A57A', background: '#1A110C', text: '#F5EDE4' };

export default function BrandingClient({ initial }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  const [siteName, setSiteName] = useState(initial?.siteName || '');
  const [tagline, setTagline] = useState(initial?.tagline || '');
  const [siteDescription, setSiteDescription] = useState(initial?.siteDescription || '');
  const [lightPalette, setLightPalette] = useState({ ...DEFAULT_LIGHT, ...(initial?.lightPalette || {}) });
  const [darkPalette, setDarkPalette] = useState({ ...DEFAULT_DARK, ...(initial?.darkPalette || {}) });
  const [announcementBar, setAnnouncementBar] = useState({
    enabled: false, text: '', link: '', ...(initial?.announcementBar || {})
  });
  const [footerCopyright, setFooterCopyright] = useState(initial?.footerCopyright || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initial?.logoLight || '');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(initial?.maintenanceMode?.enabled || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(initial?.maintenanceMode?.message || '');

  // Live-preview palette changes by updating CSS vars on the page
  useEffect(() => {
    const style = document.documentElement.style;
    style.setProperty('--color-primary', lightPalette.primary || '');
    style.setProperty('--color-secondary', lightPalette.secondary || '');
    style.setProperty('--color-accent', lightPalette.accent || '');
    style.setProperty('--color-background', lightPalette.background || '');
    style.setProperty('--color-text', lightPalette.text || '');
  }, [lightPalette]);

  const onLogoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('siteName', siteName); form.append('tagline', tagline);
      form.append('siteDescription', siteDescription);
      form.append('lightPalette', JSON.stringify(lightPalette));
      form.append('darkPalette', JSON.stringify(darkPalette));
      form.append('announcementBar', JSON.stringify(announcementBar));
      form.append('footerCopyright', footerCopyright);
      form.append('maintenanceMode', JSON.stringify({ enabled: maintenanceEnabled, message: maintenanceMessage }));
      if (logoFile) form.append('logoLight', logoFile);

      const res = await fetch('/api/admin/site-settings', { method: 'PATCH', body: form });
      const json = await res.json();
      if (json.success) {
        toast('Settings saved. Refresh the public site to see changes.', { type: 'success' });
      } else {
        toast(json.message || 'Save failed.', { type: 'error' });
      }
    } catch {
      toast('Network error.', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'identity', label: 'Identity' },
    { id: 'colors', label: 'Colors' },
    { id: 'announcement', label: 'Announcement bar' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const COLOR_FIELDS = [
    { key: 'primary', label: 'Primary color', hint: 'Main brand color — buttons, highlights' },
    { key: 'secondary', label: 'Secondary color', hint: 'Deep contrast color — header text, dark accents' },
    { key: 'accent', label: 'Accent color', hint: 'Warm mid-tone — hover states, tags' },
    { key: 'background', label: 'Background', hint: 'Page background — usually cream or off-white' },
    { key: 'text', label: 'Text color', hint: 'Primary text color' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.id} type="button"
            className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'identity' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Site identity</h2>
            <AdminInput label="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            <AdminInput label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)}
              hint="Short brand statement shown in header and SEO." />
            <AdminTextarea label="Site description" value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)} rows={3}
              hint="Used as default meta description." />
            <div>
              <div className={styles.logoLabel}>Logo (light mode)</div>
              {logoPreview && <img src={logoPreview} alt="Logo" className={styles.logoPreview} />}
              <input type="file" accept="image/*" onChange={onLogoChange} className={styles.fileInput} />
              <p className={styles.hint}>PNG or SVG recommended. Will replace the text wordmark.</p>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className={styles.twoCol}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Light mode palette</h2>
              <p className={styles.hint}>Changes preview live below. Click Save to persist.</p>
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <div key={key} className={styles.colorRow}>
                  <div className={styles.colorPreview} style={{ background: lightPalette[key] }} />
                  <div className={styles.colorFields}>
                    <AdminInput label={label} value={lightPalette[key] || ''}
                      onChange={(e) => setLightPalette((p) => ({ ...p, [key]: e.target.value }))}
                      hint={hint} />
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Dark mode palette</h2>
              <p className={styles.hint}>Applied when user activates dark mode.</p>
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <div key={key} className={styles.colorRow}>
                  <div className={styles.colorPreview} style={{ background: darkPalette[key] }} />
                  <div className={styles.colorFields}>
                    <AdminInput label={label} value={darkPalette[key] || ''}
                      onChange={(e) => setDarkPalette((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcement' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Announcement bar</h2>
            <label className={styles.toggle}>
              <input type="checkbox" checked={announcementBar.enabled}
                onChange={(e) => setAnnouncementBar((p) => ({ ...p, enabled: e.target.checked }))} />
              <span>Show announcement bar at top of site</span>
            </label>
            <AdminInput label="Message text" value={announcementBar.text}
              onChange={(e) => setAnnouncementBar((p) => ({ ...p, text: e.target.value }))}
              placeholder="e.g. Free shipping on orders over ৳999" />
            <AdminInput label="Link URL (optional)" value={announcementBar.link}
              onChange={(e) => setAnnouncementBar((p) => ({ ...p, link: e.target.value }))} />
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Maintenance mode</h2>
            <label className={styles.toggle}>
              <input type="checkbox" checked={maintenanceEnabled}
                onChange={(e) => setMaintenanceEnabled(e.target.checked)} />
              <span>Enable maintenance mode (hides public site)</span>
            </label>
            <AdminTextarea label="Maintenance message" value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)} rows={2} />
            <h2 className={styles.sectionTitle} style={{ marginTop: 'var(--s-4)' }}>Footer</h2>
            <AdminInput label="Copyright text" value={footerCopyright}
              onChange={(e) => setFooterCopyright(e.target.value)}
              placeholder={`© ${new Date().getFullYear()} UMICO`} />
          </div>
        )}

        <div className={styles.saveRow}>
          <AdminBtn onClick={onSave} loading={saving}>Save settings</AdminBtn>
        </div>
      </div>
    </div>
  );
}
