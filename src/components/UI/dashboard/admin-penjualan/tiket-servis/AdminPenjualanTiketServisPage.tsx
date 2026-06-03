"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Group, Select, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import type { FormType } from "@/types/form-types";
import type {
  AdminPenjualanTicketDropPointOption,
  AdminPenjualanTicketRow,
} from "@/types/admin-penjualan-tiket-servis-form.types";

import CustomTable from "@/components/table/custom-table-search/CustomTableSearch";
import AdminPenjualanTiketServisFormModal from "./form/AdminPenjualanTiketServisFormModal";

import {
  createAdminPenjualanTiketServis,
  getAdminPenjualanNomorTiketRequest,
  getAdminPenjualanTiketServis,
  type AdminPenjualanTiketApiItem,
  updateAdminPenjualanTiketServis,
} from "@/lib/admin-penjualan/admin-penjualan-tiket-servis.client";

import {
  getAdminPenjualanDropPointList,
  type AdminPenjualanDropPointApiItem,
} from "@/lib/admin-penjualan/admin-penjualan-drop-point.client";

import type { AdminPenjualanTiketPageRow } from "./components/AdminPenjualanTiketServisPage.types";

import {
  filterStatusServisOptions,
  mapPageRowToFormRow,
  mapTiketServis,
} from "./components/adminPenjualanTiketServisPage.helpers";

import { getAdminPenjualanTiketServisColumns } from "./components/AdminPenjualanTiketServisTable";

type AdminPenjualanTiketServisPageProps = {
  initialTiketServis?: AdminPenjualanTiketApiItem[];
  initialDropPointOptions?: AdminPenjualanDropPointApiItem[];
};

function mapDropPointOptions(data: AdminPenjualanDropPointApiItem[]) {
  return data.map((item) => ({
    value: String(item.id),
    label: item.nama_drop_point,
  }));
}

