import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type NotaItem = {
  nama: string;
  qty: number | null;
  harga: number;
};

export type NotaPembayaranServisData = {
  nomorTiket: string;
  tanggalBayar: string;
  namaPelanggan: string;
  noTelepon: string;
  perangkat: string;
  metodePembayaran: string;
  items: NotaItem[];
};

type NotaPembayaranServisPDFProps = {
  data: NotaPembayaranServisData;
};

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function getPageHeight(itemCount: number) {
  const baseHeight = 430;
  const rowHeight = 30;
  const safeSpace = 80;

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

export default function NotaPembayaranServisPDF({
  data,
}: NotaPembayaranServisPDFProps) {
  const total = data.items.reduce((sum, item) => sum + item.harga, 0);

  return (
    <Document>
      <Page size={[390, getPageHeight(data.items.length)]} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>DVC COMPUTER</Text>
          <Text style={styles.subtitle}>Jl. Imam Bonjol No. 10, Denpasar</Text>
          <Text style={styles.subtitle}>08123456789</Text>
        </View>

        <View style={styles.line} />

        <Text style={styles.serviceTitle}>Servis Laptop</Text>

        <View style={styles.infoWrapper}>
          <InfoRow label="No. Tiket" value={data.nomorTiket} />
          <InfoRow label="Tanggal Bayar" value={data.tanggalBayar} />
          <InfoRow label="Nama Pelanggan" value={data.namaPelanggan} />
          <InfoRow label="No. Telepon" value={data.noTelepon} />
          <InfoRow label="Laptop" value={data.perangkat} />
          <InfoRow label="Pembayaran" value={data.metodePembayaran} />
        </View>

        <View style={styles.line} />

        <View style={styles.tableHeader}>
          <Text style={[styles.cellName, styles.bold]}>Rincian</Text>
          <Text style={[styles.cellQty, styles.bold]}>Qty</Text>
          <Text style={[styles.cellPrice, styles.bold]}>Harga</Text>
        </View>

        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cellName}>{item.nama}</Text>
            <Text style={styles.cellQty}>{item.qty ?? "-"}</Text>
            <Text style={styles.cellPrice}>{formatRupiah(item.harga)}</Text>
          </View>
        ))}

        <View style={styles.line} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Biaya :</Text>
          <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
        </View>

        <Text style={styles.footer}>
          Terima kasih telah mempercayakan servis laptop Anda kepada kami.
        </Text>
      </Page>
    </Document>
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
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#D8D8D8",
    marginVertical: 8,
  },
  serviceTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: 700,
    marginVertical: 8,
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
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  cellName: {
    flex: 1,
    fontSize: 11,
  },
  cellQty: {
    width: 45,
    textAlign: "center",
    fontSize: 11,
  },
  cellPrice: {
    width: 90,
    textAlign: "right",
    fontSize: 11,
  },
  bold: {
    fontWeight: 700,
  },
totalRow: {
  flexDirection: "row",
  justifyContent: "flex-end",
  marginTop: 6,
  marginBottom: 12,
},
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginRight: 24,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    width: 95,
    textAlign: "right",
  },
footer: {
  fontSize: 10.5,
  textAlign: "left",
  marginTop: 6,
},
});