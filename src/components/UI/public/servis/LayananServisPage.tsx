"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
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
import CustomTable, { type TableColumn } from "@/components/table/custom-table-search/CustomTableSearch";
import { dummyJasaServis, type DummyJasaServis } from "@/lib/dummy/jasa-servis";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LayananServisPage() {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    return dummyJasaServis.filter((item) =>
      item.nama_jasa_servis.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

 const columns: TableColumn<DummyJasaServis>[] = [
  {
    key: "nama_jasa_servis",
    label: "Nama Jasa Servis",
    sortable: true,
    width: "36%",
    render: (row) => (
      <Text fw={500} c="#111111" fz={18}>
        {row.nama_jasa_servis}
      </Text>
    ),
  },
  {
    key: "deskripsi",
    label: "Deskripsi",
    width: "34%",
    render: (row) => (
      <Text c="#374151" fz={17}>
        {row.deskripsi ?? "-"}
      </Text>
    ),
  },
  {
    key: "harga",
    label: "Harga",
    sortable: true,
    width: "15%",
    render: (row) => (
      <Text fw={500} c="#111111" fz={18}>
        {formatRupiah(row.harga)}
      </Text>
    ),
  },
  {
    key: "jam_operasional",
    label: "Jam Operasional",
    width: "15%",
    render: (row) => (
      <Text c="#374151" fz={17}>
        {row.jam_operasional ?? "-"}
      </Text>
    ),
  },
];

  return (
    <Box bg="#F5F5F5" mih="100vh">
      <Container size="xl" py={48}>
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

        <Container size="md" px={0} mt={22}>
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search..."
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

        <Box mt={36}>
          <CustomTable
            data={filteredData}
            columns={columns}
            searchable={false}
            showFooter={false}
            emptyText="Layanan servis tidak ditemukan"
          />
        </Box>

        <Group justify="center" mt={36}>
          <Button
            component="a"
            href="/tiket_servis"
            radius="md"
            style={{
              minWidth: 280,
              height: 64,
              backgroundColor: "#0D4CB5",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Buat Tiket Servis
          </Button>
        </Group>
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