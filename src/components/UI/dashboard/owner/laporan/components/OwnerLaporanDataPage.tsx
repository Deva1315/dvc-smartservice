/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { pdf } from "@react-pdf/renderer";
import OwnerLaporanPDF from "@/components/UI/dashboard/owner/laporan/components/OwnerLaporanPDF";
import { useEffect, useState } from "react";
import {
    Button,
    Group,
    Menu,
    Paper,
    Select,
    Stack,
    Text,
} from "@mantine/core";
import {
    DatePickerInput,
    MonthPickerInput,
    YearPickerInput,
} from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
    IconCalendarMonth,
    IconChevronDown,
    IconDownload,
} from "@tabler/icons-react";
import CustomTableNoSearch, {
    type TableColumn,
} from "@/components/table/custom-table-no-search/CustomTableNoSearch";
import {
    getOwnerLaporan,
    type OwnerLaporanJenis,
    type PeriodeLaporan,
} from "@/lib/owner/owner-laporan.client";

type OwnerLaporanDataPageProps<T extends Record<string, unknown>> = {
    jenis: OwnerLaporanJenis;
    label: string;
    periodeDefault?: PeriodeLaporan;
    columns: TableColumn<T>[];
    mapData: (item: unknown) => T;
    emptyText?: string;
};

function formatDateToInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseInputDateValue(value: string) {
    if (!value) return null;

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function normalizeDateByPeriode(date: Date, periode: PeriodeLaporan) {
    if (periode === "bulanan") {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    if (periode === "tahunan") {
        return new Date(date.getFullYear(), 0, 1);
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTodayInputValue() {
    return formatDateToInputValue(new Date());
}

function formatDateIndonesian(value: string) {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatFilterDateIndonesian(value: string, periode: PeriodeLaporan) {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    if (periode === "bulanan") {
        return new Intl.DateTimeFormat("id-ID", {
            month: "long",
            year: "numeric",
        }).format(date);
    }

    if (periode === "tahunan") {
        return new Intl.DateTimeFormat("id-ID", {
            year: "numeric",
        }).format(date);
    }

    return formatDateIndonesian(value);
}

function formatDateTimeIndonesian(value: Date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(value);
}

function getPeriodeLabel(periode: PeriodeLaporan) {
    const labels: Record<PeriodeLaporan, string> = {
        harian: "Harian",
        bulanan: "Bulanan",
        tahunan: "Tahunan",
    };

    return labels[periode];
}

function getReadableSummaryLabel(key: string) {
    const cleanKey = key.endsWith("_display")
        ? key.replace("_display", "")
        : key;

    return cleanKey
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanSpecialSpaces(value: string) {
    return value
        .replace(/\u00A0/g, " ")
        .replace(/\u202F/g, " ")
        .replace(/Â/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeCsvValue(value: unknown) {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return cleanSpecialSpaces(value.replace(/\r?\n|\r/g, " "));
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }

    if (value instanceof Date) {
        return formatDateTimeIndonesian(value);
    }

    if (Array.isArray(value)) {
        return cleanSpecialSpaces(
            value.map((item: unknown): string => normalizeCsvValue(item)).join(", ")
        );
    }

    if (typeof value === "object") {
        return cleanSpecialSpaces(JSON.stringify(value).replace(/\r?\n|\r/g, " "));
    }

    return cleanSpecialSpaces(String(value));
}

function escapeCsvValue(value: unknown) {
    const normalized = normalizeCsvValue(value);
    const escaped = normalized.replace(/"/g, '""');

    return `"${escaped}"`;
}

function sanitizeFileName(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getSummaryRows(summary: Record<string, unknown> | null) {
    if (!summary) return [];

    const entries = Object.entries(summary);
    const keys = new Set(Object.keys(summary));

    return entries
        .filter(([key]) => {
            if (key.endsWith("_display")) return true;

            const hasDisplayPair = keys.has(`${key}_display`);

            if (hasDisplayPair) return false;

            return true;
        })
        .map(([key, value]) => [getReadableSummaryLabel(key), value]);
}

function getPdfColumns<T extends Record<string, unknown>>(
    columns: TableColumn<T>[]
) {
    return columns
        .filter((column) => String(column.key) !== "aksi")
        .map((column) => ({
            key: String(column.key),
            label: String(column.label),
        }));
}

function downloadBlob(filename: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function downloadCsv<T extends Record<string, unknown>>(options: {
    filename: string;
    title: string;
    rows: T[];
    columns: TableColumn<T>[];
    periode: PeriodeLaporan;
    tanggal: string;
    summary: Record<string, unknown> | null;
}) {
    const delimiter = ";";

    const exportColumns = options.columns.filter(
        (column) => String(column.key) !== "aksi"
    );

    const metadataRows: unknown[][] = [
        [options.title.toUpperCase()],
        [],
        ["Periode", getPeriodeLabel(options.periode)],
        ["Tanggal Filter", formatFilterDateIndonesian(options.tanggal, options.periode)],
        ["Diunduh Pada", formatDateTimeIndonesian(new Date())],
        [],
    ];

    const headerRow: unknown[] = [
        "No",
        ...exportColumns.map((column) => String(column.label)),
    ];

    const dataRows: unknown[][] = options.rows.map((row, index) => [
        index + 1,
        ...exportColumns.map((column) => {
            const key = column.key as keyof T;
            return row[key];
        }),
    ]);

    const summaryRows: unknown[][] =
        options.summary && Object.keys(options.summary).length > 0
            ? [[], ["Ringkasan"], ...getSummaryRows(options.summary)]
            : [];

    const csvRows = [
        ...metadataRows,
        headerRow,
        ...dataRows,
        ...summaryRows,
    ];

    const csvContent = csvRows
        .map((row) => row.map(escapeCsvValue).join(delimiter))
        .join("\n");

    const finalCsvContent = `sep=${delimiter}\n${csvContent}`;

    const blob = new Blob([`\uFEFF${finalCsvContent}`], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = options.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export default function OwnerLaporanDataPage<T extends Record<string, unknown>>({
    jenis,
    label,
    periodeDefault = "harian",
    columns,
    mapData,
    emptyText = "Data laporan tidak ditemukan",
}: OwnerLaporanDataPageProps<T>) {
    const [periode, setPeriode] = useState<PeriodeLaporan>(periodeDefault);
    const [tanggal, setTanggal] = useState("");
    const [rows, setRows] = useState<T[]>([]);
    const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    function getTanggalForCurrentFilter() {
        const baseDate = parseInputDateValue(tanggal) || new Date();
        const normalizedDate = normalizeDateByPeriode(baseDate, periode);

        return formatDateToInputValue(normalizedDate);
    }

    async function fetchLaporan(nextTanggal?: string) {
        try {
            setIsLoading(true);

            const selectedTanggal =
                nextTanggal || tanggal || formatDateToInputValue(
                    normalizeDateByPeriode(new Date(), periode)
                );

            const result = await getOwnerLaporan(jenis, {
                periode,
                tanggal: selectedTanggal,
            });

            setRows((result.data || []).map(mapData));
            setSummary((result.summary || null) as Record<string, unknown> | null);
        } catch (error) {
            setRows([]);
            setSummary(null);

            notifications.show({
                title: "Gagal",
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil data laporan.",
                color: "red",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const today = parseInputDateValue(getTodayInputValue()) || new Date();
        const initialTanggal = formatDateToInputValue(
            normalizeDateByPeriode(today, periodeDefault)
        );

        setTanggal(initialTanggal);
        fetchLaporan(initialTanggal);
    }, []);

    function handlePeriodeChange(value: string | null) {
        const nextPeriode = (value as PeriodeLaporan) || periodeDefault;
        const baseDate = parseInputDateValue(tanggal) || new Date();
        const normalizedDate = normalizeDateByPeriode(baseDate, nextPeriode);

        setPeriode(nextPeriode);
        setTanggal(formatDateToInputValue(normalizedDate));
    }

    function handleTanggalChange(value: Date | null) {
        const baseDate = value || new Date();
        const normalizedDate = normalizeDateByPeriode(baseDate, periode);

        setTanggal(formatDateToInputValue(normalizedDate));
    }

    function handleTanggalDatePickerChange(value: string | null) {
        const baseDate = value ? parseInputDateValue(value) : new Date();
        const normalizedDate = normalizeDateByPeriode(baseDate || new Date(), "harian");

        setTanggal(formatDateToInputValue(normalizedDate));
    }

    function handleApplyFilter() {
        const selectedTanggal = getTanggalForCurrentFilter();

        setTanggal(selectedTanggal);
        fetchLaporan(selectedTanggal);

        notifications.show({
            title: "Filter Laporan",
            message: `Filter ${label} diterapkan (${getPeriodeLabel(
                periode
            )}, ${formatFilterDateIndonesian(selectedTanggal, periode)})`,
            color: "blue",
        });
    }

    async function handleDownload(type: "pdf" | "excel") {
        if (rows.length === 0) {
            notifications.show({
                title: "Download Laporan",
                message: "Tidak ada data yang bisa diunduh.",
                color: "yellow",
            });

            return;
        }

        const selectedTanggal = getTanggalForCurrentFilter();

        if (type === "excel") {
            const fileName = `${sanitizeFileName(label)}-${periode}-${selectedTanggal}.csv`;

            downloadCsv({
                filename: fileName,
                title: label,
                rows,
                columns,
                periode,
                tanggal: selectedTanggal,
                summary,
            });

            notifications.show({
                title: "Download Laporan",
                message: `Laporan ${label} berhasil diunduh dalam format CSV.`,
                color: "green",
            });

            return;
        }

        try {
            setIsDownloadingPdf(true);

            const fileName = `${sanitizeFileName(label)}-${periode}-${selectedTanggal}.pdf`;

            const generatedAt = formatDateTimeIndonesian(new Date());

            const blob = await pdf(
                <OwnerLaporanPDF
                    title={label}
                    periode={periode}
                    tanggal={selectedTanggal}
                    generatedAt={generatedAt}
                    columns={getPdfColumns(columns)}
                    rows={rows}
                    summary={summary}
                />
            ).toBlob();

            downloadBlob(fileName, blob);

            notifications.show({
                title: "Download PDF",
                message: `Laporan ${label} berhasil diunduh dalam format PDF.`,
                color: "green",
            });
        } catch (error) {
            notifications.show({
                title: "Download PDF Gagal",
                message:
                    error instanceof Error
                        ? error.message
                        : "Gagal membuat file PDF laporan.",
                color: "red",
            });
        } finally {
            setIsDownloadingPdf(false);
        }
    }

    function renderTanggalPicker() {
        const commonStyles = {
            input: {
                height: 54,
                backgroundColor: "#FFFFFF",
                border: "1px solid #D9DCE3",
                fontSize: 17,
            },
        };

        const commonPropsString = {
            value: tanggal || null,
            onChange: (value: string | null) => {
                if (!value) {
                    handleTanggalChange(null);
                    return;
                }

                const parsed = parseInputDateValue(value) || new Date();

                handleTanggalChange(parsed);
            },
            radius: "md" as const,
            leftSection: <IconCalendarMonth size={18} stroke={1.8} />,
            clearable: false,
            style: {
                flex: 1,
            },
            styles: commonStyles,
            popoverProps: {
                withinPortal: true,
            },
        };

        if (periode === "bulanan") {
            return (
                <MonthPickerInput
                    key="month-picker"
                    {...commonPropsString}
                    placeholder="Pilih bulan"
                    valueFormat="MM / YYYY"
                />
            );
        }

        if (periode === "tahunan") {
            return (
                <YearPickerInput
                    key="year-picker"
                    {...commonPropsString}
                    placeholder="Pilih tahun"
                    valueFormat="YYYY"
                />
            );
        }

        return (
            <DatePickerInput
                key="date-picker"
                value={tanggal || null}
                onChange={handleTanggalDatePickerChange}
                radius="md"
                leftSection={<IconCalendarMonth size={18} stroke={1.8} />}
                clearable={false}
                style={{
                    flex: 1,
                }}
                styles={commonStyles}
                popoverProps={{
                    withinPortal: true,
                }}
                placeholder="Pilih tanggal"
                valueFormat="DD / MM / YYYY"
            />
        );
    }

    return (
        <Stack gap={16} style={{ color: "#111827" }}>
            <Group justify="flex-end">
                <Menu shadow="md" width={180} position="bottom-end" withinPortal={false}>
                    <Menu.Target>
                        <Button
                            radius="xl"
                            rightSection={<IconChevronDown size={18} stroke={2} />}
                            style={{
                                height: 44,
                                minWidth: 160,
                                backgroundColor: "#0D4CB5",
                                fontSize: 18,
                                fontWeight: 700,
                            }}
                        >
                            Download
                        </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconDownload size={16} stroke={1.9} />}
                            onClick={() => handleDownload("pdf")}
                            disabled={isDownloadingPdf}
                        >
                            {isDownloadingPdf ? "Membuat PDF..." : "Download PDF"}
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconDownload size={16} stroke={1.9} />}
                            onClick={() => handleDownload("excel")}
                        >
                            Download Excel
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Paper
                radius={22}
                p={10}
                style={{
                    backgroundColor: "#F8F8FA",
                    border: "1px solid #E6E6EA",
                }}
            >
                <Stack gap={10}>
                    <Group justify="space-between" align="center">
                        <Text fw={700} fz={20} c="black">
                            Periode
                        </Text>
                    </Group>

                    <Group gap={12} align="stretch" wrap="nowrap">
                        <Select
                            value={periode}
                            onChange={handlePeriodeChange}
                            data={[
                                { value: "harian", label: "Harian" },
                                { value: "bulanan", label: "Bulanan" },
                                { value: "tahunan", label: "Tahunan" },
                            ]}
                            radius="md"
                            style={{
                                flex: 1,
                            }}
                            styles={{
                                input: {
                                    height: 54,
                                    backgroundColor: "#FFFFFF",
                                    border: "1px solid #D9DCE3",
                                    fontSize: 17,
                                    color: "#111827",
                                },
                                section: {
                                    color: "#111827",
                                },
                                dropdown: {
                                    backgroundColor: "#FFFFFF",
                                    color: "#111827",
                                },
                                option: {
                                    color: "#111827",
                                    fontSize: 16,
                                },
                            }}
                        />

                        {renderTanggalPicker()}

                        <Button
                            radius="md"
                            onClick={handleApplyFilter}
                            loading={isLoading}
                            style={{
                                minWidth: 230,
                                height: 54,
                                backgroundColor: "#0D4CB5",
                                fontSize: 18,
                                fontWeight: 700,
                            }}
                        >
                            Terapkan Filter
                        </Button>
                    </Group>
                </Stack>
            </Paper>

            <CustomTableNoSearch
                data={rows}
                columns={columns}
                isLoading={isLoading}
                emptyText={emptyText}
            />
        </Stack>
    );
}