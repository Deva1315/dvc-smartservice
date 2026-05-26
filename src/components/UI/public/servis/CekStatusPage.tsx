"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  InputBase,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconChevronRight, IconPointFilled } from "@tabler/icons-react";
import { getCekStatusServisRequest } from "@/lib/public/cek-status-servis.client";
import {
  buildNamaPerangkat,
  formatRupiah,
  formatStatusServisLabel,
  getRingkasanProgress,
  getStatusPillColors,
  type TicketServisPublicRow,
} from "@/utils/public/cek-status-servis.utils";

const MotionDiv = motion.div;

type StatusInfoRowProps = {
  label: string;
  value?: string;
  valueNode?: ReactNode;
};

function StatusInfoRow({ label, value, valueNode }: StatusInfoRowProps) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      gap={{ base: 4, sm: 24 }}
      align={{ base: "flex-start", sm: "center" }}
    >
      <Text
        fw={500}
        c="#4B4B58"
        w={{ base: "100%", sm: 160 }}
        size="clamp(15px, 1.8vw, 18px)"
      >
        {label}
      </Text>

      <Box flex={1}>
        {valueNode ?? (
          <Text fw={500} c="#4B4B58" size="clamp(15px, 1.8vw, 18px)">
            {value ?? "-"}
          </Text>
        )}
      </Box>
    </Flex>
  );
}

function StatusPill({ label }: { label: string }) {
  const colors = getStatusPillColors(label);

  return (
    <Flex
      align="center"
      gap={8}
      px={16}
      py={6}
      w="fit-content"
      style={{
        borderRadius: 999,
        backgroundColor: colors.bg,
      }}
    >
      <Text
        fw={700}
        size="clamp(13px, 1.5vw, 16px)"
        c={colors.text}
        style={{ lineHeight: 1 }}
      >
        {label}
      </Text>

      <IconChevronRight size={14} color={colors.text} stroke={2.2} />
    </Flex>
  );
}

function mapApiTicketToUi(ticket: TicketServisPublicRow): TicketServisPublicRow {
  return {
    ...ticket,
    tanggalMasuk:
      ticket.tanggalMasuk instanceof Date
        ? ticket.tanggalMasuk
        : new Date(ticket.tanggalMasuk),
  };
}

function getDisplayedStatus(ticket: TicketServisPublicRow) {
  if (ticket.statusVerifikasi === "Menunggu Verifikasi") {
    return "Menunggu Verifikasi";
  }

  if (ticket.statusVerifikasi === "Ditolak") {
    return "Ditolak";
  }

  return formatStatusServisLabel(ticket.statusServis);
}

