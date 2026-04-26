"use client";

import { useState } from "react";
import {
    Button,
    Card,
    Group,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import {
    IconDeviceLaptop,
    IconTicket,
    IconUser,
} from "@tabler/icons-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import NotaPembayaranServisPDF, {
    type NotaPembayaranServisData,
} from "@/components/UI/dashboard/admin-penjualan/tiket-servis/pembayaran/NotaPembayaranServisPDF";

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AdminPenjualanPembayaranServisPage() {
    // 🔥 DUMMY DATA (besok ganti API)
    const data = {
        nomorTiket: "TSK-20260423-001",
        nama: "Anton Wijaya",
        perangkat: "Laptop - Asus VivoBook A412U",
        status: "Selesai",

        jasa: [
            { nama: "Perbaikan Laptop", harga: 150000 },
        ],

        sparepart: [
            { nama: "Power Supply Unit", qty: 1, harga: 350000 },
        ],
    };

    const [metode, setMetode] = useState("cash");
    const [nominal, setNominal] = useState(500000);

    const subtotalJasa = data.jasa.reduce((a, b) => a + b.harga, 0);
    const subtotalSparepart = data.sparepart.reduce(
        (a, b) => a + b.harga * b.qty,
        0
    );
    const total = subtotalJasa + subtotalSparepart;

    const notaData: NotaPembayaranServisData = {
        nomorTiket: data.nomorTiket,
        tanggalBayar: "23-04-2024",
        namaPelanggan: data.nama,
        noTelepon: "08123456789",
        perangkat: data.perangkat.replace("Laptop - ", ""),
        metodePembayaran: metode === "cash" ? "Cash" : "Transfer",
        items: [
            ...data.jasa.map((item) => ({
                nama: item.nama,
                qty: null,
                harga: item.harga,
            })),
            ...data.sparepart.map((item) => ({
                nama: item.nama,
                qty: item.qty,
                harga: item.harga,
            })),
        ],
    };

    return (
        <Stack gap={24}>
            {/* INFORMASI */}
            <Group align="flex-start" gap={20}>
                {/* LEFT */}
                <Stack style={{ flex: 2 }} gap={16}>
                    {/* INFO TIKET */}
                    <Card radius="lg" withBorder>
                        <Stack gap={10}>
                            <Text fw={700}>Informasi Tiket</Text>

                            <Group>
                                <IconTicket size={18} />
                                <Text>{data.nomorTiket}</Text>
                            </Group>

                            <Group>
                                <IconUser size={18} />
                                <Text>{data.nama}</Text>
                            </Group>

                            <Group>
                                <IconDeviceLaptop size={18} />
                                <Text>{data.perangkat}</Text>
                            </Group>

                            <Text c="green">{data.status}</Text>
                        </Stack>
                    </Card>

                    {/* RINCIAN */}
                    <Group align="flex-start" gap={16}>
                        {/* JASA */}
                        <Card radius="lg" withBorder style={{ flex: 1 }}>
                            <Stack gap={10}>
                                <Text fw={700}>Rincian Jasa</Text>

                                {data.jasa.map((item, i) => (
                                    <Group key={i} justify="space-between">
                                        <Text>{item.nama}</Text>
                                        <Text>{formatRupiah(item.harga)}</Text>
                                    </Group>
                                ))}

                                <Group justify="space-between" mt="md">
                                    <Text fw={700}>Subtotal</Text>
                                    <Text fw={700}>{formatRupiah(subtotalJasa)}</Text>
                                </Group>
                            </Stack>
                        </Card>

                        {/* SPAREPART */}
                        <Card radius="lg" withBorder style={{ flex: 1 }}>
                            <Stack gap={10}>
                                <Text fw={700}>Rincian Sparepart</Text>

                                {data.sparepart.map((item, i) => (
                                    <Group key={i} justify="space-between">
                                        <Text>
                                            {item.nama} x{item.qty}
                                        </Text>
                                        <Text>{formatRupiah(item.harga)}</Text>
                                    </Group>
                                ))}

                                <Group justify="space-between" mt="md">
                                    <Text fw={700}>Subtotal</Text>
                                    <Text fw={700}>
                                        {formatRupiah(subtotalSparepart)}
                                    </Text>
                                </Group>
                            </Stack>
                        </Card>
                    </Group>
                </Stack>

                {/* RIGHT */}
                <Stack style={{ flex: 1 }} gap={16}>
                    {/* RINGKASAN */}
                    <Card radius="lg" withBorder>
                        <Stack>
                            <Text fw={700}>Ringkasan Pembayaran</Text>

                            <Group justify="space-between">
                                <Text>Subtotal Jasa</Text>
                                <Text>{formatRupiah(subtotalJasa)}</Text>
                            </Group>

                            <Group justify="space-between">
                                <Text>Subtotal Sparepart</Text>
                                <Text>{formatRupiah(subtotalSparepart)}</Text>
                            </Group>

                            <Group justify="space-between" mt="sm">
                                <Text fw={700}>Total</Text>
                                <Text fw={700}>{formatRupiah(total)}</Text>
                            </Group>
                        </Stack>
                    </Card>

                    {/* FORM */}
                    <Card radius="lg" withBorder>
                        <Stack gap={10}>
                            <Text fw={700}>Pembayaran</Text>

                            <Select
                                label="Metode Pembayaran"
                                data={[
                                    { value: "cash", label: "Cash" },
                                    { value: "transfer", label: "Transfer" },
                                ]}
                                value={metode}
                                onChange={(val) => setMetode(val || "cash")}
                            />

                            <TextInput
                                label="Nominal Bayar"
                                value={formatRupiah(nominal)}
                                readOnly
                            />

                            <Text>Status Pembayaran</Text>
                            <Text c="orange">Belum Lunas</Text>

                            <Button fullWidth mt="md">
                                Simpan Pembayaran
                            </Button>

                            <PDFDownloadLink
                                document={<NotaPembayaranServisPDF data={notaData} />}
                                fileName={`nota-servis-${notaData.nomorTiket}.pdf`}
                                style={{
                                    textDecoration: "none",
                                }}
                            >
                                {({ loading }) => (
                                    <Button variant="outline" fullWidth disabled={loading}>
                                        {loading ? "Membuat Nota..." : "Cetak Nota"}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </Stack>
                    </Card>
                </Stack>
            </Group>

            {/* ACTION */}
            <Group justify="flex-end" mt="lg">
                <Button color="red">Batal</Button>
                <Button> Simpan Pembayaran </Button>
            </Group>
        </Stack>
    );
}