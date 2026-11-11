import { AxiosClient } from "@/shared/axios.client";

// ==================== TYPE DEFINITIONS & MODELS ====================

export type LanguageCatalog = Record<string, string>;
export type TranslationMap = Record<string, string>;

/**
 * Model biểu diễn một ngôn ngữ được cấu hình trên server
 */
export interface LanguageItem {
  id: number;
  companyId: number;
  code: string;
  name: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * DTO tạo ngôn ngữ mới (POST /api/language)
 */
export interface CreateLanguageData {
  companyId: number;
  code: string;
  name: string;
  isDefault?: boolean;
  [key: string]: unknown;
}

/**
 * DTO thiết lập bản dịch (POST /api/language/translations)
 */
export interface SetTranslationsData {
  companyId: number;
  lang: string;
  translations: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Dữ liệu trả về từ API getTranslations
 */
export interface GetTranslationsResponse {
  companyId?: number;
  lang?: string;
  translations?: TranslationMap;
  [key: string]: unknown;
}

// ==================== BACKEND API CALLS ====================

const BASE_PATH = "/api/language";

/**
 * GET /api/language?companyId={companyId}
 * Lấy danh sách các ngôn ngữ theo công ty
 */
export const getLanguages = async (companyId: number | string) => {
  return await AxiosClient.get<LanguageItem[]>(BASE_PATH, {
    params: {
      companyId: Number(companyId),
    },
  });
};

/**
 * POST /api/language
 * Thêm ngôn ngữ mới cho công ty
 */
export const createLanguage = async (data: CreateLanguageData) => {
  return await AxiosClient.post<LanguageItem>(BASE_PATH, {
    ...data,
    companyId: Number(data.companyId),
  });
};

/**
 * DELETE /api/language/:id
 * Xóa một ngôn ngữ theo ID
 */
export const deleteLanguage = async (id: number | string) => {
  return await AxiosClient.delete<void | { success?: boolean; message?: string }>(
    `${BASE_PATH}/${Number(id)}`,
  );
};

/**
 * GET /api/language/translations?companyId={companyId}&lang={lang}
 * Lấy danh sách các bản dịch của một ngôn ngữ theo công ty
 */
export const getTranslations = async (
  companyId: number | string,
  lang: string,
) => {
  return await AxiosClient.get<TranslationMap | GetTranslationsResponse>(
    `${BASE_PATH}/translations`,
    {
      params: {
        companyId: Number(companyId),
        lang: String(lang).trim(),
      },
    },
  );
};

/**
 * POST /api/language/translations
 * Lưu / cập nhật từ điển bản dịch cho công ty và mã ngôn ngữ
 */
export const setTranslations = async (data: SetTranslationsData) => {
  return await AxiosClient.post<void | { success?: boolean; message?: string }>(
    `${BASE_PATH}/translations`,
    {
      ...data,
      companyId: Number(data.companyId),
      lang: String(data.lang).trim(),
    },
  );
};

// ==================== CLIENT CATALOG & LOCAL PREFERENCES ====================

export const languageNames: Record<string, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

const catalogs: Record<string, LanguageCatalog> = {
  vi: {},
  en: {
    "Tổng quan": "Overview",
    "Dự án": "Projects",
    "Quản lý Công trường": "Site management",
    "Thiết bị": "Equipment",
    "Hồ sơ & bản vẽ": "Files & drawings",
    "Công việc": "Tasks",
    "Vấn đề": "Issues",
    "Vật tư": "Materials",
    "Nhân sự": "People",
    "Cài đặt": "Settings",
    "CHÍNH": "WORKSPACE",
    "VẬN HÀNH": "OPERATIONS",
    "Dự án mới": "New project",
    "Hỗ trợ": "Help",
    "Tài khoản": "Account",
    "Đăng xuất": "Sign out",
    "Mở menu thanh bên": "Open navigation menu",
    "Điều hướng chính": "Main navigation",
    "Tìm kiếm nhật ký": "Search activity",
    "Tìm kiếm nhật ký...": "Search activity...",
    "Thông báo": "Notifications",
    "thông báo mới": "new notifications",
    "Cài đặt ngôn ngữ": "Language settings",
    "Skipli Classroom Management System ©2024":
      "Skipli Classroom Management System ©2024",
    "Ngôn ngữ": "Language",
    "Ngôn ngữ giao diện": "Interface language",
    "Tiếng Việt": "Vietnamese",
    "Mã công ty": "Company ID",
    "Công ty đang áp dụng": "Active company",
    "Áp dụng": "Apply",
    "Lưu thay đổi": "Save changes",
    "Thêm công ty": "Add company",
    "Chọn ngôn ngữ": "Choose a language",
    "Cấu hình theo công ty": "Company language settings",
    "Mỗi công ty có thể dùng một ngôn ngữ giao diện riêng.":
      "Each company can use its own interface language.",
    "Chưa có công ty nào được cấu hình.": "No companies configured yet.",
    "Ngôn ngữ được lưu cho công ty này trên trình duyệt hiện tại.":
      "This language preference is saved for this company in this browser.",
    "Thêm ngôn ngữ": "Add language",
    "Quay lại": "Back",
  },
};

const SETTINGS_KEY = "cm_company_languages_v1";
const ACTIVE_COMPANY_KEY = "cm_active_company_id_v1";
const CHANGE_EVENT = "cm-company-language-changed";

export interface CompanyLanguageSetting {
  companyId: string;
  language: string;
}

function readSettings(): CompanyLanguageSetting[] {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CompanyLanguageSetting =>
        !!item &&
        typeof item.companyId === "string" &&
        typeof item.language === "string",
    );
  } catch {
    return [];
  }
}

function announceChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCompanyLanguageSettings() {
  return readSettings();
}

export function getActiveCompanyId() {
  return localStorage.getItem(ACTIVE_COMPANY_KEY) || "default";
}

export function getCompanyLanguage(companyId: string) {
  return (
    readSettings().find((item) => item.companyId === companyId)?.language ||
    "vi"
  );
}

export function setActiveCompany(companyId: string) {
  const normalized = companyId.trim();
  if (!normalized) return;
  localStorage.setItem(ACTIVE_COMPANY_KEY, normalized);
  announceChange();
}

export function setCompanyLanguage(companyId: string, language: string) {
  const normalizedId = companyId.trim();
  if (!normalizedId || !catalogs[language]) return;
  const settings = readSettings();
  const next = settings.filter((item) => item.companyId !== normalizedId);
  next.push({ companyId: normalizedId, language });
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  localStorage.setItem(ACTIVE_COMPANY_KEY, normalizedId);
  announceChange();
}

export function subscribeToLanguageChanges(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function translate(language: string, source: string) {
  return catalogs[language]?.[source] ?? catalogs.vi[source] ?? source;
}

/**
 * Đăng ký hoặc nạp bộ từ điển bản dịch vào catalog cục bộ
 */
export function registerLanguage(
  code: string,
  name: string,
  catalog: LanguageCatalog,
) {
  const normalizedCode = code.trim().toLowerCase();
  if (!/^[a-z]{2,3}(?:-[a-z0-9]+)?$/.test(normalizedCode) || !name.trim())
    return;
  languageNames[normalizedCode] = name.trim();
  catalogs[normalizedCode] = {
    ...(catalogs[normalizedCode] || {}),
    ...catalog,
  };
  announceChange();
}

/**
 * Helper: Đồng bộ bản dịch từ server về client catalog
 */
export async function syncTranslationsFromServer(
  companyId: number | string,
  lang: string,
  languageName?: string,
) {
  try {
    const res = await getTranslations(companyId, lang);
    const data = res.data;
    const dictionary: TranslationMap =
      data && typeof data === "object"
        ? (("translations" in data && data.translations) as TranslationMap) ||
          (data as TranslationMap)
        : {};

    registerLanguage(
      lang,
      languageName || languageNames[lang] || lang.toUpperCase(),
      dictionary,
    );
    return dictionary;
  } catch (error) {
    console.error(`Không thể nạp bản dịch cho ${lang} từ server:`, error);
    return null;
  }
}
