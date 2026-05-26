"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconMapPin,
  IconPhone,
  IconPhotoPlus,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { sendDiagnosaAiChat } from "@/lib/diagnosa-ai/diagnosa-ai.client";
import type {
  DiagnosaAiHistoryMessage,
  DiagnosaAiSnapshot,
} from "@/lib/diagnosa-ai/diagnosa-ai.types";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: string | null;
};

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];


function createMessageId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Gagal membaca file gambar."));
        return;
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file gambar."));
    };

    reader.readAsDataURL(file);
  });
};

function buildAssistantDisplayText(
  assistantMessage: string,
  snapshot: DiagnosaAiSnapshot
) {
  return [
    assistantMessage,
    "",
    "Kemungkinan penyebab:",
    ...snapshot.kemungkinanPenyebab.map((item) => `- ${item}`),
    "",
    "Kemungkinan solusi:",
    ...snapshot.kemungkinanSolusi.map((item) => `- ${item}`),
    "",
    "Saran tindakan:",
    ...snapshot.saranTindakan.map((item) => `- ${item}`),
    "",
    `Tingkat urgensi: ${snapshot.tingkatUrgensi}`,
    `Perlu servis langsung: ${snapshot.perluServisLangsung ? "Ya" : "Tidak"}`,
    "",
    snapshot.disclaimer,
  ].join("\n");
}

