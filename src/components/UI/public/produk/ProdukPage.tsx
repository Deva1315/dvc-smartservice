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
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconMapPin,
  IconPhone,
  IconSearch,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import {
  getPublicProdukListRequest,
  type PublicKategoriProduk,
  type PublicProdukItem,
} from "@/lib/public/public-produk.client";

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

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
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

function getProductImageSource(image: string | null) {
  if (!image) {
    return "/images/produk/default-product.png";
  }

  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:image")
  ) {
    return image;
  }

  return `data:image/jpeg;base64,${image}`;
}

function ProductCard({ item }: { item: PublicProdukItem }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.25,
      }}
    >
      <Anchor
        href={`/produk/${item.slug}`}
        underline="never"
        style={{ color: "inherit" }}
      >
        <Paper
          radius="xl"
          p="lg"
          bg="#FFFFFF"
          shadow="sm"
          style={{
            minHeight: 260,
            border: "1px solid rgba(0,0,0,0.06)",
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
        >
          <Stack align="center" justify="space-between" gap={14} h="100%">
            <Text
              ta="center"
              fw={700}
              c="#111111"
              style={{
                fontSize: 16,
                lineHeight: 1.35,
                minHeight: 42,
              }}
            >
              {item.nama_barang}
            </Text>

            <Box
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 200,
                height: 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <motion.img
                src={getProductImageSource(item.gambar)}
                alt={item.nama_barang}
                whileHover={{
                  scale: 1.08,
                }}
                transition={{
                  duration: 0.3,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>

            <Stack gap={4} align="center">
              <Text
                ta="center"
                fw={800}
                c="#0D4CB5"
                style={{
                  fontSize: 22,
                  lineHeight: 1.2,
                }}
              >
                {formatRupiah(item.harga)}
              </Text>

              <Text size="sm" c="dimmed" ta="center">
                {item.kategori_barang?.nama_kategori ?? "Produk"}
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Anchor>
    </motion.div>
  );
}

export default function ProdukPage() {
  const [search, setSearch] = useState("");
  const [activeKategoriId, setActiveKategoriId] = useState<string | "semua">(
    "semua"
  );
  const [produk, setProduk] = useState<PublicProdukItem[]>([]);
  const [kategori, setKategori] = useState<PublicKategoriProduk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProduk() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const result = await getPublicProdukListRequest({
          limit: 1000,
        });

        if (!isMounted) return;

        if (!result.success) {
          setProduk([]);
          setKategori([]);
          setErrorMessage(result.message);
          return;
        }

        setProduk(result.produk);
        setKategori(result.kategori);
      } catch (error) {
        console.error("LOAD PUBLIC PRODUK ERROR:", error);

        if (isMounted) {
          setProduk([]);
          setKategori([]);
          setErrorMessage("Terjadi kesalahan saat memuat produk.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduk();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return produk.filter((item) => {
      const matchKategori =
        activeKategoriId === "semua"
          ? true
          : item.id_kategori === activeKategoriId;

      const matchSearch = !keyword
        ? true
        : item.nama_barang.toLowerCase().includes(keyword) ||
          item.kode_barang.toLowerCase().includes(keyword) ||
          (item.merk_barang ?? "").toLowerCase().includes(keyword) ||
          (item.kategori_barang?.nama_kategori ?? "")
            .toLowerCase()
            .includes(keyword);

      return matchKategori && matchSearch;
    });
  }, [activeKategoriId, search, produk]);

  return (
    <Box bg="#F5F5F5">
      {/* SEARCH */}
      <Container size="xl" py={18}>
        <TextInput
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          placeholder="Search berdasarkan nama barang..."
          leftSection={<IconSearch size={18} />}
          radius="sm"
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
            backdropFilter: "blur(2px)",
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
            <Box maw={520}>
              <Text
                c="white"
                fw={700}
                style={{
                  fontSize: "clamp(30px, 3vw, 52px)",
                  lineHeight: 1.25,
                  textShadow: "0 4px 18px rgba(0,0,0,0.35)",
                  
                }}
              >
                Temukan Produk Komputer dan Perangkat Terbaik
              </Text>

              <Text
                mt={20}
                c="rgba(255,255,255,0.88)"
                style={{
                  fontSize: "clamp(16px, 1.2vw, 22px)",
                  lineHeight: 1.7,
                }}
              >
                Cari berbagai kebutuhan perangkat komputer, aksesoris, dan
                perlengkapan teknologi dengan mudah.
              </Text>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* PRODUK */}
      <Container size="xl" py={34}>
        <Stack gap={28}>
          <Title
            order={2}
            ta="center"
            style={{
              fontSize: "clamp(28px, 2.5vw, 44px)",
              fontWeight: 800,
              color: "#111111",
              
            }}
          >
            Kategori Produk
          </Title>

          <Group justify="center" gap="md">
            <Button
              type="button"
              radius="xl"
              onClick={() => setActiveKategoriId("semua")}
              style={{
                minWidth: 150,
                height: 48,
                backgroundColor: "#0D4CB5",
                color: "#FFFFFF",
                fontSize: 20,
                fontWeight: 700,
                
                opacity: activeKategoriId === "semua" ? 1 : 0.92,
                boxShadow:
                  activeKategoriId === "semua"
                    ? "0 0 0 3px rgba(13, 76, 181, 0.15)"
                    : "none",
                transition: "all 0.25s ease",
              }}
            >
              Semua
            </Button>

            {kategori.map((item) => {
              const isActive = activeKategoriId === item.id;

              return (
                <Button
                  key={item.id}
                  type="button"
                  radius="xl"
                  onClick={() => setActiveKategoriId(item.id)}
                  style={{
                    minWidth: 150,
                    height: 48,
                    backgroundColor: "#0D4CB5",
                    color: "#FFFFFF",
                    fontSize: 20,
                    fontWeight: 700,
                    
                    opacity: isActive ? 1 : 0.92,
                    boxShadow: isActive
                      ? "0 0 0 3px rgba(13, 76, 181, 0.15)"
                      : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  {item.nama_kategori}
                </Button>
              );
            })}
          </Group>

          {isLoading ? (
            <Paper radius="md" p="xl" bg="#FFFFFF">
              <Stack align="center" gap={12}>
                <Loader color="blue" />
                <Text fw={600} c="dimmed" >
                  Memuat data produk...
                </Text>
              </Stack>
            </Paper>
          ) : errorMessage ? (
            <Paper radius="md" p="xl" bg="#FFFFFF" ta="center">
              <Text fw={600} c="red">
                {errorMessage}
              </Text>
            </Paper>
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <SimpleGrid
                  cols={{ base: 1, sm: 2, lg: 4 }}
                  spacing={24}
                >
                  {filteredProducts.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </SimpleGrid>
              </motion.div>

              {filteredProducts.length === 0 && (
                <Paper radius="md" p="xl" bg="#FFFFFF" ta="center">
                  <Text fw={600} c="dimmed" >
                    Produk tidak ditemukan
                  </Text>
                </Paper>
              )}
            </>
          )}
        </Stack>
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