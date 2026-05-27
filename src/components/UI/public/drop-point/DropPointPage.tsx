"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Container,
  Flex,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconClock,
  IconMapPin,
  IconPhone,
  IconSearch,
} from "@tabler/icons-react";
import {
  getPublicDropPointListRequest,
  type PublicDropPointApiRow,
} from "@/lib/public/public-drop-point.client";
import {
  generateDropPointSlug,
  type DropPointRow,
} from "@/utils/public/public-drop-point.utils";

const MotionDiv = motion.div;

type DropPointCardProps = {
  item: DropPointRow;
};

function mapApiDropPointToUi(item: PublicDropPointApiRow): DropPointRow {
  return {
    id: item.id,
    namaDropPoint: item.nama_drop_point,
    address: item.alamat,
    phone: item.phone ?? "-",
    jamOperasional: item.jam_operasional ?? "-",
  };
}

function DropPointCard({ item }: DropPointCardProps) {
  const slug = generateDropPointSlug(item);

  return (
    <Paper
      radius={22}
      px={{ base: 18, md: 26 }}
      py={{ base: 20, md: 26 }}
      style={{
        backgroundColor: "#B9D3F3",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
      }}
    >
      <Flex
        justify="space-between"
        align="stretch"
        gap={{ base: 20, md: 28 }}
        direction={{ base: "column", md: "row" }}
      >
        <Flex align="flex-start" gap={18} flex={1}>
          <ThemeIcon
            size={58}
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
            <IconMapPin size={28} stroke={2.1} />
          </ThemeIcon>

          <Stack gap={8} flex={1}>
            <Text
              fw={700}
              c="#111111"
              style={{
                fontSize: "clamp(22px, 2.4vw, 30px)",
                lineHeight: 1.15,
                fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
              }}
            >
              {item.namaDropPoint}
            </Text>

            <Text
              fw={600}
              c="#70747C"
              style={{
                fontSize: "clamp(16px, 1.9vw, 22px)",
                lineHeight: 1.4,
                fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
              }}
            >
              {item.address}
            </Text>

            <Flex align="center" gap={10} wrap="wrap">
              <IconPhone size={24} stroke={1.9} color="#70747C" />
              <Text
                c="#70747C"
                style={{
                  fontSize: "clamp(16px, 1.8vw, 22px)",
                  lineHeight: 1.3,
                  fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                }}
              >
                Telp : {item.phone}
              </Text>
            </Flex>

            <Flex align="center" gap={10} wrap="wrap">
              <IconClock size={24} stroke={1.9} color="#70747C" />
              <Text
                c="#70747C"
                style={{
                  fontSize: "clamp(16px, 1.8vw, 22px)",
                  lineHeight: 1.3,
                  fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
                  whiteSpace: "pre-line",
                }}
              >
                {item.jamOperasional}
              </Text>
            </Flex>
          </Stack>
        </Flex>

        <Flex
          align="center"
          justify={{ base: "flex-start", md: "flex-end" }}
          w={{ base: "100%", md: 220 }}
        >
          <Button
            component="a"
            href={`/drop-point/${slug}`}
            radius={14}
            h={56}
            px={26}
            style={{
              backgroundColor: "#0B4DB8",
              fontSize: "clamp(18px, 1.8vw, 22px)",
              fontWeight: 700,
              fontFamily: '"Trebuchet MS", "Comic Sans MS", cursive',
              boxShadow: "none",
            }}
          >
            Lihat Detail
          </Button>
        </Flex>
      </Flex>
    </Paper>
  );
}

export default function DropPointPage() {
  const [search, setSearch] = useState("");
  const [dropPoints, setDropPoints] = useState<DropPointRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDropPoints() {
      try {
        setIsLoading(true);

        const result = await getPublicDropPointListRequest();

        if (!isMounted) return;

        if (!result.success) {
          setDropPoints([]);
          return;
        }

        setDropPoints(result.dropPoints.map(mapApiDropPointToUi));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDropPoints();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDropPoints = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return dropPoints;
    }

    return dropPoints.filter((item) => {
      return (
        item.namaDropPoint.toLowerCase().includes(keyword) ||
        item.address.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword)
      );
    });
  }, [search, dropPoints]);

return (
  <Box
    style={{
      backgroundColor: "#EFEFEF",
      minHeight: "calc(100vh - 90px)",
    }}
    pt={{ base: 46, md: 58 }}
    pb={{ base: 70, md: 90 }}
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
            mb={20}
            style={{
              fontSize: "clamp(44px, 6vw, 78px)",
              lineHeight: 1.05,
              color: "#000000",
              fontWeight: 700,
            }}
          >
            Drop Point
          </Title>

          <Text
            ta="center"
            mb={10}
            style={{
              fontSize: "clamp(22px, 2.7vw, 34px)",
              lineHeight: 1.25,
              color: "#7C808A",
              fontWeight: 700,
  
            }}
          >
            Temukan Lokasi Drop Point Yang Tersedia Dari Kami
          </Text>
        </MotionDiv>

        {/* SEARCH */}
        <MotionDiv
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          style={{
            width: "100%",
            maxWidth: 720,
            marginBottom: 34,
          }}
        >
          <Box w="100%" maw={720}>
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search..."
              leftSection={<IconSearch size={18} stroke={1.8} />}
              radius={8}
              size="md"
              styles={{
                input: {
                  height: 48,
                  borderColor: "#4A4A4A",
                  fontSize: 15,
                  backgroundColor: "#F5F5F5",
                },
              }}
            />
          </Box>
        </MotionDiv>

        {/* CONTENT */}
        <Stack w="100%" maw={920} gap={36}>
          {isLoading ? (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                radius={20}
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
                    Memuat data drop point...
                  </Text>
                </Stack>
              </Paper>
            </MotionDiv>
          ) : filteredDropPoints.length > 0 ? (
            filteredDropPoints.map((item, index) => (
              <MotionDiv
                key={item.id}
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                }}
              >
                <DropPointCard item={item} />
              </MotionDiv>
            ))
          ) : (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                radius={20}
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
                  Drop point tidak ditemukan.
                </Text>
              </Paper>
            </MotionDiv>
          )}
        </Stack>
      </Stack>
    </Container>
  </Box>
);
}