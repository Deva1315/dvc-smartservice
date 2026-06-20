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

type NotaTableRow = {
  tanggal: string;
  namaBarang: string;
  qty: string;
  harga: string;
  jumlah: string;
  isSection?: boolean;
};

export type NotaPembayaranServisData = {
  nomorTiket: string;
  tanggalTiket: string;
  namaPelanggan: string;
  noTelepon: string;
  perangkat: string;
  metodePembayaran: string;
  serviceTitle?: string;
  items?: NotaItem[];
  jasaServis?: NotaItem[];
  spareparts?: NotaItem[];
};

type NotaPembayaranServisPDFProps = {
  data: NotaPembayaranServisData;
};

const LOGO_SRC = "/images/logo-dvc.png";
const NOTA_PAGE_WIDTH = 595.28;
const NOTA_MIN_HEIGHT = 419.53;
const MINIMUM_TABLE_ROWS = 6;
const TABLE_ROW_HEIGHT = 22;
const SECTION_ROW_HEIGHT = 20;
const PAGE_FIXED_CONTENT_HEIGHT = 285;

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

function getPageHeight(rowCount: number, sectionCount: number) {
  const safeRowCount = Math.max(rowCount, MINIMUM_TABLE_ROWS);

  return Math.max(
    NOTA_MIN_HEIGHT,
    PAGE_FIXED_CONTENT_HEIGHT +
      safeRowCount * TABLE_ROW_HEIGHT +
      sectionCount * SECTION_ROW_HEIGHT
  );
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

  return <Text style={textStyles}>{text}</Text>;
}

export default function NotaPembayaranServisPDF({
  data,
}: NotaPembayaranServisPDFProps) {
  const jasaServis = data.jasaServis ?? [];
  const spareparts = data.spareparts ?? [];
  const hasSeparatedItems = jasaServis.length > 0 || spareparts.length > 0;

  const allItems = hasSeparatedItems
    ? [...jasaServis, ...spareparts]
    : data.items ?? [];

  const total = allItems.reduce(
    (sum, item) => sum + item.harga * (item.qty ?? 1),
    0
  );

  const namaPelanggan = data.namaPelanggan?.trim() || "Pelanggan Umum";
  const rows: NotaTableRow[] = [];

  const pushItemRows = (items: NotaItem[], sectionTitle?: string) => {
    if (sectionTitle && items.length > 0) {
      rows.push({
        tanggal: "",
        namaBarang: sectionTitle,
        qty: "",
        harga: "",
        jumlah: "",
        isSection: true,
      });
    }

    items.forEach((item) => {
      const qty = item.qty ?? 1;

      rows.push({
        tanggal: rows.some((row) => !row.isSection && row.tanggal)
          ? ""
          : formatTanggalLong(data.tanggalTiket),
        namaBarang: item.nama,
        qty: formatNumber(qty),
        harga: formatNumber(item.harga),
        jumlah: formatNumber(item.harga * qty),
      });
    });
  };

  if (hasSeparatedItems) {
    pushItemRows(jasaServis, "Jasa Servis");
    pushItemRows(spareparts, "Sparepart");
  } else {
    pushItemRows(allItems);
  }

  const sectionCount = rows.filter((row) => row.isSection).length;

  while (rows.length < MINIMUM_TABLE_ROWS) {
    rows.push({
      tanggal: "",
      namaBarang: "",
      qty: "",
      harga: "",
      jumlah: "",
    });
  }

  return (
    <Document>
      <Page
        size={[NOTA_PAGE_WIDTH, getPageHeight(rows.length, sectionCount)]}
        style={styles.page}
      >
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
              <Text style={styles.notaNumberLabel}>Nomor Nota :</Text>
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

            <View style={[styles.colQtyCell, styles.headerCell]}>
              <CellText text="Qty" align="center" bold italic />
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
              {row.isSection ? (
                <View style={styles.sectionCell}>
                  <CellText text={row.namaBarang} bold />
                </View>
              ) : (
                <>
                  <View style={styles.colTanggalCell}>
                    <CellText text={row.tanggal} />
                  </View>

                  <View style={styles.colNamaBarangCell}>
                    <CellText text={row.namaBarang} />
                  </View>

                  <View style={styles.colQtyCell}>
                    <CellText text={row.qty} align="center" />
                  </View>

                  <View style={styles.colHargaCell}>
                    <CellText text={row.harga} align="right" />
                  </View>

                  <View style={styles.colJumlahCell}>
                    <CellText text={row.jumlah} align="right" />
                  </View>
                </>
              )}
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
  minHeight: 22,
  justifyContent: "center" as const,
  paddingHorizontal: 6,
  paddingVertical: 3,
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 14,
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: "#111111",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  leftHeader: {
    width: "54%",
  },

  rightHeader: {
    width: "42%",
    paddingTop: 5,
  },

  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  logo: {
    width: 60,
    height: 45,
    objectFit: "contain",
    marginRight: 8,
  },

  companyWrapper: {
    flexDirection: "column",
  },

  companyName: {
    fontFamily: "Times-Bold",
    fontSize: 12.5,
    marginBottom: 3,
  },

  companyAddress: {
    fontSize: 9.5,
    lineHeight: 1.2,
  },

  notaNumberWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  notaNumberLabel: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    marginRight: 6,
  },

  notaNumberValue: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
  },

  rightHeaderText: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    marginBottom: 5,
  },

  serviceBanner: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#111111",
    paddingVertical: 3,
    alignItems: "center",
  },

  serviceBannerText: {
    fontFamily: "Times-BoldItalic",
    fontSize: 10,
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
    minHeight: 22,
  },

  colTanggalCell: {
    ...sharedCellBase,
    width: "19%",
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  colNamaBarangCell: {
    ...sharedCellBase,
    width: "39%",
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  colQtyCell: {
    ...sharedCellBase,
    width: "10%",
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

  sectionCell: {
    minHeight: 20,
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  totalRow: {
    flexDirection: "row",
  },

  totalLabelCell: {
    width: "82%",
    minHeight: 25,
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: 1,
    borderColor: "#111111",
  },

  totalValueCell: {
    width: "18%",
    minHeight: 25,
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  cellText: {
    fontSize: 10.5,
    lineHeight: 1.25,
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
    fontSize: 12.5,
  },

  totalValue: {
    textAlign: "right",
    fontFamily: "Times-Bold",
    fontSize: 11,
  },

  signatureWrapper: {
    marginTop: 24,
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
    fontSize: 11,
  },

  signatureSpace: {
    height: 38,
  },

  signatureName: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#111111",
    textAlign: "center",
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    paddingBottom: 2,
  },
});