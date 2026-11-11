import { useState, type FormEvent } from "react";
import { Globe2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "./LanguageContext";
import {
  getCompanyLanguageSettings,
  languageNames,
  setActiveCompany,
  setCompanyLanguage,
  type CompanyLanguageSetting,
} from "./languageService";

export default function LanguageSettingsPage() {
  const { companyId: activeCompanyId, language, t } = useLanguage();
  const [settings, setSettings] = useState(getCompanyLanguageSettings);
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompanyId);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [newCompanyId, setNewCompanyId] = useState("");

  const selectCompany = (setting: CompanyLanguageSetting) => {
    setSelectedCompanyId(setting.companyId);
    setSelectedLanguage(setting.language);
    setActiveCompany(setting.companyId);
  };

  const saveLanguage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompanyId.trim()) return;
    setCompanyLanguage(selectedCompanyId, selectedLanguage);
    setSettings(getCompanyLanguageSettings());
    toast.success(t("Lưu thay đổi"));
  };

  const addCompany = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = newCompanyId.trim();
    if (!id) return;
    const existing = getCompanyLanguageSettings().find((item) => item.companyId === id);
    if (existing) {
      selectCompany(existing);
      setNewCompanyId("");
      return;
    }
    setCompanyLanguage(id, "vi");
    setSettings(getCompanyLanguageSettings());
    setSelectedCompanyId(id);
    setSelectedLanguage("vi");
    setNewCompanyId("");
    toast.success(`${t("Công ty đang áp dụng")}: ${id}`);
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6 py-2" aria-labelledby="language-settings-title">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-sm text-slate-500"><Globe2 size={17} />{t("Cài đặt")}</div>
        <h1 id="language-settings-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{t("Cài đặt ngôn ngữ")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("Mỗi công ty có thể dùng một ngôn ngữ giao diện riêng.")}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-slate-200 bg-white" aria-labelledby="company-language-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 id="company-language-heading" className="text-base font-semibold text-slate-900">{t("Cấu hình theo công ty")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("Ngôn ngữ được lưu cho công ty này trên trình duyệt hiện tại.")}</p>
            </div>
            <span className="text-sm text-slate-500">{t("Công ty đang áp dụng")}: <strong className="font-medium text-slate-800">{activeCompanyId}</strong></span>
          </div>
          {settings.length ? (
            <ul className="divide-y divide-slate-100">
              {settings.map((setting) => (
                <li key={setting.companyId}>
                  <button type="button" onClick={() => selectCompany(setting)} className={`flex min-h-16 w-full items-center justify-between gap-4 px-5 py-3 text-left hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 ${selectedCompanyId === setting.companyId ? "bg-slate-50" : ""}`}>
                    <span className="min-w-0"><strong className="block truncate text-sm font-medium text-slate-900">{setting.companyId}</strong><small className="mt-1 block text-xs text-slate-500">{t("Ngôn ngữ giao diện")}</small></span>
                    <span className="shrink-0 text-sm text-slate-700">{t(languageNames[setting.language] ?? setting.language)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="px-5 py-8 text-sm text-slate-500">{t("Chưa có công ty nào được cấu hình.")}</p>}
        </section>

        <div className="space-y-4">
          <form onSubmit={saveLanguage} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900">{t("Ngôn ngữ giao diện")}</h2>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              {t("Mã công ty")}
              <Input value={selectedCompanyId} onChange={(event) => setSelectedCompanyId(event.target.value)} required maxLength={80} placeholder="company-001" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              {t("Chọn ngôn ngữ")}
              <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700">
                {Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{t(name)}</option>)}
              </select>
            </label>
            <Button type="submit" className="w-full bg-[#087f74] text-white hover:bg-[#006b61]">{t("Lưu thay đổi")}</Button>
          </form>

          <form onSubmit={addCompany} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900">{t("Thêm công ty")}</h2>
            <label className="block space-y-1.5 text-sm font-medium text-slate-700">
              {t("Mã công ty")}
              <Input value={newCompanyId} onChange={(event) => setNewCompanyId(event.target.value)} required maxLength={80} placeholder="company-002" />
            </label>
            <Button type="submit" variant="outline" className="w-full"><Plus size={16} />{t("Thêm công ty")}</Button>
          </form>
        </div>
      </div>
    </section>
  );
}
