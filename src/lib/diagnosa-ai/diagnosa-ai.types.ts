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
  snapshot: DiagnosaAiSnapshot;
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
    diagnosaAiId: string;
    assistantMessage: string;
    snapshot: DiagnosaAiSnapshot;
    nextHistory: DiagnosaAiHistoryMessage[];
    savedDiagnosa: DiagnosaAiSavedSnapshot;
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