export default function DiagnosaAiPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<DiagnosaAiHistoryMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnosaAiId, setDiagnosaAiId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DiagnosaAiSnapshot | null>(null);

  const canSend = useMemo(() => {
    return Boolean(prompt.trim() || selectedImage) && !loading;
  }, [prompt, selectedImage, loading]);

  const serviceHref = diagnosaAiId
    ? `/tiket_servis?diagnosa_ai_id=${encodeURIComponent(diagnosaAiId)}`
    : "/tiket_servis";

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputElement = event.currentTarget;
    const file = inputElement.files?.[0];

    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      notifications.show({
        color: "red",
        title: "Format gambar tidak valid",
        message: "Gunakan gambar JPG, JPEG, PNG, atau WEBP.",
        icon: <IconAlertCircle size={18} />,
        autoClose: 3000,
      });

      inputElement.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      notifications.show({
        color: "red",
        title: "Gambar terlalu besar",
        message: `Ukuran gambar maksimal ${MAX_IMAGE_SIZE_MB} MB.`,
        icon: <IconAlertCircle size={18} />,
        autoClose: 3000,
      });

      inputElement.value = "";
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
    } catch {
      notifications.show({
        color: "red",
        title: "Upload gagal",
        message: "Gambar tidak bisa diproses.",
        icon: <IconAlertCircle size={18} />,
        autoClose: 3000,
      });
    } finally {
      inputElement.value = "";
    }
  };

  const handleSend = async () => {
    if (!canSend) return;

    const userText = prompt.trim() || "Mohon analisis gambar perangkat saya.";

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text: userText,
      image: selectedImage,
    };

    const previousMessages = messages;
    const currentMessages = [...previousMessages, userMessage];

    setMessages(currentMessages);
    setPrompt("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await sendDiagnosaAiChat({
        message: userText,
        imageBase64: userMessage.image ?? null,
        history,
        diagnosaAiId,
      });

      if (!response.success) {
        notifications.show({
          color: "red",
          title: "Diagnosa AI gagal",
          message: response.message,
          icon: <IconAlertCircle size={18} />,
          autoClose: 3500,
        });

        setMessages(previousMessages);
        return;
      }

      const assistantDisplayText = buildAssistantDisplayText(
        response.data.assistantMessage,
        response.data.snapshot
      );

      const aiMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        text: assistantDisplayText,
      };

      setMessages([...currentMessages, aiMessage]);
      setHistory(response.data.nextHistory);
      setDiagnosaAiId(response.data.diagnosaAiId);
      setSnapshot(response.data.snapshot);

      notifications.show({
        color: "green",
        title: "Analisis berhasil",
        message: `Sumber: ${response.data.source} · Model: ${response.data.model}`,
        icon: <IconCheck size={18} />,
        autoClose: 2200,
      });
    } catch {
      notifications.show({
        color: "red",
        title: "Terjadi kesalahan",
        message: "Gagal terhubung ke server Diagnosa AI.",
        icon: <IconAlertCircle size={18} />,
        autoClose: 3500,
      });

      setMessages(previousMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicketService = () => {
    if (!diagnosaAiId || !snapshot) return;

    sessionStorage.setItem(
      "dvc_diagnosa_ai_ticket_prefill",
      JSON.stringify({
        diagnosaAiId,
        gejala: snapshot.gejala,
      })
    );
  };

  return (
    <Box bg="#F5F5F5" mih="100vh">
      <Container size="lg" py={36}>
        <Stack gap={10} align="center">
          <Title
            order={1}
            ta="center"
            style={{
              fontSize: "clamp(42px, 4vw, 64px)",
              fontWeight: 900,
              color: "#111111",
              
            }}
          >
            Diagnosa AI
          </Title>

          <Text
            ta="center"
            fw={700}
            c="#7A7F87"
            style={{
              fontSize: "clamp(20px, 2vw, 34px)",
            }}
          >
            Masukkan gejala atau upload gambar untuk analisis awal
          </Text>

          <Text
            ta="center"
            c="#6B7280"
            maw={760}
            fz={16}
          >
            Hasil AI hanya sebagai diagnosa awal dan tidak menjadi keputusan
            final. Pemeriksaan teknisi tetap diperlukan untuk memastikan
            kerusakan perangkat.
          </Text>
        </Stack>

        <Paper
          mt={28}
          radius="xl"
          p="md"
          bg="#E5E5E5"
          style={{
            minHeight: 760,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid #D6D6D6",
          }}
        >
          <Stack gap={18} style={{ flex: 1 }}>
            {messages.length === 0 && !loading && (
              <Group justify="center" style={{ flex: 1 }}>
                <Paper
                  radius="xl"
                  p="xl"
                  bg="#D8D8D8"
                  style={{
                    maxWidth: 620,
                    textAlign: "center",
                  }}
                >
                  <Text c="#374151" fw={700} fz={20}>
                    Ceritakan gejala perangkatmu, misalnya laptop mati total,
                    layar blank, printer tidak menarik kertas, atau upload foto
                    kondisi perangkat.
                  </Text>
                </Paper>
              </Group>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <Group
                  key={message.id}
                  justify={isUser ? "flex-end" : "flex-start"}
                  align="flex-start"
                >
                  <Stack
                    gap={14}
                    align={isUser ? "flex-end" : "flex-start"}
                    maw="75%"
                  >
                    {message.image && (
                      <Paper
                        radius="xl"
                        p="md"
                        bg="#D8D8D8"
                        style={{
                          width: 280,
                          height: 150,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          src={message.image}
                          alt="Uploaded preview"
                          fill
                          unoptimized
                          sizes="280px"
                          style={{ objectFit: "contain" }}
                        />
                      </Paper>
                    )}

                    <Paper
                      radius="xl"
                      p="lg"
                      bg={isUser ? "#0D4CB5" : "#6B7280"}
                      style={{
                        maxWidth: 620,
                      }}
                    >
                      <Text
                        c="#FFFFFF"
                        fw={700}
                        style={{
                          fontSize: 17,
                          lineHeight: 1.6,
                          whiteSpace: "pre-line",
                          
                        }}
                      >
                        {message.text}
                      </Text>
                    </Paper>
                  </Stack>
                </Group>
              );
            })}

            {loading && (
              <Group justify="flex-start">
                <Paper radius="xl" p="lg" bg="#6B7280">
                  <Text c="#FFFFFF" fw={700} >
                    Sedang menganalisis...
                  </Text>
                </Paper>
              </Group>
            )}
          </Stack>

          <Stack gap={16} mt={28}>
            {selectedImage && (
              <Paper
                radius="lg"
                p="sm"
                bg="#D8D8D8"
                style={{
                  width: 190,
                  height: 120,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={selectedImage}
                  alt="Preview"
                  fill
                  unoptimized
                  sizes="190px"
                  style={{ objectFit: "contain" }}
                />

                <ActionIcon
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Hapus gambar"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 2,
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Paper>
            )}

            <Paper
              radius="xl"
              px="md"
              py="xs"
              bg="#D9D9D9"
              style={{
                border: "1px solid #D0D0D0",
              }}
            >
              <Group align="center" wrap="nowrap">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="xl"
                  onClick={handlePickImage}
                  disabled={loading}
                  aria-label="Upload gambar"
                >
                  <IconPhotoPlus size={34} />
                </ActionIcon>

                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.currentTarget.value)}
                  placeholder="Tulis gejala perangkat di sini..."
                  autosize
                  minRows={1}
                  maxRows={4}
                  variant="unstyled"
                  disabled={loading}
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      fontSize: 18,
                      lineHeight: 1.4,
                      color: "#333333",
                      
                    },
                  }}
                />

                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="xl"
                  onClick={handleSend}
                  disabled={!canSend}
                  aria-label="Kirim pesan"
                >
                  <IconSend size={34} />
                </ActionIcon>
              </Group>
            </Paper>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              hidden
              onChange={handleImageChange}
            />

            <Group justify="space-between" align="center">

              <Button
                component="a"
                href={serviceHref}
                onClick={handleOpenTicketService}
                radius="md"
                style={{
                  minWidth: 190,
                  height: 46,
                  backgroundColor: "#0D4CB5",
                  fontSize: 18,
                  fontWeight: 700,
                  
                }}
              >
                {diagnosaAiId ? "Buat Tiket Servis" : "Servis"}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>

      {/* FOOTER TANPA ANIMASI */}
            <Box
              mt={60}
              style={{
                backgroundColor: "#F5F5F5",
              }}
            >
              <Container size="xl" py={60}>
                <Group
                  justify="space-between"
                  align="flex-start"
                  gap={60}
                  wrap="wrap"
                >
                  {/* KIRI */}
                  <Group
                    align="flex-start"
                    gap={24}
                    wrap="nowrap"
                    style={{
                      flex: 1,
                      minWidth: 320,
                    }}
                  >
                    <Box
                      style={{
                        position: "relative",
                        width: 110,
                        height: 110,
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src="/images/logo-dvc.png"
                        alt="DVC Computer"
                        fill
                        sizes="110px"
                        style={{ objectFit: "contain" }}
                      />
                    </Box>
      
                    <Stack gap={10} maw={520}>
                      <Title
                        order={3}
                        c="#111111"
                        style={{
                          fontSize: "clamp(24px, 2vw, 34px)",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          
                        }}
                      >
                        DVC SMART SERVICE
                      </Title>
      
                      <Text
                        c="#4B5563"
                        style={{
                          fontSize: "clamp(16px, 1.2vw, 22px)",
                          lineHeight: 1.7,
                          
                        }}
                      >
                        Solusi modern untuk penjualan dan servis perangkat
                        komputer dengan fitur tiket servis, drop point,
                        dan diagnosa AI.
                      </Text>
                    </Stack>
                  </Group>
      
                  {/* KANAN */}
                  <Stack
                    gap={14}
                    align="flex-end"
                    style={{
                      minWidth: 320,
                    }}
                  >
                    <Title
                      order={3}
                      c="#111111"
                      style={{
                        fontSize: "clamp(24px, 2vw, 34px)",
                        fontWeight: 800,
                        
                      }}
                    >
                      CONTACT
                    </Title>
      
                    <Group gap={8} wrap="nowrap">
                      <IconMapPin size={18} color="#111111" />
      
                      <Text
                        c="#4B5563"
                        ta="right"
                        style={{
                          fontSize: "clamp(15px, 1vw, 18px)",
                          lineHeight: 1.6,
                          
                        }}
                      >
                        Jl. Ciung Wanara, No. 99X,
                        Kec. Sukawati Bali 80582
                      </Text>
                    </Group>
      
                    <Group gap={8}>
                      <IconPhone size={18} color="#111111" />
      
                      <Text
                        c="#4B5563"
                        style={{
                          fontSize: "clamp(15px, 1vw, 18px)",
                        }}
                      >
                        08174762502
                      </Text>
                    </Group>
                  </Stack>
                </Group>
              </Container>
      
              {/* COPYRIGHT */}
              <Box
                py={18}
                bg="#0D3F8F"
                style={{
                  textAlign: "center",
                }}
              >
                <Text c="white" size="sm">
                  © 2026 DVC Smart Service. All rights reserved.
                </Text>
              </Box>
            </Box>
    </Box>
  );
}