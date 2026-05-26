"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconEdit,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

import type { FormType } from "@/types/form-types";
import CustomTableSearch, {
  type TableColumn,
} from "@/components/table/custom-table-search/CustomTableSearch";

import TiketServisFormModal, {
  type TicketDropPointOption,
  type TicketRow,
  type TicketStatusServis,
  type TicketStatusVerifikasi,
} from "@/components/UI/public/form/TiketServisFormModal";

import {
  createPublicTiketServisRequest,
  getPublicTiketServisListRequest,
  getTiketServisNomorRequest,
  updatePublicTiketServisRequest,
  type PublicTicketRow,
  type PublicTicketStatusServis,
} from "@/lib/public/public-tiket-servis.client";

import { getPublicDropPointListRequest } from "@/lib/public/public-drop-point.client";

const MotionDiv = motion.div;

function formatTanggalIndonesia(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function mapApiStatusServisToUi(
  status: PublicTicketStatusServis
): TicketStatusServis {
  switch (status) {
    case "Belum_Diproses":
      return "Belum Diproses";
    case "Diproses":
      return "Diproses";
    case "Menunggu_Sparepart":
      return "Menunggu Sparepart";
    case "Selesai":
      return "Selesai";
    case "Diambil":
      return "Diambil";
    case "Dibatalkan":
      return "Dibatalkan";
    default:
      return "Belum Diproses";
  }
}

function getStatusColor(status: TicketStatusVerifikasi | TicketStatusServis) {
  switch (status) {
    case "Menunggu":
      return "yellow";
    case "Diterima":
      return "green";
    case "Ditolak":
      return "red";
    case "Belum Diproses":
      return "gray";
    case "Diproses":
      return "blue";
    case "Menunggu Sparepart":
      return "orange";
    case "Selesai":
      return "teal";
    case "Diambil":
      return "indigo";
    case "Dibatalkan":
      return "red";
    default:
      return "gray";
  }
}

function mapApiTicketToRow(ticket: PublicTicketRow): TicketRow {
  return {
    id: ticket.id,
    nomor_tiket: ticket.nomor_tiket,
    tanggal_masuk: new Date(ticket.tanggal_masuk),
    nama_cust: ticket.nama_cust,
    phone_cust: ticket.phone_cust,
    alamat_cust: ticket.alamat_cust ?? "",
    jenis_perangkat: ticket.jenis_perangkat,
    merk_perangkat: ticket.merk_perangkat ?? "",
    keluhan: ticket.keluhan,
    gunakan_drop_point: ticket.gunakan_drop_point,
    drop_point_id: ticket.drop_point_id,
    drop_point_nama: ticket.drop_point_nama,
    status_verifikasi: ticket.status_verifikasi,
    status_servis: mapApiStatusServisToUi(ticket.status_servis),
  };
}

export default function TiketServisPage() {
  const [opened, setOpened] = useState(false);
  const [formType, setFormType] = useState<FormType>("create");
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [dropPointOptions, setDropPointOptions] = useState<
    TicketDropPointOption[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [nomorTiket, setNomorTiket] = useState("");

  const tanggalMasuk = useMemo(() => new Date(), []);

  useEffect(() => {
    void loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setIsLoading(true);

      const [ticketResult, dropPointResult] = await Promise.all([
        getPublicTiketServisListRequest(),
        getPublicDropPointListRequest(),
      ]);

      if (!ticketResult.success) {
        notifications.show({
          title: "Gagal",
          message: ticketResult.message,
          color: "red",
        });
      } else {
        setTickets(ticketResult.tickets.map(mapApiTicketToRow));
      }

      if (!dropPointResult.success) {
        notifications.show({
          title: "Gagal",
          message: dropPointResult.message,
          color: "red",
        });
      } else {
        setDropPointOptions(
          dropPointResult.dropPoints.map((item) => ({
            value: item.id,
            label: item.nama_drop_point,
            originalLabel: item.nama_drop_point,
            alamat: item.alamat,
            jarakKm: null,
            jarakLabel: null,
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function prepareNomorTiket(date = new Date()) {
    setNomorTiket("");

    const result = await getTiketServisNomorRequest({
      tanggal_masuk: date.toISOString(),
    });

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });

      return;
    }

    setNomorTiket(result.nomor_tiket);
  }

  const handleOpenCreate = () => {
    const now = new Date();

    setFormType("create");
    setSelectedTicket(null);
    setOpened(true);

    void prepareNomorTiket(now);
  };

  const handleOpenEdit = (ticket: TicketRow) => {
    setFormType("edit");
    setSelectedTicket(ticket);
    setOpened(true);
  };

  async function handleSubmitTicket(
    ticket: TicketRow,
    type: FormType
  ): Promise<boolean> {
    const payload = {
      nomor_tiket: ticket.nomor_tiket,
      tanggal_masuk: ticket.tanggal_masuk.toISOString(),
      nama_cust: ticket.nama_cust,
      phone_cust: ticket.phone_cust,
      alamat_cust: ticket.alamat_cust || null,
      jenis_perangkat: ticket.jenis_perangkat,
      merk_perangkat: ticket.merk_perangkat || null,
      keluhan: ticket.keluhan,
      gunakan_drop_point: ticket.gunakan_drop_point,
      drop_point_id: ticket.gunakan_drop_point
        ? ticket.drop_point_id
        : null,
    };

    if (type === "create") {
      const result = await createPublicTiketServisRequest(payload);

      if (!result.success) {
        notifications.show({
          title: "Gagal",
          message: result.message,
          color: "red",
        });

        return false;
      }

      setTickets((prev) => [mapApiTicketToRow(result.ticket), ...prev]);

      notifications.show({
        title: "Berhasil",
        message: `Tiket servis berhasil dibuat. Nomor tiket: ${result.ticket.nomor_tiket}`,
        color: "green",
      });

      return true;
    }

    const result = await updatePublicTiketServisRequest(
      ticket.nomor_tiket,
      payload
    );

    if (!result.success) {
      notifications.show({
        title: "Gagal",
        message: result.message,
        color: "red",
      });

      return false;
    }

    setTickets((prev) =>
      prev.map((item) =>
        item.nomor_tiket === ticket.nomor_tiket
          ? mapApiTicketToRow(result.ticket)
          : item
      )
    );

    notifications.show({
      title: "Berhasil",
      message: result.message,
      color: "green",
    });

    return true;
  }

  const columns: TableColumn<TicketRow>[] = [
    {
      key: "nomor_tiket",
      label: "No Tiket",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Text fw={700} c="#111827" fz={15}>
          {row.nomor_tiket}
        </Text>
      ),
    },
    {
      key: "nama_cust",
      label: "Nama Customer",
      sortable: true,
      width: "16%",
      render: (row) => (
        <Text c="#374151" fz={15}>
          {row.nama_cust}
        </Text>
      ),
    },
    {
      key: "jenis_perangkat",
      label: "Perangkat",
      width: "11%",
      render: (row) => (
        <Text c="#374151" fz={15}>
          {row.jenis_perangkat}
        </Text>
      ),
    },
    {
      key: "merk_perangkat",
      label: "Merk",
      width: "11%",
      render: (row) => (
        <Text c="#374151" fz={15}>
          {row.merk_perangkat}
        </Text>
      ),
    },
    {
      key: "drop_point",
      label: "Drop Point",
      width: "14%",
      render: (row) =>
        row.gunakan_drop_point ? (
          <Badge color="cyan" variant="light" radius="sm">
            {row.drop_point_nama ?? "Dipilih"}
          </Badge>
        ) : (
          <Badge color="gray" variant="light" radius="sm">
            Tidak
          </Badge>
        ),
    },
    {
      key: "tanggal_masuk",
      label: "Tanggal Masuk",
      sortable: true,
      width: "11%",
      render: (row) => (
        <Text c="#374151" fz={15}>
          {formatTanggalIndonesia(row.tanggal_masuk)}
        </Text>
      ),
    },
    {
      key: "status_verifikasi",
      label: "Verifikasi",
      width: "10%",
      render: (row) => (
        <Badge
          color={getStatusColor(row.status_verifikasi)}
          variant="light"
          radius="sm"
        >
          {row.status_verifikasi}
        </Badge>
      ),
    },
    {
      key: "status_servis",
      label: "Status Servis",
      width: "10%",
      render: (row) => (
        <Badge
          color={getStatusColor(row.status_servis)}
          variant="light"
          radius="sm"
        >
          {row.status_servis}
        </Badge>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      width: "5%",
      align: "center",
      render: (row) => (
        <ActionIcon
          variant="subtle"
          color="blue"
          radius="md"
          onClick={(event) => {
            event.stopPropagation();
            handleOpenEdit(row);
          }}
          aria-label="Edit tiket"
        >
          <IconEdit size={18} />
        </ActionIcon>
      ),
    },
  ];

  return (
    <Box bg="#F5F5F5" mih="100vh">
      <Container size="lg" py={44}>
        <MotionDiv
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
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
              Tiket Servis
            </Title>

            <Text
              ta="center"
              fw={700}
              c="#7A7F87"
              style={{
                fontSize: "clamp(20px, 2vw, 34px)",
              }}
            >
              Lihat tiket yang telah dibuat atau buat tiket servis baru
            </Text>
          </Stack>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Group justify="center" mt={28}>
            <Button
              onClick={handleOpenCreate}
              radius="md"
              style={{
                minWidth: 260,
                height: 58,
                backgroundColor: "#0D4CB5",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Buat Tiket Servis
            </Button>
          </Group>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Box mt={36}>
            <Stack gap={18}>
              <Title order={2} fw={800} c="#111111" ta="center">
                Tiket Yang Sudah Dibuat
              </Title>

              <CustomTableSearch
                data={tickets}
                columns={columns}
                searchable
                isLoading={isLoading}
                searchPlaceholder="Cari nomor tiket atau nama customer..."
                showFooter={false}
                emptyText="Belum ada tiket yang dibuat"
              />
            </Stack>
          </Box>
        </MotionDiv>
      </Container>

      <TiketServisFormModal
        opened={opened}
        onClose={() => setOpened(false)}
        formType={formType}
        nomorTiket={nomorTiket}
        tanggalMasuk={tanggalMasuk}
        dropPointOptions={dropPointOptions}
        initialData={selectedTicket}
        onSubmit={handleSubmitTicket}
      />

      {/* FOOTER TANPA ANIMASI */}
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
                src="/Images/logo-dvc.png"
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
          style={{
            textAlign: "center",
          }}
        >
          <Text c="white" size="sm">
            © 2026 All rights reserved. DVC Smart Service
          </Text>
        </Box>
      </Box>
    </Box>
  );
}