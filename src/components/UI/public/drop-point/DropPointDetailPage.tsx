"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconClock,
  IconExternalLink,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { getPublicDropPointDetailRequest } from "@/lib/public/public-drop-point.client";
import {
  buildDropPointMapsUrl,
  type DropPointRow,
} from "@/utils/public/public-drop-point.utils";

type DropPointDetailPageProps = {
  dropPointId: string;
};

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <Stack gap={4}>
      <Text
        fw={700}
        c="#4B5563"
        style={{
          fontSize: 15,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Text>

      <Text
        c="#111827"
        style={{
          fontSize: 17,
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {value}
      </Text>
    </Stack>
  );
}

function mapApiDropPointToUi(item: {
  id: string;
  nama_drop_point: string;
  alamat: string;
  phone: string | null;
  jam_operasional: string | null;
}): DropPointRow {
  return {
    id: item.id,
    namaDropPoint: item.nama_drop_point,
    address: item.alamat,
    phone: item.phone ?? "-",
    jamOperasional: item.jam_operasional ?? "-",
  };
}

export default function DropPointDetailPage({
  dropPointId,
}: DropPointDetailPageProps) {
  const [dropPoint, setDropPoint] = useState<DropPointRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDropPointDetail() {
      try {
        setIsLoading(true);
        setIsNotFound(false);

        const result = await getPublicDropPointDetailRequest(dropPointId);

        if (!isMounted) return;

        if (!result.success) {
          setDropPoint(null);
          setIsNotFound(true);
          return;
        }

        setDropPoint(mapApiDropPointToUi(result.dropPoint));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDropPointDetail();

    return () => {
      isMounted = false;
    };
  }, [dropPointId]);

  if (isLoading) {
    return (
      <Box
        style={{
          backgroundColor: "#EFEFEF",
          minHeight: "calc(100vh - 140px)",
        }}
        pt={{ base: 42, md: 56 }}
        pb={{ base: 70, md: 90 }}
      >
        <Container size={1080}>
          <Paper
            radius={22}
            px={24}
            py={40}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
            }}
          >
            <Stack align="center" gap={12}>
              <Loader color="blue" />
              <Text
                ta="center"
                c="#6B7280"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Memuat detail drop point...
              </Text>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (isNotFound || !dropPoint) {
    return (
      <Box
        style={{
          backgroundColor: "#EFEFEF",
          minHeight: "calc(100vh - 140px)",
        }}
        pt={{ base: 42, md: 56 }}
        pb={{ base: 70, md: 90 }}
      >
        <Container size={1080}>
          <Stack gap={22}>
            <Button
              component="a"
              href="/drop-point"
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              px={0}
              w="fit-content"
              style={{
                color: "#0B4DB8",
                fontWeight: 700,
              }}
            >
              Kembali ke daftar drop point
            </Button>

            <Paper
              radius={22}
              px={24}
              py={40}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
              }}
            >
              <Text
                ta="center"
                c="#6B7280"
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Detail drop point tidak ditemukan.
              </Text>
            </Paper>
          </Stack>
        </Container>
      </Box>
    );
  }

  const mapsUrl = buildDropPointMapsUrl(dropPoint);

  return (
    <Box
      style={{
        backgroundColor: "#EFEFEF",
        minHeight: "calc(100vh - 140px)",
      }}
      pt={{ base: 42, md: 56 }}
      pb={{ base: 70, md: 90 }}
    >
      <Container size={1080}>
        <Stack gap={22}>
          <Button
            component="a"
            href="/drop-point"
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            px={0}
            w="fit-content"
            style={{
              color: "#0B4DB8",
              fontWeight: 700,
            }}
          >
            Kembali ke daftar drop point
          </Button>

          <Stack align="center" gap={0}>
            <Title
              order={1}
              ta="center"
              mb={14}
              style={{
                fontSize: "clamp(40px, 5.5vw, 72px)",
                lineHeight: 1.08,
                color: "#000000",
                fontWeight: 700,
                fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
              }}
            >
              Detail Drop Point
            </Title>

            <Text
              ta="center"
              maw={760}
              style={{
                fontSize: "clamp(20px, 2.3vw, 28px)",
                lineHeight: 1.35,
                color: "#7C808A",
                fontWeight: 700,
                fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
              }}
            >
              Lihat informasi lengkap lokasi drop point dan buka lokasi di Google Maps
            </Text>
          </Stack>

          <Paper
            radius={24}
            px={{ base: 20, md: 28 }}
            py={{ base: 22, md: 28 }}
            style={{
              backgroundColor: "#B9D3F3",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Flex
              justify="space-between"
              align="stretch"
              gap={{ base: 22, md: 30 }}
              direction={{ base: "column", md: "row" }}
            >
              <Flex align="flex-start" gap={18} flex={1}>
                <ThemeIcon
                  size={62}
                  radius="xl"
                  variant="filled"
                  styles={{
                    root: {
                      backgroundColor: "#FFFFFF",
                      color: "#97B9E6",
                      flexShrink: 0,
                    },
                  }}
                >
                  <IconMapPin size={30} stroke={2.1} />
                </ThemeIcon>

                <Stack gap={10} flex={1}>
                  <Text
                    fw={700}
                    c="#111111"
                    style={{
                      fontSize: "clamp(24px, 2.7vw, 34px)",
                      lineHeight: 1.15,
                      fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                    }}
                  >
                    {dropPoint.namaDropPoint}
                  </Text>

                  <Text
                    fw={600}
                    c="#70747C"
                    style={{
                      fontSize: "clamp(17px, 1.9vw, 22px)",
                      lineHeight: 1.45,
                      fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                    }}
                  >
                    {dropPoint.address}
                  </Text>

                  <Flex align="center" gap={10} wrap="wrap">
                    <IconPhone size={22} stroke={1.9} color="#70747C" />
                    <Text
                      c="#70747C"
                      style={{
                        fontSize: "clamp(16px, 1.8vw, 20px)",
                        lineHeight: 1.35,
                        fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                      }}
                    >
                      Telp : {dropPoint.phone}
                    </Text>
                  </Flex>

                  <Flex align="center" gap={10} wrap="wrap">
                    <IconClock size={22} stroke={1.9} color="#70747C" />
                    <Text
                      c="#70747C"
                      style={{
                        fontSize: "clamp(16px, 1.8vw, 20px)",
                        lineHeight: 1.35,
                        fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                        whiteSpace: "pre-line",
                      }}
                    >
                      {dropPoint.jamOperasional}
                    </Text>
                  </Flex>
                </Stack>
              </Flex>

              <Stack justify="center" gap={12} w={{ base: "100%", md: 280 }}>
                <Button
                  component="a"
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  radius={14}
                  h={52}
                  rightSection={<IconExternalLink size={18} />}
                  style={{
                    backgroundColor: "#0B4DB8",
                    fontSize: 18,
                    fontWeight: 700,
                    boxShadow: "none",
                  }}
                >
                  Buka di Google Maps
                </Button>
              </Stack>
            </Flex>
          </Paper>

          <Paper
            radius={22}
            px={{ base: 20, md: 24 }}
            py={{ base: 22, md: 26 }}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
            }}
          >
            <Stack gap={16}>
              <Text
                fw={700}
                c="#111827"
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                }}
              >
                Informasi Lokasi
              </Text>

              <Divider />

              <InfoItem label="Nama Drop Point" value={dropPoint.namaDropPoint} />
              <InfoItem label="Alamat" value={dropPoint.address} />
              <InfoItem label="Nomor Telepon" value={dropPoint.phone} />
              <InfoItem label="Jam Operasional" value={dropPoint.jamOperasional} />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}