export default function CekStatusServisPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [selectedTicket, setSelectedTicket] =
    useState<TicketServisPublicRow | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ringkasanProgress = selectedTicket
    ? getRingkasanProgress(selectedTicket)
    : [];

  const handleSearch = async () => {
    const normalizedTicket = ticketNumber.trim().toUpperCase();

    if (!normalizedTicket) {
      setSelectedTicket(null);
      setErrorMessage("Nomor tiket servis wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await getCekStatusServisRequest(normalizedTicket);

      if (!result.success) {
        setSelectedTicket(null);
        setErrorMessage(result.message);
        return;
      }

      setSelectedTicket(mapApiTicketToUi(result.ticket));
      setErrorMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSearch();
    }
  };

return (
  <Box
    style={{
      backgroundColor: "#EFEFEF",
      minHeight: "calc(100vh - 90px)",
    }}
    py={{ base: 48, md: 72 }}
  >
    <Container size={1080}>
      <Stack align="center" gap={0}>
        {/* HERO */}
        <MotionDiv
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ width: "100%" }}
        >
          <Title
            order={1}
            ta="center"
            mb={22}
            style={{
              fontSize: "clamp(42px, 6vw, 76px)",
              lineHeight: 1.05,
              color: "#000000",
              fontWeight: 700,
              
            }}
          >
            Cek Status Servis
          </Title>

          <Text
            ta="center"
            mb={18}
            style={{
              fontSize: "clamp(20px, 2.6vw, 32px)",
              lineHeight: 1.25,
              color: "#7C808A",
              fontWeight: 700,
              
            }}
          >
            Masukkan Nomor Tiket Servis Anda Untuk Melacak Status
          </Text>
        </MotionDiv>

        {/* SEARCH BOX */}
        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          style={{ width: "100%", maxWidth: 820 }}
        >
          <Box w="100%" maw={820} mb={14}>
            <Paper
              radius={20}
              p={6}
              style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.03)",
              }}
            >
              <Flex
                align="center"
                gap={8}
                direction={{ base: "column", sm: "row" }}
              >
                <InputBase
                  value={ticketNumber}
                  onChange={(event) =>
                    setTicketNumber(event.currentTarget.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan nomor tiket disini..."
                  radius={16}
                  size="md"
                  flex={1}
                  w="100%"
                  styles={{
                    input: {
                      height: 50,
                      fontSize: 16,
                      color: "#6B7280",
                      paddingLeft: 18,
                      paddingRight: 18,
                      backgroundColor: "transparent",
                      border: "none",
                      
                    },
                  }}
                />

                <Button
                  onClick={() => void handleSearch()}
                  loading={isLoading}
                  radius={18}
                  h={44}
                  px={26}
                  style={{
                    backgroundColor: "#1657BB",
                    fontSize: 16,
                    fontWeight: 700,
                    minWidth: 130,
                    
                  }}
                >
                  Cek Status
                </Button>
              </Flex>
            </Paper>

            {errorMessage ? (
              <Text mt={10} c="red.6" fw={600} size="sm" > 
                {errorMessage}
              </Text>
            ) : null}
          </Box>
        </MotionDiv>

        {/* RESULT CARD */}
        {selectedTicket ? (
          <MotionDiv
            initial={{ opacity: 0, y: 50, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7 }}
            style={{ width: "100%", maxWidth: 820 }}
          >
            <Paper
              w="100%"
              maw={820}
              radius={18}
              style={{
                overflow: "hidden",
                border: "1px solid #E6E3E0",
                backgroundColor: "#F7F7F7",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
              }}
            >
              <Box
                px={{ base: 22, md: 34 }}
                py={{ base: 16, md: 18 }}
                style={{
                  background:
                    "linear-gradient(90deg, #E9E9ED 0%, #F4F4F6 55%, #F8F8FA 100%)",
                  borderBottom: "1px solid #ECE9E6",
                }}
              >
                <Text
                  fw={700}
                  c="#2F3040"
                  style={{
                    fontSize: "clamp(22px, 3vw, 34px)",
                    lineHeight: 1.1,
                    
                  }}
                >
                  Status Perbaikan
                </Text>
              </Box>

              <Box px={{ base: 22, md: 34 }} py={{ base: 18, md: 22 }}>
                <Stack gap={16}>
                  <StatusInfoRow
                    label="Tiket Servis"
                    value={selectedTicket.nomorTiket}
                  />

                  <StatusInfoRow
                    label="Status"
                    valueNode={
                      <StatusPill
                        label={getDisplayedStatus(selectedTicket)}
                      />
                    }
                  />

                  <StatusInfoRow
                    label="Perangkat"
                    value={buildNamaPerangkat(selectedTicket)}
                  />

                  <Divider color="#E6E1DB" my={4} />

                  <Stack gap={12}>
                    <Text
                      fw={700}
                      c="#3F4050"
                      style={{
                        fontSize: "clamp(20px, 2.2vw, 28px)",
                        fontFamily:
                          '"Trebuchet MS", "Comic Sans MS", cursive',
                        lineHeight: 1.1,
                      }}
                    >
                      Ringkasan Progres:
                    </Text>

                    <Stack gap={10}>
                      {ringkasanProgress.map((item, index) => (
                        <MotionDiv
                          key={`${item}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.1,
                          }}
                        >
                          <Flex align="flex-start" gap={10}>
                            <Box pt={4}>
                              <IconPointFilled
                                size={10}
                                color="#D1A55A"
                              />
                            </Box>

                            <Text
                              c="#6C6C76"
                              style={{
                                fontSize: "clamp(15px, 1.8vw, 18px)",
                                lineHeight: 1.45,
                                fontWeight: 500,
                              }}
                            >
                              {item}
                            </Text>
                          </Flex>
                        </MotionDiv>
                      ))}
                    </Stack>
                  </Stack>

                  <Divider color="#E6E1DB" my={4} />

                  <Stack gap={10}>
                    <StatusInfoRow
                      label="Estimasi Waktu"
                      value={selectedTicket.estimasiWaktu ?? "-"}
                    />

                    <StatusInfoRow
                      label="Estimasi Biaya"
                      value={
                        formatRupiah(selectedTicket.estimasiBiaya) ?? "-"
                      }
                    />
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </MotionDiv>
        ) : null}
      </Stack>
    </Container>
  </Box>
);
}