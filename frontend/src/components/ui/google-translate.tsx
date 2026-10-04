'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe2, Search, X } from 'lucide-react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: {
          new (options: Record<string, unknown>, element: string): unknown;
          InlineLayout: { SIMPLE: string };
        };
      };
    };
  }
}

const SCRIPT_ID = 'google-translate-script';
const ENGINE_ID = 'google_translate_engine';

export interface LanguageItem {
  code: string;
  gtCode?: string; // Underlying Google Translate code if regional variant
  label: string;
  nativeName: string;
  popular?: boolean;
}

const RTL_LANGUAGES = ['ar', 'ar-AE', 'ar-SA', 'ar-EG', 'ar-QA', 'ur', 'iw', 'he', 'fa', 'ps', 'sd', 'ug', 'yi', 'ckb', 'dv'];

/**
 * 200+ (195+) Global, Regional & UN Country Languages
 */
export const ALL_LANGUAGES: LanguageItem[] = [
  // Top Popular / Major Trading & Global Languages
  { code: 'en', label: 'English (US)', nativeName: 'English', popular: true },
  { code: 'hi', label: 'Hindi (India)', nativeName: 'हिन्दी', popular: true },
  { code: 'es', label: 'Spanish', nativeName: 'Español', popular: true },
  { code: 'fr', label: 'French', nativeName: 'Français', popular: true },
  { code: 'de', label: 'German', nativeName: 'Deutsch', popular: true },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية', popular: true },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', popular: true },
  { code: 'ru', label: 'Russian', nativeName: 'Русский', popular: true },
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeName: '简体中文', popular: true },
  { code: 'zh-TW', label: 'Chinese (Traditional)', nativeName: '繁體中文', popular: true },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', popular: true },
  { code: 'ko', label: 'Korean', nativeName: '한국어', popular: true },
  { code: 'it', label: 'Italian', nativeName: 'Italiano', popular: true },
  { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', popular: true },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', popular: true },
  { code: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt', popular: true },
  { code: 'th', label: 'Thai', nativeName: 'ไทย', popular: true },
  { code: 'nl', label: 'Dutch', nativeName: 'Nederlands', popular: true },
  { code: 'pl', label: 'Polish', nativeName: 'Polski', popular: true },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو', popular: true },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', popular: true },
  { code: 'fa', label: 'Persian (Farsi)', nativeName: 'فارسی', popular: true },
  { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu', popular: true },

  // Indian & South Asian Languages
  { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'awa', gtCode: 'hi', label: 'Awadhi', nativeName: 'अवधी' },
  { code: 'bho', label: 'Bhojpuri', nativeName: 'भोजपुरी' },
  { code: 'brx', gtCode: 'hi', label: 'Bodo', nativeName: 'बड़ो' },
  { code: 'doi', label: 'Dogri', nativeName: 'डोगरी' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'hne', gtCode: 'hi', label: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ks', gtCode: 'ur', label: 'Kashmiri', nativeName: 'कॉशुर / کٲشُر' },
  { code: 'gom', label: 'Konkani', nativeName: 'कोंकणी' },
  { code: 'mai', label: 'Maithili', nativeName: 'मैथिली' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mni-Mtei', label: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
  { code: 'lus', label: 'Mizo', nativeName: 'Mizo ṭawng' },
  { code: 'ne', label: 'Nepali', nativeName: 'नेपाली' },
  { code: 'or', label: 'Odia (Oriya)', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi (Gurmukhi)', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'pa-PK', gtCode: 'pa', label: 'Punjabi (Shahmukhi)', nativeName: 'پنجابی' },
  { code: 'raj', gtCode: 'hi', label: 'Rajasthani', nativeName: 'राजस्थानी' },
  { code: 'sa', label: 'Sanskrit', nativeName: 'संस्कृतम्' },
  { code: 'sat', gtCode: 'hi', label: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'sd', label: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'si', label: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'tcy', gtCode: 'kn', label: 'Tulu', nativeName: 'ತುಳು' },
  { code: 'dv', label: 'Dhivehi (Maldivian)', nativeName: 'ދިވެހި' },
  { code: 'dz', gtCode: 'ne', label: 'Dzongkha (Bhutan)', nativeName: 'རྫོང་ཁ' },

  // Global & Regional A-Z (195+ Total)
  { code: 'ab', gtCode: 'ru', label: 'Abkhaz', nativeName: 'Аҧсуа' },
  { code: 'ace', gtCode: 'id', label: 'Acehnese', nativeName: 'Bahsa Acèh' },
  { code: 'ach', gtCode: 'sw', label: 'Acholi', nativeName: 'Lwo' },
  { code: 'af', label: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'ak', label: 'Akan (Twi)', nativeName: 'Twi' },
  { code: 'sq', label: 'Albanian', nativeName: 'Shqip' },
  { code: 'alz', gtCode: 'sw', label: 'Alur', nativeName: 'Dholuo' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'ar-AE', gtCode: 'ar', label: 'Arabic (UAE)', nativeName: 'العربية (الإمارات)' },
  { code: 'ar-SA', gtCode: 'ar', label: 'Arabic (Saudi Arabia)', nativeName: 'العربية (السعودية)' },
  { code: 'ar-EG', gtCode: 'ar', label: 'Arabic (Egypt)', nativeName: 'العربية (مصر)' },
  { code: 'ar-QA', gtCode: 'ar', label: 'Arabic (Qatar)', nativeName: 'العربية (قطر)' },
  { code: 'ar-MA', gtCode: 'ar', label: 'Arabic (Morocco)', nativeName: 'العربية (المغرب)' },
  { code: 'hy', label: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'ay', label: 'Aymara', nativeName: 'Aymar aru' },
  { code: 'az', label: 'Azerbaijani', nativeName: 'Azərbaycanca' },
  { code: 'ban', gtCode: 'id', label: 'Balinese', nativeName: 'Basa Bali' },
  { code: 'bm', label: 'Bambara', nativeName: 'Bamanankan' },
  { code: 'ba', gtCode: 'ru', label: 'Bashkir', nativeName: 'Башҡортса' },
  { code: 'eu', label: 'Basque', nativeName: 'Euskara' },
  { code: 'bbc', gtCode: 'id', label: 'Batak Toba', nativeName: 'Hata Batak' },
  { code: 'be', label: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'bem', gtCode: 'ny', label: 'Bemba', nativeName: 'Ichibemba' },
  { code: 'bew', gtCode: 'id', label: 'Betawi', nativeName: 'Bahasa Betawi' },
  { code: 'bik', gtCode: 'tl', label: 'Bikol', nativeName: 'Bikol' },
  { code: 'bs', label: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'br', gtCode: 'fr', label: 'Breton', nativeName: 'Brezhoneg' },
  { code: 'bg', label: 'Bulgarian', nativeName: 'Български' },
  { code: 'bua', gtCode: 'mn', label: 'Buryat', nativeName: 'Буряад' },
  { code: 'yue', gtCode: 'zh-TW', label: 'Cantonese', nativeName: '粵語 (廣東話)' },
  { code: 'ca', label: 'Catalan', nativeName: 'Català' },
  { code: 'ceb', label: 'Cebuano', nativeName: 'Cebuano' },
  { code: 'ch', gtCode: 'tl', label: 'Chamorro', nativeName: 'Finuʼ Chamoru' },
  { code: 'ce', gtCode: 'ru', label: 'Chechen', nativeName: 'Нохчийн' },
  { code: 'ny', label: 'Chichewa (Nyanja)', nativeName: 'Chichewa' },
  { code: 'zh-HK', gtCode: 'zh-TW', label: 'Chinese (Hong Kong)', nativeName: '繁體中文 (香港)' },
  { code: 'zh-SG', gtCode: 'zh-CN', label: 'Chinese (Singapore)', nativeName: '简体中文 (新加坡)' },
  { code: 'cv', gtCode: 'ru', label: 'Chuvash', nativeName: 'Чӑвашла' },
  { code: 'co', label: 'Corsican', nativeName: 'Corsu' },
  { code: 'crh', gtCode: 'tr', label: 'Crimean Tatar', nativeName: 'Qırımtatarca' },
  { code: 'hr', label: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'cs', label: 'Czech', nativeName: 'Čeština' },
  { code: 'da', label: 'Danish', nativeName: 'Dansk' },
  { code: 'din', gtCode: 'sw', label: 'Dinka', nativeName: 'Thuɔŋjäŋ' },
  { code: 'nl-BE', gtCode: 'nl', label: 'Dutch (Belgium / Flemish)', nativeName: 'Vlaams' },
  { code: 'dyu', gtCode: 'bm', label: 'Dyula', nativeName: 'Julakan' },
  { code: 'en-GB', gtCode: 'en', label: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'en-AU', gtCode: 'en', label: 'English (Australia)', nativeName: 'English (AU)' },
  { code: 'en-CA', gtCode: 'en', label: 'English (Canada)', nativeName: 'English (CA)' },
  { code: 'en-IN', gtCode: 'en', label: 'English (India)', nativeName: 'English (IN)' },
  { code: 'en-SG', gtCode: 'en', label: 'English (Singapore)', nativeName: 'English (SG)' },
  { code: 'en-ZA', gtCode: 'en', label: 'English (South Africa)', nativeName: 'English (ZA)' },
  { code: 'eo', label: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'et', label: 'Estonian', nativeName: 'Eesti' },
  { code: 'ee', label: 'Ewe', nativeName: 'Eʋegbe' },
  { code: 'fo', gtCode: 'is', label: 'Faroese', nativeName: 'Føroyskt' },
  { code: 'fj', gtCode: 'sm', label: 'Fijian', nativeName: 'Vosa Vakaviti' },
  { code: 'tl', label: 'Filipino (Tagalog)', nativeName: 'Filipino' },
  { code: 'fi', label: 'Finnish', nativeName: 'Suomi' },
  { code: 'fon', gtCode: 'yo', label: 'Fon', nativeName: 'Fɔngbè' },
  { code: 'fr-CA', gtCode: 'fr', label: 'French (Canada)', nativeName: 'Français (Canada)' },
  { code: 'fr-CH', gtCode: 'fr', label: 'French (Switzerland)', nativeName: 'Français (Suisse)' },
  { code: 'fr-BE', gtCode: 'fr', label: 'French (Belgium)', nativeName: 'Français (Belgique)' },
  { code: 'fy', label: 'Frisian', nativeName: 'Frysk' },
  { code: 'fur', gtCode: 'it', label: 'Friulian', nativeName: 'Furlan' },
  { code: 'ff', gtCode: 'ha', label: 'Fulani (Fula)', nativeName: 'Fulfulde' },
  { code: 'gaa', gtCode: 'ak', label: 'Ga', nativeName: 'Gã' },
  { code: 'gl', label: 'Galician', nativeName: 'Galego' },
  { code: 'ka', label: 'Georgian', nativeName: 'ქართული' },
  { code: 'de-AT', gtCode: 'de', label: 'German (Austria)', nativeName: 'Deutsch (Österreich)' },
  { code: 'de-CH', gtCode: 'de', label: 'German (Switzerland)', nativeName: 'Deutsch (Schweiz)' },
  { code: 'el', label: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'kl', gtCode: 'da', label: 'Greenlandic (Kalaallisut)', nativeName: 'Kalaallisut' },
  { code: 'gn', label: 'Guarani', nativeName: 'Avañeʼẽ' },
  { code: 'ht', label: 'Haitian Creole', nativeName: 'Kreyòl ayisyen' },
  { code: 'cnh', gtCode: 'my', label: 'Hakha Chin', nativeName: 'Laiholh' },
  { code: 'ha', label: 'Hausa', nativeName: 'Hausa' },
  { code: 'haw', label: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'iw', label: 'Hebrew', nativeName: 'עברית' },
  { code: 'hil', gtCode: 'tl', label: 'Hiligaynon', nativeName: 'Ilonggo' },
  { code: 'hmn', label: 'Hmong', nativeName: 'Hmong' },
  { code: 'hu', label: 'Hungarian', nativeName: 'Magyar' },
  { code: 'hrx', gtCode: 'de', label: 'Hunsrik', nativeName: 'Hunsrik' },
  { code: 'iba', gtCode: 'ms', label: 'Iban', nativeName: 'Jaku Iban' },
  { code: 'is', label: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ig', label: 'Igbo', nativeName: 'Igbo' },
  { code: 'ilo', label: 'Ilocano', nativeName: 'Ilokano' },
  { code: 'ga', label: 'Irish', nativeName: 'Gaeilge' },
  { code: 'it-CH', gtCode: 'it', label: 'Italian (Switzerland)', nativeName: 'Italiano (Svizzera)' },
  { code: 'jam', gtCode: 'en', label: 'Jamaican Patois', nativeName: 'Patois' },
  { code: 'jw', label: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'kbd', gtCode: 'ru', label: 'Kabardian', nativeName: 'Адыгэбзэ' },
  { code: 'kab', gtCode: 'fr', label: 'Kabyle', nativeName: 'Taqbaylit' },
  { code: 'kac', gtCode: 'my', label: 'Jingpo (Kachin)', nativeName: 'Jingpho' },
  { code: 'kr', gtCode: 'ha', label: 'Kanuri', nativeName: 'Kanuri' },
  { code: 'pam', gtCode: 'tl', label: 'Kapampangan', nativeName: 'Kapampangan' },
  { code: 'kk', label: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'kha', gtCode: 'en', label: 'Khasi', nativeName: 'Ka Ktien Khasi' },
  { code: 'km', label: 'Khmer (Cambodian)', nativeName: 'ខ្មែរ' },
  { code: 'cgg', gtCode: 'lg', label: 'Kiga', nativeName: 'Rukiga' },
  { code: 'kg', gtCode: 'ln', label: 'Kikongo', nativeName: 'Kikongo' },
  { code: 'rw', label: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'ktu', gtCode: 'ln', label: 'Kituba', nativeName: 'Kituba' },
  { code: 'kv', gtCode: 'ru', label: 'Komi', nativeName: 'Коми' },
  { code: 'kri', label: 'Krio', nativeName: 'Krio' },
  { code: 'ku', label: 'Kurdish (Kurmanji)', nativeName: 'Kurdî (Kurmancî)' },
  { code: 'ckb', label: 'Kurdish (Sorani)', nativeName: 'کوردیی سۆرانی' },
  { code: 'ky', label: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'lo', label: 'Lao', nativeName: 'ລາວ' },
  { code: 'ltg', gtCode: 'lv', label: 'Latgalian', nativeName: 'Latgalīšu' },
  { code: 'la', label: 'Latin', nativeName: 'Latina' },
  { code: 'lv', label: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lij', gtCode: 'it', label: 'Ligurian', nativeName: 'Ligure' },
  { code: 'li', gtCode: 'nl', label: 'Limburgish', nativeName: 'Limburgs' },
  { code: 'ln', label: 'Lingala', nativeName: 'Lingála' },
  { code: 'lt', label: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lmo', gtCode: 'it', label: 'Lombard', nativeName: 'Lombard' },
  { code: 'lg', label: 'Luganda', nativeName: 'Luganda' },
  { code: 'luo', gtCode: 'sw', label: 'Luo', nativeName: 'Dholuo' },
  { code: 'lb', label: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },
  { code: 'mk', label: 'Macedonian', nativeName: 'Македонски' },
  { code: 'mad', gtCode: 'id', label: 'Madurese', nativeName: 'Bhâsa Madhurâ' },
  { code: 'mak', gtCode: 'id', label: 'Makassar', nativeName: 'Basa Mangkasara' },
  { code: 'mg', label: 'Malagasy', nativeName: 'Malagasy' },
  { code: 'ms-BN', gtCode: 'ms', label: 'Malay (Brunei)', nativeName: 'Bahasa Melayu (Brunei)' },
  { code: 'ms-SG', gtCode: 'ms', label: 'Malay (Singapore)', nativeName: 'Bahasa Melayu (SG)' },
  { code: 'mt', label: 'Maltese', nativeName: 'Malti' },
  { code: 'gv', gtCode: 'ga', label: 'Manx', nativeName: 'Gaelg' },
  { code: 'mi', label: 'Maori', nativeName: 'Māori' },
  { code: 'mh', gtCode: 'en', label: 'Marshallese', nativeName: 'Kajin M̧ajeļ' },
  { code: 'mfe', gtCode: 'fr', label: 'Mauritian Creole', nativeName: 'Kreol Morisien' },
  { code: 'min', gtCode: 'id', label: 'Minangkabau', nativeName: 'Baso Minangkabau' },
  { code: 'mn', label: 'Mongolian', nativeName: 'Монгол' },
  { code: 'cnr', gtCode: 'sr', label: 'Montenegrin', nativeName: 'Crnogorski' },
  { code: 'my', label: 'Myanmar (Burmese)', nativeName: 'မြန်မာ' },
  { code: 'new', gtCode: 'ne', label: 'Newari (Nepal Bhasa)', nativeName: 'नेपाल भाषा' },
  { code: 'no', label: 'Norwegian (Bokmål)', nativeName: 'Norsk Bokmål' },
  { code: 'nn', gtCode: 'no', label: 'Norwegian (Nynorsk)', nativeName: 'Norsk Nynorsk' },
  { code: 'nus', gtCode: 'sw', label: 'Nuer', nativeName: 'Thok Naath' },
  { code: 'oc', gtCode: 'fr', label: 'Occitan', nativeName: 'Occitan' },
  { code: 'om', label: 'Oromo', nativeName: 'Afaan Oromoo' },
  { code: 'os', gtCode: 'ru', label: 'Ossetian', nativeName: 'Ирон' },
  { code: 'pag', gtCode: 'tl', label: 'Pangasinan', nativeName: 'Salitan Pangasinan' },
  { code: 'pap', gtCode: 'es', label: 'Papiamento', nativeName: 'Papiamentu' },
  { code: 'ps', label: 'Pashto', nativeName: 'پښتو' },
  { code: 'fa-AF', gtCode: 'fa', label: 'Persian (Dari / Afghanistan)', nativeName: 'دری' },
  { code: 'pt-BR', gtCode: 'pt', label: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'pt-PT', gtCode: 'pt', label: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { code: 'qu', label: 'Quechua', nativeName: 'Runasimi' },
  { code: 'rom', gtCode: 'ro', label: 'Romani', nativeName: 'Romani čhib' },
  { code: 'ro', label: 'Romanian', nativeName: 'Română' },
  { code: 'rm', gtCode: 'de', label: 'Romansh', nativeName: 'Rumantsch' },
  { code: 'rn', gtCode: 'rw', label: 'Rundi (Kirundi)', nativeName: 'Ikirundi' },
  { code: 'sm', label: 'Samoan', nativeName: 'Gagana Sāmoa' },
  { code: 'sg', gtCode: 'ln', label: 'Sango', nativeName: 'Sängö' },
  { code: 'sc', gtCode: 'it', label: 'Sardinian', nativeName: 'Sardu' },
  { code: 'gd', label: 'Scots Gaelic', nativeName: 'Gàidhlig' },
  { code: 'nso', label: 'Sepedi (Northern Sotho)', nativeName: 'Sesotho sa Leboa' },
  { code: 'sr', label: 'Serbian', nativeName: 'Српски' },
  { code: 'st', label: 'Sesotho (Southern Sotho)', nativeName: 'Sesotho' },
  { code: 'crs', gtCode: 'fr', label: 'Seychellois Creole', nativeName: 'Kreol Seselwa' },
  { code: 'shn', gtCode: 'my', label: 'Shan', nativeName: 'လိၵ်ႈတႆး' },
  { code: 'sn', label: 'Shona', nativeName: 'ChiShona' },
  { code: 'scn', gtCode: 'it', label: 'Sicilian', nativeName: 'Sicilianu' },
  { code: 'szl', gtCode: 'pl', label: 'Silesian', nativeName: 'Ślōnskŏ' },
  { code: 'sk', label: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', label: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'so', label: 'Somali', nativeName: 'Soomaali' },
  { code: 'es-MX', gtCode: 'es', label: 'Spanish (Mexico)', nativeName: 'Español (México)' },
  { code: 'es-AR', gtCode: 'es', label: 'Spanish (Argentina)', nativeName: 'Español (Argentina)' },
  { code: 'es-CO', gtCode: 'es', label: 'Spanish (Colombia)', nativeName: 'Español (Colombia)' },
  { code: 'es-CL', gtCode: 'es', label: 'Spanish (Chile)', nativeName: 'Español (Chile)' },
  { code: 'es-PE', gtCode: 'es', label: 'Spanish (Peru)', nativeName: 'Español (Perú)' },
  { code: 'su', label: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'sus', gtCode: 'fr', label: 'Susu', nativeName: 'Sosoxui' },
  { code: 'sw', label: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ss', gtCode: 'zu', label: 'Swati (Swazi)', nativeName: 'SiSwati' },
  { code: 'sv', label: 'Swedish', nativeName: 'Svenska' },
  { code: 'ty', gtCode: 'sm', label: 'Tahitian', nativeName: 'Reo Tahiti' },
  { code: 'tg', label: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'tt', label: 'Tatar', nativeName: 'Татарча' },
  { code: 'tet', gtCode: 'pt', label: 'Tetum', nativeName: 'Tetun' },
  { code: 'bo', gtCode: 'zh-CN', label: 'Tibetan', nativeName: 'བོད་སྐད་' },
  { code: 'ti', label: 'Tigrinya', nativeName: 'ትግርኛ' },
  { code: 'tiv', gtCode: 'ha', label: 'Tiv', nativeName: 'Tiv' },
  { code: 'tpi', gtCode: 'en', label: 'Tok Pisin', nativeName: 'Tok Pisin' },
  { code: 'to', gtCode: 'sm', label: 'Tongan', nativeName: 'Lea Fakatonga' },
  { code: 'ts', label: 'Tsonga', nativeName: 'Xitsonga' },
  { code: 'tn', gtCode: 'st', label: 'Tswana', nativeName: 'Setswana' },
  { code: 'tum', gtCode: 'ny', label: 'Tumbuka', nativeName: 'ChiTumbuka' },
  { code: 'tk', label: 'Turkmen', nativeName: 'Türkmençe' },
  { code: 'tyv', gtCode: 'ru', label: 'Tuvan', nativeName: 'Тыва дыл' },
  { code: 'udm', gtCode: 'ru', label: 'Udmurt', nativeName: 'Удмурт' },
  { code: 'uk', label: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ug', label: 'Uyghur', nativeName: 'ئۇيغۇرچە' },
  { code: 'uz', label: 'Uzbek', nativeName: 'Oʻzbek' },
  { code: 've', gtCode: 'st', label: 'Venda', nativeName: 'Tshivenḓa' },
  { code: 'vec', gtCode: 'it', label: 'Venetian', nativeName: 'Vèneto' },
  { code: 'war', gtCode: 'tl', label: 'Waray', nativeName: 'Winaray' },
  { code: 'cy', label: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'wo', gtCode: 'fr', label: 'Wolof', nativeName: 'Wolof' },
  { code: 'xh', label: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'sah', gtCode: 'ru', label: 'Yakut (Sakha)', nativeName: 'Саха тыла' },
  { code: 'yi', label: 'Yiddish', nativeName: 'ייִדיש' },
  { code: 'yo', label: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'yua', gtCode: 'es', label: 'Yucatec Maya', nativeName: 'Maaya Tʼàan' },
  { code: 'zap', gtCode: 'es', label: 'Zapotec', nativeName: 'Diidxazá' },
  { code: 'zu', label: 'Zulu', nativeName: 'isiZulu' },
];

const INCLUDED_LANG_CODES = Array.from(
  new Set(ALL_LANGUAGES.map((l) => l.gtCode || l.code))
).join(',');

function getGoogleCombo(): HTMLSelectElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLSelectElement>('.goog-te-combo');
}

function resolveGoogleCode(langCode: string): string {
  const item = ALL_LANGUAGES.find((l) => l.code === langCode);
  return item?.gtCode || langCode;
}

function setGoogleTranslateCookie(langCode: string) {
  if (typeof document === 'undefined') return;
  const gtCode = resolveGoogleCode(langCode);
  const cookieVal = gtCode && gtCode !== 'en' ? `/en/${gtCode}` : '/en/en';
  document.cookie = `googtrans=${cookieVal}; path=/`;

  try {
    localStorage.setItem('propnation_selected_lang', langCode);
  } catch {
    // ignore storage errors
  }

  const host = window.location.hostname;
  if (host.includes('.')) {
    document.cookie = `googtrans=${cookieVal}; domain=.${host}; path=/`;
  }
}

function getCurrentGoogleLanguage(): string {
  if (typeof document === 'undefined') return 'en';

  try {
    const stored = localStorage.getItem('propnation_selected_lang');
    if (stored && ALL_LANGUAGES.some((item) => item.code === stored)) {
      return stored;
    }
  } catch {
    // ignore
  }

  const match = document.cookie.match(/(?:^|; )googtrans=([^;]+)/);
  if (!match || !match[1]) return 'en';

  const decoded = decodeURIComponent(match[1]);
  const parts = decoded.split('/').filter(Boolean);
  const target = parts.at(-1);

  if (target && ALL_LANGUAGES.some((item) => item.code === target)) {
    return target;
  }
  return 'en';
}

function applyHtmlDirection(langCode: string) {
  if (typeof document === 'undefined') return;
  const isRtl = RTL_LANGUAGES.includes(langCode);
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.lang = langCode;
}

export function GoogleTranslate({
  id = 'google_translate_widget',
  className = '',
  compact = true,
  pill = false,
}: {
  id?: string;
  className?: string;
  compact?: boolean;
  pill?: boolean;
}) {
  const [currentLang, setCurrentLang] = useState('en');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const desktopListRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  // Active language details
  const selectedLang = useMemo(() => {
    return ALL_LANGUAGES.find((item) => item.code === currentLang) || ALL_LANGUAGES[0];
  }, [currentLang]);

  // Real-time instant search filter:
  // When user types any letter(s), languages starting with that letter appear at the VERY TOP!
  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...ALL_LANGUAGES].sort((a, b) => {
        if (a.code === currentLang) return -1;
        if (b.code === currentLang) return 1;
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.label.localeCompare(b.label);
      });
    }

    const scoreLanguage = (item: LanguageItem): number => {
      const label = item.label.toLowerCase();
      const native = item.nativeName.toLowerCase();
      const code = item.code.toLowerCase();

      // Exact match
      if (label === q || native === q || code === q) return 100;
      // Label starts with typed letter(s) -> Highest priority at top
      if (label.startsWith(q)) return 90;
      // Native name starts with typed letter(s)
      if (native.startsWith(q)) return 85;
      // Code starts with typed letter(s)
      if (code.startsWith(q)) return 80;
      // Any word inside label starts with typed letter(s)
      if (label.split(/[\s()/,-]+/).some((w) => w.startsWith(q))) return 70;
      // Label contains typed letter(s)
      if (label.includes(q)) return 50;
      // Native name contains typed letter(s)
      if (native.includes(q)) return 40;
      // Code contains typed letter(s)
      if (code.includes(q)) return 30;
      return 0;
    };

    return ALL_LANGUAGES.map((item) => ({ item, score: scoreLanguage(item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.label.localeCompare(b.item.label);
      })
      .map((entry) => entry.item);
  }, [query, currentLang]);

  // Whenever query changes, scroll list to top so top matches are immediately visible
  useEffect(() => {
    if (desktopListRef.current) {
      desktopListRef.current.scrollTop = 0;
    }
    if (mobileListRef.current) {
      mobileListRef.current.scrollTop = 0;
    }
  }, [query]);

  // Read cookie on mount & apply direction
  useEffect(() => {
    const saved = getCurrentGoogleLanguage();
    setCurrentLang(saved);
    applyHtmlDirection(saved);
  }, []);

  // Pre-boot Google Translate Engine immediately in the background
  useEffect(() => {
    if (!document.getElementById(ENGINE_ID)) {
      const engineDiv = document.createElement('div');
      engineDiv.id = ENGINE_ID;
      engineDiv.className = 'google-translate-engine';
      engineDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(engineDiv);
    }

    const initEngine = () => {
      if (!window.google?.translate) return;
      const engineEl = document.getElementById(ENGINE_ID);
      if (!engineEl || engineEl.childNodes.length > 0) return;

      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: INCLUDED_LANG_CODES,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          ENGINE_ID
        );
      } catch (e) {
        console.warn('Google Translate init note:', e);
      }
    };

    window.googleTranslateElementInit = initEngine;

    if (window.google?.translate) {
      initEngine();
    } else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle outside click & escape key
  useEffect(() => {
    if (!open) return;

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (window.innerWidth >= 640 && !rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    const t = window.setTimeout(() => {
      if (window.innerWidth < 640) {
        mobileSearchRef.current?.focus();
      } else {
        searchInputRef.current?.focus();
      }
    }, 50);

    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(t);
    };
  }, [open]);

  // Instant language change trigger
  const handleSelectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    applyHtmlDirection(langCode);
    setGoogleTranslateCookie(langCode);
    setOpen(false);
    setQuery('');

    const gtCode = resolveGoogleCode(langCode);
    const combo = getGoogleCombo();
    if (combo) {
      combo.value = gtCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      window.location.reload();
    }
  };

  const shortDisplayCode =
    currentLang === 'en' ? 'LN' : `LN·${selectedLang.code.split('-')[0].toUpperCase()}`;

  return (
    <div id={id} ref={rootRef} className={`relative inline-block ${open ? 'z-[9999]' : ''} ${className}`}>
      {/* Compact "LN" Language Dropdown Button */}
      <button
        type="button"
        translate="no"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select Language (195+ Languages)"
        title={`Language: ${selectedLang.label} (195+ Languages Available)`}
        className={`notranslate group inline-flex items-center justify-center gap-1 rounded-xl border transition-all cursor-pointer font-mono font-bold select-none ${
          compact || pill
            ? 'h-9 px-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10 hover:border-emerald-500/50 text-slate-800 dark:text-slate-200 text-[11px]'
            : 'h-9 px-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10 hover:border-emerald-500/50 text-slate-800 dark:text-slate-200 text-[11px]'
        }`}
      >
        <Globe2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:rotate-12 transition-transform duration-200" />
        <span translate="no" className="notranslate tracking-tight font-extrabold">{shortDisplayCode}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </button>

      {/* 195+ Languages Searchable Selector */}
      {open && (
        <>
          {/* ======================================================== */}
          {/* 1. Mobile Bottom Sheet Modal (Screens < 640px) */}
          {/* ======================================================== */}
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs sm:hidden flex items-end justify-center animate-in fade-in-0 duration-200"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-h-[82vh] bg-white dark:bg-[#080d16] rounded-t-3xl border-t border-emerald-500/30 p-4 pb-6 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-250"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/25">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Select Language</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 dark:text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                        195+ Languages
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Type any letter to jump to matching languages
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Search Input */}
              <div className="py-2.5 shrink-0">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type any letter or language (e.g. H, Hindi, Spanish)..."
                    className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Scrollable Language List */}
              <div
                ref={mobileListRef}
                className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/50 overscroll-contain pr-1"
                role="listbox"
              >
                {filteredLanguages.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No language found matching &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  filteredLanguages.map((item) => {
                    const isActive = item.code === currentLang;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-left transition-colors text-xs ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full pr-2 min-w-0">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {item.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate ml-2">
                            {item.nativeName}
                          </span>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. Desktop Compact Floating Dropdown (Screens >= 640px) */}
          {/* ======================================================== */}
          <div className="hidden sm:block absolute right-0 rtl:right-auto rtl:left-0 top-full mt-2 w-68 z-[9999] rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#090e17] p-2 shadow-2xl ring-1 ring-black/10 animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Header & Instant Search Box */}
            <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Globe2 className="h-3 w-3" />
                  <span>195+ Languages</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {filteredLanguages.length} found
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type letter or language..."
                  className="h-8 w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#05080e] pl-8 pr-7 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#05080e] focus:outline-none transition-colors"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Languages Scrollable List */}
            <div
              ref={desktopListRef}
              className="max-h-64 overflow-y-auto pt-1 space-y-0.5 overscroll-contain scrollbar-thin"
              role="listbox"
            >
              {filteredLanguages.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No language found matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                filteredLanguages.map((item) => {
                  const isActive = item.code === currentLang;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelectLanguage(item.code)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold truncate text-xs text-slate-900 dark:text-white leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                          {item.nativeName} · {item.code.toUpperCase()}
                        </span>
                      </div>

                      {isActive && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
