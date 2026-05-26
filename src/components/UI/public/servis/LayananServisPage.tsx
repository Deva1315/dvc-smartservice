"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconMapPin,
  IconPhone,
  IconSearch,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import CustomTable, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";
import {
  getPublicJasaServisListRequest,
  type PublicJasaServisItem,
} from "@/lib/public/public-jasa-servis.client";

type LayananServisRow = Record<string, unknown> & {
  id: string;
  nama_jasa_servis: string;
  deskripsi: string | null;
  harga: string;
  harga_sort: number;
  jam_operasional: string | null;
};

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

function formatRupiah(value: string | number) {
  const numberValue = Number(value);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numberValue) ? numberValue : 0);
}

function mapJasaServisToRow(item: PublicJasaServisItem): LayananServisRow {
  const hargaNumber = Number(item.harga);

  return {
    id: item.id,
    nama_jasa_servis: item.nama_jasa_servis,
    deskripsi: item.deskripsi,
    harga: item.harga,
    harga_sort: Number.isFinite(hargaNumber) ? hargaNumber : 0,
    jam_operasional: item.jam_operasional,
  };
}

export default function LayananServisPage() {
  const [search, setSearch] = useState("");
  const [jasaServis, setJasaServis] = useState<LayananServisRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadJasaServis() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const result = await getPublicJasaServisListRequest({
          limit: 1000,
        });

        if (!isMounted) return;

        if (!result.success) {
          setJasaServis([]);
          setErrorMessage(result.message);
          return;
        }

        setJasaServis(result.jasaServis.map(mapJasaServisToRow));
      } catch (error) {
        console.error("LOAD PUBLIC JASA SERVIS ERROR:", error);

        if (isMounted) {
          setJasaServis([]);
          setErrorMessage("Terjadi kesalahan saat memuat layanan servis.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadJasaServis();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return jasaServis;
    }

    return jasaServis.filter((item) => {
      return (
        item.nama_jasa_servis.toLowerCase().includes(keyword) ||
        (item.deskripsi ?? "").toLowerCase().includes(keyword) ||
        (item.jam_operasional ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [search, jasaServis]);

  const columns: TableColumn<LayananServisRow>[] = [
    {
      key: "nama_jasa_servis",
      label: "Nama Jasa Servis",
      sortable: true,
      width: "36%",
      render: (row) => (
        <Text fw={600} c="#111111" fz={18}>
          {row.nama_jasa_servis}
        </Text>
      ),
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      width: "34%",
      render: (row) => (
        <Text c="#374151" fz={16}>
          {row.deskripsi ?? "-"}
        </Text>
      ),
    },
    {
      key: "harga_sort",
      label: "Harga",
      sortable: true,
      width: "15%",
      render: (row) => (
        <Text fw={700} c="#0D4CB5" fz={18}>
          {formatRupiah(row.harga)}
        </Text>
      ),
    },
    {
      key: "jam_operasional",
      label: "Jam Operasional",
      width: "15%",
      render: (row) => (
        <Text c="#374151" fz={16}>
          {row.jam_operasional ?? "-"}
        </Text>
      ),
    },
  ];

  return (
    <Box bg="#F5F5F5" mih="100vh">
      {/* HERO */}
      <Box
        style={{
          position: "relative",
          minHeight: 500,
          backgroundImage: "url('/images/hero-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 100%)",
          }}
        />

        <Container
          size="xl"
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: 500,
            display: "flex",
            alignItems: "center",
          }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <Box maw={560}>
              <Text
                c="white"
                fw={800}
                style={{
                  fontSize: "clamp(34px, 3vw, 56px)",
                  lineHeight: 1.2,
                  marginBottom: 18,
                }}
              >
                Layanan Servis Profesional untuk Berbagai Perangkat
              </Text>

              <Text
                c="rgba(255,255,255,0.88)"
                style={{
                  fontSize: "clamp(18px, 1.3vw, 24px)",
                  lineHeight: 1.7,
                }}
              >
                Temukan layanan servis komputer, laptop, printer, dan perangkat
                lainnya dengan proses cepat dan transparan.
              </Text>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* CONTENT */}
      <Container size="xl" py={50}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
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
              Layanan Servis
            </Title>

            <Text
              ta="center"
              fw={700}
              c="#7A7F87"
              style={{
                fontSize: "clamp(20px, 2vw, 34px)",
              }}
            >
              Temukan Layanan Servis Yang Tersedia Di Toko Kami
            </Text>
          </Stack>
        </motion.div>

        {/* SEARCH */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Container size="md" px={0} mt={28}>
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search layanan servis..."
              leftSection={<IconSearch size={18} />}
              radius="md"
              size="md"
              styles={{
                input: {
                  height: 52,
                  border: "2px solid #D9D9D9",
                  backgroundColor: "#FFFFFF",
                  fontSize: 15,
                  borderRadius: 14,
                  transition: "all 0.25s ease",
                },
              }}
            />
          </Container>
        </motion.div>

        {/* TABLE */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Box mt={40}>
            {errorMessage ? (
              <Paper radius="xl" p="xl" bg="#FFFFFF" ta="center">
                <Text fw={600} c="red">
                  {errorMessage}
                </Text>
              </Paper>
            ) : (
              <Paper
                radius="2xl"
                shadow="sm"
                p="md"
                bg="#FFFFFF"
                style={{
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <CustomTable
                  data={filteredData}
                  columns={columns}
                  isLoading={isLoading}
                  searchable={false}
                  showFooter={false}
                  emptyText="Layanan servis tidak ditemukan"
                />
              </Paper>
            )}

            {isLoading ? (
              <Stack align="center" mt={18} gap={8}>
                <Loader color="blue" size="sm" />
                <Text size="sm" c="dimmed" fw={600}>
                  Memuat data layanan servis...
                </Text>
              </Stack>
            ) : null}
          </Box>
        </motion.div>

        {/* BUTTON */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <Group justify="center" mt={42}>
            <Button
              component="a"
              href="/tiket_servis"
              radius="xl"
              style={{
                minWidth: 280,
                height: 64,
                backgroundColor: "#0D4CB5",
                fontSize: 20,
                fontWeight: 700,
                transition: "all 0.25s ease",
              }}
            >
              Buat Tiket Servis
            </Button>
          </Group>
        </motion.div>
      </Container>

      {/* FOOTER TANPA ANIMASI */}
      <Box bg="#F5F5F5" pt={72}>
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
              <Anchor
                href="#"
                underline="never"
                c="#111111"
                aria-label="Facebook"
              >
                <IconBrandFacebook size={28} />
              </Anchor>

              <Anchor
                href="#"
                underline="never"
                c="#111111"
                aria-label="Instagram"
              >
                <IconBrandInstagram size={28} />
              </Anchor>

              <Anchor
                href="#"
                underline="never"
                c="#111111"
                aria-label="Twitter"
              >
                <IconBrandTwitter size={28} />
              </Anchor>
            </Group>
          </Stack>
        </Container>

        <Box
          mt={46}
          py={18}
          bg="#0D3F8F"
          style={{ textAlign: "center" }}
        >
          <Text c="white" size="sm">
            © 2026 All rights reserved. DVC Smart Service
          </Text>
        </Box>
      </Box>
    </Box>
  );
}