/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type NotaItem = {
  nama: string;
  qty: number | null;
  harga: number;
};

export type NotaPembayaranServisData = {
  nomorTiket: string;
  tanggalTiket: string;
  namaPelanggan: string;
  noTelepon: string;
  perangkat: string;
  metodePembayaran: string;
  serviceTitle?: string;
  items: NotaItem[];
};

type NotaPembayaranServisPDFProps = {
  data: NotaPembayaranServisData;
};

const LOGO_SRC = "/Images/logo-dvc.png";
const MINIMUM_TABLE_ROWS = 6;

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatTanggalLong(value?: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPageHeight(itemCount: number) {
  const rowCount = Math.max(itemCount, MINIMUM_TABLE_ROWS);
  return 300 + rowCount * 30 + 180;
}

function CellText({
  text,
  align = "left",
  bold = false,
  italic = false,
}: {
  text: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
}) {
  const textStyles = [
    styles.cellText,
    ...(align === "center" ? [styles.textCenter] : []),
    ...(align === "right" ? [styles.textRight] : []),
    ...(bold ? [styles.bold] : []),
    ...(italic ? [styles.italic] : []),
  ];

  return (
    <Text style={textStyles}>
      {text}
    </Text>
  );
}

export default function NotaPembayaranServisPDF({
  data,
}: NotaPembayaranServisPDFProps) {
  const total = data.items.reduce(
    (sum, item) => sum + item.harga * (item.qty ?? 1),
    0
  );

  const namaPelanggan = data.namaPelanggan?.trim() || "Pelanggan Umum";

  const rows = data.items.map((item, index) => ({
    tanggal: index === 0 ? formatTanggalLong(data.tanggalTiket) : "",
    namaBarang:
      item.qty && item.qty > 1 ? `${item.nama} x${item.qty}` : item.nama,
    harga: formatNumber(item.harga),
    jumlah: formatNumber(item.harga * (item.qty ?? 1)),
  }));

  while (rows.length < MINIMUM_TABLE_ROWS) {
    rows.push({
      tanggal: "",
      namaBarang: "",
      harga: "",
      jumlah: "",
    });
  }

  return (
    <Document>
      <Page size={[595, getPageHeight(data.items.length)]} style={styles.page}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <View style={styles.logoWrapper}>
              <Image src={LOGO_SRC} style={styles.logo} />

              <View style={styles.companyWrapper}>
                <Text style={styles.companyName}>DVC Komputer</Text>
                <Text style={styles.companyAddress}>
                  Jl. Ciung Wanara No. 99X, Sukawati
                </Text>
              </View>
            </View>

            <View style={styles.notaNumberWrapper}>
              <Text style={styles.notaNumberLabel}>NOTA NO :</Text>
              <Text style={styles.notaNumberValue}>{data.nomorTiket}</Text>
            </View>
          </View>

          <View style={styles.rightHeader}>
            <Text style={styles.rightHeaderText}>
              Gianyar, {formatTanggalLong(data.tanggalTiket)}
            </Text>
            <Text style={styles.rightHeaderText}>
              Kepada Yth. {namaPelanggan}
            </Text>
          </View>
        </View>

        <View style={styles.serviceBanner}>
          <Text style={styles.serviceBannerText}>
            Melayani : Service Komputer - Jual - Beli Komputer - Hardware
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.colTanggalCell, styles.headerCell]}>
              <CellText text="Tanggal" align="center" bold italic />
            </View>

            <View style={[styles.colNamaBarangCell, styles.headerCell]}>
              <CellText text="Nama Barang" align="center" bold italic />
            </View>

            <View style={[styles.colHargaCell, styles.headerCell]}>
              <CellText text="Harga" align="center" bold italic />
            </View>

            <View style={[styles.colJumlahCell, styles.headerCell]}>
              <CellText text="Jumlah" align="center" bold italic />
            </View>
          </View>

          {rows.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colTanggalCell}>
                <CellText text={row.tanggal} />
              </View>

              <View style={styles.colNamaBarangCell}>
                <CellText text={row.namaBarang} />
              </View>

              <View style={styles.colHargaCell}>
                <CellText text={row.harga} align="right" />
              </View>

              <View style={styles.colJumlahCell}>
                <CellText text={row.jumlah} align="right" />
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <View style={styles.totalLabelCell}>
              <Text style={styles.totalLabel}>Total Rp.</Text>
            </View>

            <View style={styles.totalValueCell}>
              <Text style={styles.totalValue}>{formatNumber(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureWrapper}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Yang Menerima</Text>

            <View style={styles.signatureSpace} />

            <Text style={styles.signatureName}>{namaPelanggan}</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Yang Menyerahkan</Text>

            <View style={styles.signatureSpace} />

            <Text style={styles.signatureName}>DVC Komputer</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const sharedCellBase = {
  minHeight: 30,
  justifyContent: "center" as const,
  paddingHorizontal: 8,
  paddingVertical: 6,
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 24,
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: "#111111",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  leftHeader: {
    width: "54%",
  },

  rightHeader: {
    width: "42%",
    paddingTop: 8,
  },

  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    width: 72,
    height: 54,
    objectFit: "contain",
    marginRight: 10,
  },

  companyWrapper: {
    flexDirection: "column",
  },

  companyName: {
    fontFamily: "Times-Bold",
    fontSize: 14,
    marginBottom: 3,
  },

  companyAddress: {
    fontSize: 10.5,
    lineHeight: 1.3,
  },

  notaNumberWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  notaNumberLabel: {
    fontFamily: "Times-Bold",
    fontSize: 11.5,
    marginRight: 6,
  },

  notaNumberValue: {
    fontFamily: "Times-Bold",
    fontSize: 11.5,
  },

  rightHeaderText: {
    fontFamily: "Times-Bold",
    fontSize: 11.5,
    marginBottom: 5,
  },

  serviceBanner: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#111111",
    paddingVertical: 4,
    alignItems: "center",
  },

  serviceBannerText: {
    fontFamily: "Times-BoldItalic",
    fontSize: 10.5,
  },

  table: {
    borderWidth: 1,
    borderColor: "#111111",
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111111",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111111",
  },

  headerCell: {
    minHeight: 28,
  },

  colTanggalCell: {
    ...sharedCellBase,
    width: "19%",
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  colNamaBarangCell: {
    ...sharedCellBase,
    width: "49%",
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  colHargaCell: {
    ...sharedCellBase,
    width: "14%",
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  colJumlahCell: {
    ...sharedCellBase,
    width: "18%",
  },

  totalRow: {
    flexDirection: "row",
  },

  totalLabelCell: {
    width: "82%",
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  totalValueCell: {
    width: "18%",
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  cellText: {
    fontSize: 11,
    lineHeight: 1.35,
  },

  textCenter: {
    textAlign: "center",
  },

  textRight: {
    textAlign: "right",
  },

  bold: {
    fontFamily: "Times-Bold",
  },

  italic: {
    fontFamily: "Times-Italic",
  },

  totalLabel: {
    textAlign: "right",
    fontFamily: "Times-Bold",
    fontSize: 14,
  },

  totalValue: {
    textAlign: "right",
    fontFamily: "Times-Bold",
    fontSize: 13,
  },

  signatureWrapper: {
    marginTop: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 34,
  },

  signatureBox: {
    width: "34%",
    alignItems: "center",
  },

  signatureTitle: {
    fontFamily: "Times-Bold",
    fontSize: 12,
  },

  signatureSpace: {
    height: 64,
  },

  signatureName: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#111111",
    textAlign: "center",
    fontFamily: "Times-Bold",
    fontSize: 11.5,
    paddingBottom: 2,
  },
});