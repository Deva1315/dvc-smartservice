import Image from "next/image";
import {
    Anchor,
    Box,
    Button,
    Container,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandTwitter,
    IconMapPin,
    IconPhone,
} from "@tabler/icons-react";
import {
    dummyKategoriBarang,
    type DummyBarang,
} from "@/lib/dummy/product";

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function ProdukDetailPage({
    product,
}: {
    product: DummyBarang;
}) {
    const kategori = dummyKategoriBarang.find(
        (item) => item.id === product.id_kategori
    );

    return (
        <Box bg="#F5F5F5" mih="100vh">
            <Container size="xl" py={30}>
                <Anchor
                    href="/produk"
                    underline="never"
                    c="#0D4CB5"
                    fw={700}
                    style={{ fontSize: 16 }}
                >
                    ← Kembali ke Produk
                </Anchor>

                <Paper
                    mt={24}
                    radius="xl"
                    p={{ base: 20, md: 32 }}
                    bg="#FFFFFF"
                    shadow="sm"
                >
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
                        <Box
                            style={{
                                position: "relative",
                                width: "100%",
                                minHeight: 340,
                                borderRadius: 18,
                                backgroundColor: "#F1F3F5",
                                overflow: "hidden",
                            }}
                        >
                            <Image
                                src={product.gambar ?? "/images/produk/default-product.png"}
                                alt={product.nama_barang}
                                fill
                                sizes="(max-width: 48em) 100vw, 50vw"
                                style={{ objectFit: "contain", padding: 24 }}
                            />
                        </Box>

                        <Stack gap={18} justify="center">
                            <Box>
                                <Text c="#0D4CB5" fw={700} size="sm">
                                    {kategori?.nama_kategori ?? "Kategori"}
                                </Text>

                                <Title
                                    order={1}
                                    style={{
                                        fontSize: "clamp(28px, 2.8vw, 42px)",
                                        fontWeight: 800,
                                        color: "#111111",
                                    }}
                                >
                                    {product.nama_barang}
                                </Title>
                            </Box>

                            <Text fw={800} style={{ fontSize: 28, color: "#111111" }}>
                                {formatRupiah(product.harga)}
                            </Text>

                            <Text c="dimmed" style={{ fontSize: 16, lineHeight: 1.8 }}>
                                {product.deskripsi ?? "Belum ada deskripsi produk."}
                            </Text>

                            <SimpleGrid cols={2} spacing="md">
                                <Paper
                                    radius="md"
                                    p="md"
                                    bg="#F1F3F5"
                                    style={{ border: "1px solid #E5E7EB" }}
                                >
                                    <Text size="sm" fw={500} c="#6B7280">
                                        Kode Barang
                                    </Text>
                                    <Text fw={700} c="#111827" mt={4}>
                                        {product.kode_barang}
                                    </Text>
                                </Paper>

                                <Paper
                                    radius="md"
                                    p="md"
                                    bg="#F1F3F5"
                                    style={{ border: "1px solid #E5E7EB" }}
                                >
                                    <Text size="sm" fw={500} c="#6B7280">
                                        Merk
                                    </Text>
                                    <Text fw={700} c="#111827" mt={4}>
                                        {product.merk_barang ?? "-"}
                                    </Text>
                                </Paper>

                                <Paper
                                    radius="md"
                                    p="md"
                                    bg="#F1F3F5"
                                    style={{ border: "1px solid #E5E7EB" }}
                                >
                                    <Text size="sm" fw={500} c="#6B7280">
                                        Stok
                                    </Text>
                                    <Text fw={700} c="#111827" mt={4}>
                                        {product.stock.toString()}
                                    </Text>
                                </Paper>

                                <Paper
                                    radius="md"
                                    p="md"
                                    bg="#F1F3F5"
                                    style={{ border: "1px solid #E5E7EB" }}
                                >
                                    <Text size="sm" fw={500} c="#6B7280">
                                        ID Kategori
                                    </Text>
                                    <Text fw={700} c="#111827" mt={4}>
                                        {product.id_kategori.toString()}
                                    </Text>
                                </Paper>
                            </SimpleGrid>

                            <Group mt={10}>
                                <Button
                                    component="a"
                                    href="/produk"
                                    radius="md"
                                    style={{
                                        backgroundColor: "#0D4CB5",
                                        minWidth: 170,
                                        height: 46,
                                    }}
                                >
                                    Lihat Produk Lain
                                </Button>
                            </Group>
                        </Stack>
                    </SimpleGrid>
                </Paper>
            </Container>

            <Box bg="#F5F5F5" pt={30}>
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
                        © 2026 All rights reserved. DVC Smart Service
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}