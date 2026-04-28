import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type InvoiceItem = {
  nama: string;
  qty: number;
  harga: number;
};

export type InvoicePenjualanData = {
  nomorTransaksi: string;
  tanggal: string;
  admin: string;
  metodePembayaran: string;
  items: InvoiceItem[];
  diskon: number;
  nominalBayar: number;
};

type InvoicePenjualanPDFProps = {
  data: InvoicePenjualanData;
};

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getPageHeight(itemCount: number) {
  const baseHeight = 430;
  const rowHeight = 26;
  const safeSpace = 90;

  return baseHeight + itemCount * rowHeight + safeSpace;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoColon}>:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function InvoicePenjualanPDF({ data }: InvoicePenjualanPDFProps) {
  const subtotal = data.items.reduce(
    (total, item) => total + item.harga * item.qty,
    0
  );
  const total = Math.max(subtotal - data.diskon, 0);
  const kembalian = Math.max(data.nominalBayar - total, 0);

  return (
    <Document>
      <Page size={[390, getPageHeight(data.items.length)]} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DVC COMPUTER</Text>
          <Text style={styles.subtitle}>
            Jl. Ciung Wanara, No. 99X, Kec. Sukawati Bali 80582
          </Text>
          <Text style={styles.subtitle}>08174762502</Text>
        </View>

        <View style={styles.grayLine} />

        <Text style={styles.invoiceTitle}>INVOICE PENJUALAN</Text>

        <View style={styles.infoWrapper}>
          <InfoRow label="No. Transaksi" value={data.nomorTransaksi} />
          <InfoRow label="Tanggal" value={data.tanggal} />
          <InfoRow label="Admin" value={data.admin} />
          <InfoRow label="Pembayaran" value={data.metodePembayaran} />
        </View>

        <View style={styles.grayLine} />

        <View style={styles.tableHeader}>
          <Text style={[styles.cellName, styles.bold]}>Nama Barang</Text>
          <Text style={[styles.cellQty, styles.bold]}>Qty</Text>
          <Text style={[styles.cellPrice, styles.bold]}>Harga</Text>
          <Text style={[styles.cellSubtotal, styles.bold]}>Subtotal</Text>
        </View>

        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cellName}>{item.nama}</Text>
            <Text style={styles.cellQty}>{item.qty}</Text>
            <Text style={styles.cellPrice}>{formatNumber(item.harga)}</Text>
            <Text style={styles.cellSubtotal}>
              {formatNumber(item.harga * item.qty)}
            </Text>
          </View>
        ))}

        <View style={styles.grayLine} />

        <View style={styles.summaryWrapper}>
          <SummaryRow label="Subtotal" value={formatRupiah(subtotal)} />
          <SummaryRow label="Diskon" value={formatRupiah(data.diskon)} />
          <SummaryRow label="Total" value={formatRupiah(total)} />
          <SummaryRow
            label="Nominal Bayar"
            value={formatRupiah(data.nominalBayar)}
          />
          <SummaryRow label="Kembalian" value={formatRupiah(kembalian)} />
        </View>

        <View style={styles.grayLine} />

        <Text style={styles.footer}>
          Terima kasih telah berbelanja di DVC COMPUTER
        </Text>
      </Page>
    </Document>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingHorizontal: 28,
    paddingBottom: 22,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#222222",
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  grayLine: {
    height: 12,
    backgroundColor: "#F2F2F2",
    marginVertical: 8,
  },
  invoiceTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: 700,
    marginVertical: 6,
  },
  infoWrapper: {
    marginTop: 4,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 95,
    fontSize: 11,
  },
  infoColon: {
    width: 12,
    fontSize: 11,
  },
  infoValue: {
    flex: 1,
    fontSize: 11,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
  },
  cellName: {
    flex: 1,
    fontSize: 10.5,
  },
  cellQty: {
    width: 35,
    textAlign: "center",
    fontSize: 10.5,
  },
  cellPrice: {
    width: 70,
    textAlign: "right",
    fontSize: 10.5,
  },
  cellSubtotal: {
    width: 80,
    textAlign: "right",
    fontSize: 10.5,
  },
  bold: {
    fontWeight: 700,
  },
  summaryWrapper: {
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryValue: {
    fontSize: 11,
    textAlign: "right",
  },
  footer: {
    fontSize: 10.5,
    textAlign: "center",
    marginTop: 8,
  },
});