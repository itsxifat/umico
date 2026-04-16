'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import AdminBtn from '@/components/admin/AdminBtn';
import { AdminInput, AdminSelect, AdminTextarea } from '@/components/admin/AdminInput';

const DEFAULT_LIGHT = { primary: '#F4D4CE', secondary: '#3B2418', accent: '#BA9371', background: '#FAF6F1', text: '#2A1810' };
const DEFAULT_DARK = { primary: '#E8B5AD', secondary: '#F0E6DC', accent: '#C9A57A', background: '#1A110C', text: '#F5EDE4' };

const sectionCls = 'bg-surface border border-line p-6 flex flex-col gap-4';
const sectionTitleCls = 'font-sans text-xs font-semibold tracking-widest uppercase text-muted pb-3 border-b border-line';
const tabCls = (active) =>
  `px-5 py-3 text-xs tracking-wide uppercase border-b-2 mb-[-1px] whitespace-nowrap transition-colors ${
    active ? 'text-ink border-secondary' : 'text-muted-fg border-transparent hover:text-ink'
  }`;

export default function BrandingClient({ initial }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');

  const [siteName, setSiteName] = useState(initial?.siteName || '');
  const [tagline, setTagline] = useState(initial?.tagline || '');
  const [siteDescription, setSiteDescription] = useState(initial?.siteDescription || '');
  const [lightPalette, setLightPalette] = useState({ ...DEFAULT_LIGHT, ...(initial?.lightPalette || {}) });
  const [darkPalette, setDarkPalette] = useState({ ...DEFAULT_DARK, ...(initial?.darkPalette || {}) });
  const [announcementBar, setAnnouncementBar] = useState({ enabled: false, text: '', link: '', ...(initial?.announcementBar || {}) });
  const [footerCopyright, setFooterCopyright] = useState(initial?.footerCopyright || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initial?.logoLight || '');
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(initial?.maintenanceMode?.enabled || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(initial?.maintenanceMode?.message || '');

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
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex border-b border-line gap-0 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={tabCls(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {/* Identity */}
        {activeTab === 'identity' && (
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Site identity</h2>
            <AdminInput label="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            <AdminInput label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} hint="Short brand statement shown in header and SEO." />
            <AdminTextarea label="Site description" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={3} hint="Used as default meta description." />
            <div className="flex flex-col gap-2">
              <span className="text-xs tracking-wide uppercase text-muted-fg font-medium">Logo (light mode)</span>
              {logoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo" className="max-h-20 max-w-[240px] object-contain border border-line p-3 bg-surface-alt block mb-3" />
              )}
              <input type="file" accept="image/*" onChange={onLogoChange} className="text-xs text-muted-fg cursor-pointer" />
              <p className="text-xs text-muted">PNG or SVG recommended. Will replace the text wordmark.</p>
            </div>
          </div>
        )}

        {/* Colors */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
            <div className={sectionCls}>
              <h2 className={sectionTitleCls}>Light mode palette</h2>
              <p className="text-xs text-muted">Changes preview live. Click Save to persist.</p>
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <div key={key} className="flex gap-4 items-start">
                  <div className="w-12 h-12 border border-line flex-shrink-0 mt-[22px]" style={{ background: lightPalette[key] }} />
                  <div className="flex-1">
                    <AdminInput label={label} value={lightPalette[key] || ''}
                      onChange={(e) => setLightPalette((p) => ({ ...p, [key]: e.target.value }))} hint={hint} />
                  </div>
                </div>
              ))}
            </div>
            <div className={sectionCls}>
              <h2 className={sectionTitleCls}>Dark mode palette</h2>
              <p className="text-xs text-muted">Applied when user activates dark mode.</p>
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex gap-4 items-start">
                  <div className="w-12 h-12 border border-line flex-shrink-0 mt-[22px]" style={{ background: darkPalette[key] }} />
                  <div className="flex-1">
                    <AdminInput label={label} value={darkPalette[key] || ''}
                      onChange={(e) => setDarkPalette((p) => ({ ...p, [key]: e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcement */}
        {activeTab === 'announcement' && (
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Announcement bar</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
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

        {/* Advanced */}
        {activeTab === 'advanced' && (
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Maintenance mode</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={maintenanceEnabled}
                onChange={(e) => setMaintenanceEnabled(e.target.checked)} />
              <span>Enable maintenance mode (hides public site)</span>
            </label>
            <AdminTextarea label="Maintenance message" value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)} rows={2} />
            <h2 className={`${sectionTitleCls} mt-4`}>Footer</h2>
            <AdminInput label="Copyright text" value={footerCopyright}
              onChange={(e) => setFooterCopyright(e.target.value)}
              placeholder={`© ${new Date().getFullYear()} UMICO`} />
          </div>
        )}

        <div className="flex justify-start pt-4">
          <AdminBtn onClick={onSave} loading={saving}>Save settings</AdminBtn>
        </div>
      </div>
    </div>
  );
}