export default function AdminPenjualanTiketServisPage({
  initialTiketServis = [],
  initialDropPointOptions = [],
}: AdminPenjualanTiketServisPageProps) {
  const router = useRouter();

  const [opened, setOpened] = useState(false);
  const [selectedStatusServis, setSelectedStatusServis] = useState<
    string | null
  >(null);

  const [tiketServis, setTiketServis] = useState<AdminPenjualanTiketPageRow[]>(
    () => mapTiketServis(initialTiketServis)
  );

  const [dropPointOptions, setDropPointOptions] = useState<
    AdminPenjualanTicketDropPointOption[]
  >(() => mapDropPointOptions(initialDropPointOptions));

  const [isLoading, setIsLoading] = useState(false);
  const [tanggalMasuk] = useState(new Date());
  const [nomorTiket, setNomorTiket] = useState("");

  const [formType, setFormType] = useState<FormType>("create");
  const [selectedTicket, setSelectedTicket] = useState<
    AdminPenjualanTicketRow | undefined
  >(undefined);

  const hasFetchedOnMountRef = useRef(false);

  const tableData = useMemo(() => {
    const filtered = selectedStatusServis
      ? tiketServis.filter(
          (item) =>
            item.statusVerifikasi === selectedStatusServis ||
            item.statusServis === selectedStatusServis
        )
      : tiketServis;

    return filtered.map((item, index) => ({
      ...item,
      no: index + 1,
    }));
  }, [selectedStatusServis, tiketServis]);

  const columns = useMemo(
    () =>
      getAdminPenjualanTiketServisColumns({
        onEdit: handleOpenEdit,
        onDetail: (row) => {
          router.push(
            `/admin_penjualan/tiket-servis/${encodeURIComponent(
              row.nomorTiket
            )}`
          );
        },
        onPayment: (row) => {
          router.push(
            `/admin_penjualan/tiket-servis/${encodeURIComponent(
              row.nomorTiket
            )}/pembayaran`
          );
        },
      }),
    [router]
  );

  useEffect(() => {
    if (hasFetchedOnMountRef.current) {
      return;
    }

    hasFetchedOnMountRef.current = true;
    void fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      setIsLoading(true);

      const [ticketResult, dropPointResult] = await Promise.all([
        getAdminPenjualanTiketServis(),
        getAdminPenjualanDropPointList(),
      ]);

      setTiketServis(mapTiketServis(ticketResult.data || []));

      if (dropPointResult.success) {
        setDropPointOptions(mapDropPointOptions(dropPointResult.data));
      } else {
        notifications.show({
          title: "Gagal",
          message: dropPointResult.message,
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data tiket servis.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function prepareNomorTiket(date = new Date()) {
    try {
      setNomorTiket("");

      const result = await getAdminPenjualanNomorTiketRequest({
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
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error ? error.message : "Gagal membuat nomor tiket.",
        color: "red",
      });
    }
  }

  function handleOpenCreate() {
    const now = new Date();

    setFormType("create");
    setSelectedTicket(undefined);
    setOpened(true);

    void prepareNomorTiket(now);
  }

  function handleOpenEdit(row: AdminPenjualanTiketPageRow) {
    setFormType("edit");
    setSelectedTicket(mapPageRowToFormRow(row));
    setNomorTiket(row.nomorTiket);
    setOpened(true);
  }

  function handleCloseModal() {
    setOpened(false);
    setSelectedTicket(undefined);
    setNomorTiket("");
    setFormType("create");
  }

  async function handleSubmitTiketServis(
    ticket: AdminPenjualanTicketRow,
    type: FormType
  ): Promise<boolean> {
    try {
      const payload = {
        nomor_tiket: ticket.nomor_tiket,
        nama_cust: ticket.nama_cust,
        phone_cust: ticket.phone_cust,
        alamat_cust: ticket.alamat_cust || null,
        jenis_perangkat: ticket.jenis_perangkat,
        merk_perangkat: ticket.merk_perangkat || null,
        keluhan: ticket.keluhan,
        id_drop_point: ticket.gunakan_drop_point ? ticket.drop_point_id : null,
      };

      if (type === "create") {
        const result = await createAdminPenjualanTiketServis(payload);
        const createdData = result.data ?? result.ticket;

        setTiketServis((prev) => [...mapTiketServis([createdData]), ...prev]);

        notifications.show({
          title: "Berhasil",
          message: result.message || "Tiket servis berhasil dibuat.",
          color: "green",
        });

        return true;
      }

      const result = await updateAdminPenjualanTiketServis(payload);
      const updatedRow = mapTiketServis([result.data])[0];

      setTiketServis((prev) =>
        prev.map((item) =>
          item.nomorTiket === updatedRow.nomorTiket ? updatedRow : item
        )
      );

      notifications.show({
        title: "Berhasil",
        message: result.message || "Tiket servis berhasil diperbarui.",
        color: "green",
      });

      return true;
    } catch (error) {
      notifications.show({
        title: "Gagal",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan tiket servis.",
        color: "red",
      });

      return false;
    }
  }

  return (
    <>
      <Stack gap={18}>
        <Group justify="space-between" align="center">
          <Button
            radius="xl"
            leftSection={<IconPlus size={18} stroke={2.2} />}
            onClick={handleOpenCreate}
            style={{
              height: 36,
              minWidth: 120,
              backgroundColor: "#0D4CB5",
              fontSize: 14,
              fontWeight: 700,
              paddingInline: 18,
              marginLeft: "auto",
            }}
          >
            Buat Tiket
          </Button>
        </Group>

        <CustomTable
          data={tableData}
          columns={columns}
          searchable
          isLoading={isLoading}
          searchPlaceholder="Search Tiket Servis...."
          showFooter={false}
          emptyText="Data tiket servis tidak ditemukan"
          searchRightSection={
            <Select
              value={selectedStatusServis}
              onChange={setSelectedStatusServis}
              placeholder="Filter Status"
              clearable
              data={filterStatusServisOptions}
              comboboxProps={{
                withinPortal: true,
                zIndex: 3000,
              }}
              styles={{
                input: {
                  minWidth: 190,
                  height: 44,
                  borderRadius: 999,
                },
                dropdown: {
                  zIndex: 3000,
                },
              }}
            />
          }
        />
      </Stack>

      <AdminPenjualanTiketServisFormModal
        opened={opened}
        onClose={handleCloseModal}
        formType={formType}
        nomorTiket={nomorTiket}
        tanggalMasuk={tanggalMasuk}
        dropPointOptions={dropPointOptions}
        initialData={selectedTicket}
        onSubmit={handleSubmitTiketServis}
      />
    </>
  );
}