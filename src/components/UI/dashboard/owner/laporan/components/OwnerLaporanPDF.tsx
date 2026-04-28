import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { PeriodeLaporan } from "@/lib/owner/owner-laporan.client";

type PdfColumn = {
  key: string;
  label: string;
};

type OwnerLaporanPDFProps = {
  title: string;
  periode: PeriodeLaporan;
  tanggal: string;
  generatedAt: string;
  columns: PdfColumn[];
  rows: Record<string, unknown>[];
  summary: Record<string, unknown> | null;
};

function getPeriodeLabel(periode: PeriodeLaporan) {
  const labels: Record<PeriodeLaporan, string> = {
    harian: "Harian",
    mingguan: "Mingguan",
    bulanan: "Bulanan",
    tahunan: "Tahunan",
  };

  return labels[periode];
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

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return cleanSpecialSpaces(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item)).join(", ");
  }

  if (typeof value === "object") {
    return cleanSpecialSpaces(JSON.stringify(value));
  }

  return cleanSpecialSpaces(String(value));
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
    .map(([key, value]) => ({
      label: getReadableSummaryLabel(key),
      value: normalizeValue(value),
    }));
}

export default function OwnerLaporanPDF({
  title,
  periode,
  tanggal,
  generatedAt,
  columns,
  rows,
  summary,
}: OwnerLaporanPDFProps) {
  const summaryRows = getSummaryRows(summary);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.companyName}>DVC SmartService</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaWrapper}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Periode</Text>
              <Text style={styles.metaValue}>{getPeriodeLabel(periode)}</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Tanggal Filter</Text>
              <Text style={styles.metaValue}>{formatDateIndonesian(tanggal)}</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Dicetak Pada</Text>
              <Text style={styles.metaValue}>{generatedAt}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.th, styles.noColumn]}>No</Text>

            {columns.map((column) => (
              <Text key={column.key} style={styles.th}>
                {column.label}
              </Text>
            ))}
          </View>

          {rows.length > 0 ? (
            rows.map((row, index) => (
              <View key={`${row.id || index}`} style={styles.tableRow} wrap={false}>
                <Text style={[styles.td, styles.noColumn]}>{index + 1}</Text>

                {columns.map((column) => (
                  <Text key={column.key} style={styles.td}>
                    {normalizeValue(row[column.key])}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>Data laporan tidak ditemukan</Text>
            </View>
          )}
        </View>

        {summaryRows.length > 0 ? (
          <View style={styles.summaryWrapper} wrap={false}>
            <Text style={styles.summaryTitle}>Ringkasan</Text>

            <View style={styles.summaryGrid}>
              {summaryRows.map((item) => (
                <View key={item.label} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Halaman ${pageNumber} dari ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 22,
    paddingBottom: 32,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  metaWrapper: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    marginRight: 22,
  },
  metaLabel: {
    fontSize: 8,
    color: "#4B5563",
    width: 72,
  },
  metaValue: {
    fontSize: 8,
    fontWeight: 700,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    minHeight: 24,
  },
  th: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 8,
    fontWeight: 700,
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
  },
  td: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 5,
    fontSize: 8,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  noColumn: {
    width: 30,
    maxWidth: 30,
    minWidth: 30,
    textAlign: "center",
    flexGrow: 0,
    flexShrink: 0,
  },
  emptyRow: {
    padding: 12,
  },
  emptyText: {
    fontSize: 9,
    textAlign: "center",
    color: "#6B7280",
  },
  summaryWrapper: {
    marginTop: 16,
    width: "45%",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  summaryTitle: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 9,
    fontWeight: 700,
    backgroundColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  summaryGrid: {
    padding: 8,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  summaryLabel: {
    width: 120,
    fontSize: 8,
    color: "#4B5563",
  },
  summaryValue: {
    fontSize: 8,
    fontWeight: 700,
  },
  pageNumber: {
    position: "absolute",
    right: 22,
    bottom: 14,
    fontSize: 8,
    color: "#6B7280",
  },
});