export type DiagnosaAiHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DiagnosaAiChatRequest = {
  message: string;
  imageBase64?: string | null;
  history?: DiagnosaAiHistoryMessage[];
  diagnosaAiId?: string | null;
};

export type DiagnosaAiSnapshot = {
  gejala: string;
  kemungkinanPenyebab: string[];
  kemungkinanSolusi: string[];
  saranTindakan: string[];
  tingkatUrgensi: "rendah" | "sedang" | "tinggi";
  perluServisLangsung: boolean;
  disclaimer: string;
};

export type DiagnosaAiModelResponse = {
  assistantReply: string;
  isDiagnosis: boolean;
  snapshot: DiagnosaAiSnapshot | null;
};

export type DiagnosaAiSavedSnapshot = {
  id: string;
  gejala: string | null;
  gambar_gejala: string | null;
  kemungkinan_penyebab: string | null;
  kemungkinan_solusi: string | null;
  saran_tindakan: string | null;
};

export type DiagnosaAiChatSuccessResponse = {
  success: true;
  message: string;
  data: {
    diagnosaAiId: string | null;
    assistantMessage: string;
    isDiagnosis: boolean;
    snapshot: DiagnosaAiSnapshot | null;
    nextHistory: DiagnosaAiHistoryMessage[];
    savedDiagnosa: DiagnosaAiSavedSnapshot | null;
    source: string;
    model: string;
  };
};

export type DiagnosaAiChatErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
  raw?: unknown;
};

export type DiagnosaAiChatResponse =
  | DiagnosaAiChatSuccessResponse
  | DiagnosaAiChatErrorResponse;

export type DiagnosaAiDetailData = {
  id: string;
  gejala: string | null;
  gambar_gejala: string | null;
  kemungkinan_penyebab: string | null;
  kemungkinan_solusi: string | null;
  saran_tindakan: string | null;
  diagnosa_awal_kerusakan: string | null;
};

export type DiagnosaAiDetailResponse =
  | {
      success: true;
      message: string;
      data: DiagnosaAiDetailData;
    }
  | {
      success: false;
      message: string;
    };