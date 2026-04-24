"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ActionIcon,
  Anchor,
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
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconCheck,
  IconMapPin,
  IconPhone,
  IconPhotoPlus,
  IconSend,
} from "@tabler/icons-react";
import { sendDiagnosaAiChat } from "@/lib/diagnosa-ai/diagnosa-ai.client";
import type {
  DiagnosaAiHistoryMessage,
  DiagnosaAiSnapshot,
} from "@/lib/diagnosa-ai/diagnosa-ai.types";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  image?: string | null;
};

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
    ...snapshot.kemungkinanPenyebab.map((item: string) => `- ${item}`),
    "",
    "Kemungkinan solusi:",
    ...snapshot.kemungkinanSolusi.map((item: string) => `- ${item}`),
    "",
    "Saran tindakan:",
    ...snapshot.saranTindakan.map((item: string) => `- ${item}`),
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
  const [loading, setLoading] = useState(false);
  const [diagnosaAiId, setDiagnosaAiId] = useState<string | null>(null);
  const [, setSnapshot] = useState<DiagnosaAiSnapshot | null>(null);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

const handleImageChange = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const inputElement = event.currentTarget;
  const file = inputElement.files?.[0];

  if (!file) return;

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
    if (!prompt.trim() && !selectedImage) return;
    if (loading) return;

    const userText = prompt.trim() || "Mohon analisis gambar perangkat saya.";

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: userText,
      image: selectedImage,
    };

    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    setPrompt("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const historyPayload: DiagnosaAiHistoryMessage[] = messages.map(
        (message) => ({
          role: message.role,
          content: message.text,
        })
      );

      const response = await sendDiagnosaAiChat({
        message: userText,
        imageBase64: userMessage.image ?? null,
        history: historyPayload,
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

        setMessages(messages);
        return;
      }

setSnapshot(response.data.snapshot);

const aiMessage: ChatMessage = {
  id: Date.now() + 1,
  role: "assistant",
  text: buildAssistantDisplayText(
    response.data.assistantMessage,
    response.data.snapshot
  ),
};

setMessages([...currentMessages, aiMessage]);
setDiagnosaAiId(response.data.diagnosaAiId);

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

      setMessages(messages);
    } finally {
      setLoading(false);
    }
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
            Masukkan gejala atau upload gambar untuk analisis
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
                    maw="62%"
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
                      bg={isUser ? "#D8D8D8" : "#BFC4CA"}
                      style={{
                        maxWidth: 420,
                      }}
                    >
                      <Text
                        c={isUser ? "#FFFFFF" : "#FFFFFF"}
                        fw={700}
                        style={{
                          fontSize: 18,
                          lineHeight: 1.5,
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
                <Paper radius="xl" p="lg" bg="#BFC4CA">
                  <Text c="#FFFFFF" fw={700}>
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
                  width: 180,
                  height: 110,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={selectedImage}
                  alt="Preview"
                  fill
                  unoptimized
                  sizes="180px"
                  style={{ objectFit: "contain" }}
                />
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
                  disabled={loading}
                >
                  <IconSend size={34} />
                </ActionIcon>
              </Group>
            </Paper>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            <Group justify="flex-end">
              <Button
                component="a"
                href="/tiket_servis"
                radius="md"
                style={{
                  minWidth: 170,
                  height: 46,
                  backgroundColor: "#0D4CB5",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Servis
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>

      <Box bg="#F5F5F5" pt={40}>
        <Container size="md">
          <Stack align="center" gap={14}>
            <Box
              style={{
                position: "relative",
                width: 180,
                height: 150,
              }}
            >
              <Image
                src="/images/logo-dvc.png"
                alt="DVC Computer"
                fill
                sizes="180px"
                style={{ objectFit: "contain" }}
              />
            </Box>

            <Group gap={8} justify="center">
              <IconPhone size={18} />
              <Text size="md" c="#111111">
                Telp : 08174762502
              </Text>
            </Group>

            <Group gap={8} justify="center" wrap="nowrap">
              <IconMapPin size={18} />
              <Text size="md" c="#111111" ta="center">
                Jl. Ciung Wanara, No. 99X, Kec. Sukawati Bali 80582
              </Text>
            </Group>

            <Group gap={14} justify="center" mt={6}>
              <Anchor href="#" underline="never" c="#111111" aria-label="Facebook">
                <IconBrandFacebook size={28} />
              </Anchor>
              <Anchor href="#" underline="never" c="#111111" aria-label="Instagram">
                <IconBrandInstagram size={28} />
              </Anchor>
              <Anchor href="#" underline="never" c="#111111" aria-label="Twitter">
                <IconBrandTwitter size={28} />
              </Anchor>
            </Group>
          </Stack>
        </Container>

        <Box mt={46} py={18} bg="#0D3F8F" style={{ textAlign: "center" }}>
          <Text c="white" size="sm">
            © 2026 All rights reserved.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}