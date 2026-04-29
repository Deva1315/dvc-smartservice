/* eslint-disable @next/next/no-img-element */
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
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconMapPin,
  IconPhone,
  IconSearch,
} from "@tabler/icons-react";
import {
  getPublicProdukListRequest,
  type PublicKategoriProduk,
  type PublicProdukItem,
} from "@/lib/public/public-produk.client";

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
    <Anchor
      href={`/produk/${item.slug}`}
      underline="never"
      style={{ color: "inherit" }}
    >
      <Paper
        radius="md"
        p="md"
        bg="#E6E8EB"
        shadow="xs"
        style={{
          minHeight: 220,
          border: "1px solid rgba(0,0,0,0.04)",
          cursor: "pointer",
        }}
      >
        <Stack align="center" justify="space-between" gap={10} h="100%">
          <Text
            ta="center"
            fw={700}
            c="#111111"
            style={{
              fontSize: 15,
              lineHeight: 1.2,
              minHeight: 36,
            }}
          >
            {item.nama_barang}
          </Text>

          <Box
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 180,
              height: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={getProductImageSource(item.gambar)}
              alt={item.nama_barang}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          <Stack gap={2} align="center">
            <Text
              ta="center"
              fw={800}
              c="#111111"
              style={{
                fontSize: 18,
                lineHeight: 1.2,
              }}
            >
              {formatRupiah(item.harga)}
            </Text>

            <Text ta="center" size="xs" c="#6B7280" fw={600}>
              Stok: {item.stock}
            </Text>
          </Stack>
        </Stack>
      </Paper>
    </Anchor>
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
              height: 48,
              border: "2px solid #7B7B7B",
              backgroundColor: "#FFFFFF",
              fontSize: 15,
            },
          }}
        />
      </Container>

      <Box
        style={{
          position: "relative",
          minHeight: 500,
          backgroundImage: "url('/images/hero-banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.08) 100%)",
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
          <Box maw={400}>
            <Text
              c="white"
              style={{
                fontSize: "clamp(24px, 2.3vw, 42px)",
                lineHeight: 1.35,
              }}
            >
              Buat tiket servis, cek kerusakan perangkat, dan pantau proses
              perbaikan dengan praktis.
            </Text>
          </Box>
        </Container>
      </Box>

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
                <Text fw={600} c="dimmed">
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
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={24}>
                {filteredProducts.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </SimpleGrid>

              {filteredProducts.length === 0 && (
                <Paper radius="md" p="xl" bg="#FFFFFF" ta="center">
                  <Text fw={600} c="dimmed">
                    Produk tidak ditemukan
                  </Text>
                </Paper>
              )}
            </>
          )}
        </Stack>
      </Container>

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

        <Box mt={46} py={18} bg="#0D3F8F" style={{ textAlign: "center" }}>
          <Text c="white" size="sm">
            © 2026 All rights reserved. DVC Smart Service
          </Text>
        </Box>
      </Box>
    </Box>
  );
}