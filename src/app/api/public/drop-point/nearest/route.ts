import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const geocodeCache = new Map<string, Coordinate | null>();

function cleanAddressText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bJl\.\s*/gi, "Jalan ")
    .replace(/\bNo\.\s*/gi, "Nomor ")
    .replace(/\bKec\.\s*/gi, "")
    .replace(/\bKab\.\s*/gi, "")
    .replace(/\bKabupaten\s*/gi, "")
    .replace(/\bKota\s*/gi, "")
    .replace(/\bProvinsi\s*/gi, "")
    .replace(/\b\d{5}\b/g, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function withoutIndonesia(value: string) {
  return value.replace(/,\s*indonesia\s*$/gi, "").trim();
}

function ensureIndonesia(value: string) {
  const cleaned = value.trim();

  if (!cleaned) return "";

  if (cleaned.toLowerCase().includes("indonesia")) {
    return cleaned;
  }

  return `${cleaned}, Indonesia`;
}

function getCommaSegments(address: string) {
  return address
    .split(",")
    .map((item) => cleanAddressText(item))
    .filter(Boolean);
}

function getCustomerAddressValidationError(address: string) {
  const cleanedAddress = cleanAddressText(withoutIndonesia(address));

  if (!cleanedAddress) {
    return "Alamat customer wajib diisi untuk menghitung jarak.";
  }

  const segments = getCommaSegments(cleanedAddress);
  const lowerAddress = cleanedAddress.toLowerCase();

  const regionalOnlyKeywords = [
    "bali",
    "gianyar",
    "sukawati",
    "batubulan",
    "denpasar",
    "badung",
    "tabanan",
    "bangli",
    "klungkung",
    "buleleng",
    "jembrana",
    "karangasem",
  ];

  const hasDetailKeyword =
    /\b(jalan|gang|banjar|nomor|desa|kelurahan|dusun|perumahan|perum|komplek|blok)\b/i.test(
      cleanedAddress
    ) || /\d/.test(cleanedAddress);

  const isRegionalOnly =
    segments.length > 0 &&
    segments.every((segment) =>
      regionalOnlyKeywords.includes(segment.toLowerCase())
    );

  if (cleanedAddress.length < 20) {
    return "Alamat customer masih terlalu singkat. Mohon isi alamat lebih lengkap, contoh: Jalan Margapati Nomor 2, Sukawati, Gianyar, Bali.";
  }

  if (segments.length < 3) {
    return "Alamat customer masih terlalu umum. Mohon isi minimal nama jalan atau banjar, kecamatan, kabupaten/kota, dan provinsi.";
  }

  if (isRegionalOnly) {
    return "Alamat customer masih berupa wilayah umum. Mohon isi alamat lebih spesifik agar jarak drop point dapat dihitung dengan lebih akurat.";
  }

  if (!hasDetailKeyword) {
    return "Alamat customer belum memuat detail lokasi. Mohon tambahkan nama jalan, banjar, nomor rumah, desa, atau detail lokasi lainnya.";
  }

  if (
    !lowerAddress.includes("bali") &&
    !lowerAddress.includes("gianyar") &&
    !lowerAddress.includes("denpasar") &&
    !lowerAddress.includes("badung") &&
    !lowerAddress.includes("tabanan")
  ) {
    return "Alamat customer belum memuat wilayah yang cukup jelas. Mohon tambahkan kabupaten/kota atau provinsi.";
  }

  return null;
}

function removeDuplicateVariants(variants: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const variant of variants) {
    const cleaned = ensureIndonesia(cleanAddressText(variant));

    if (!cleaned) continue;

    const key = cleaned.toLowerCase();

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function buildAddressVariants(
  address: string,
  options?: {
    includeSegmentFallback?: boolean;
    includeRegionFallback?: boolean;
  }
) {
  const includeSegmentFallback = options?.includeSegmentFallback ?? true;
  const includeRegionFallback = options?.includeRegionFallback ?? true;

  const cleanedOriginal = cleanAddressText(withoutIndonesia(address));

  if (!cleanedOriginal) return [];

  const segments = getCommaSegments(cleanedOriginal);

  const variants: string[] = [
    cleanedOriginal,
    cleanedOriginal.replace(/\bNomor\s*/gi, ""),
    cleanedOriginal.replace(/\bJalan\s*/gi, ""),
  ];

  if (includeSegmentFallback) {
    for (let index = 1; index < segments.length; index += 1) {
      const sliced = segments.slice(index).join(", ");

      if (sliced) {
        variants.push(sliced);
      }
    }
  }

  if (includeRegionFallback) {
    const baliKeywords = ["Bali", "Gianyar", "Sukawati", "Batubulan"];

    for (const keyword of baliKeywords) {
      if (cleanedOriginal.toLowerCase().includes(keyword.toLowerCase())) {
        variants.push(`${keyword}, Bali`);
      }
    }

    if (
      cleanedOriginal.toLowerCase().includes("batubulan") &&
      cleanedOriginal.toLowerCase().includes("sukawati")
    ) {
      variants.push("Batubulan, Sukawati, Gianyar, Bali");
    }

    if (cleanedOriginal.toLowerCase().includes("sukawati")) {
      variants.push("Sukawati, Gianyar, Bali");
    }

    if (cleanedOriginal.toLowerCase().includes("gianyar")) {
      variants.push("Gianyar, Bali");
    }
  }

  return removeDuplicateVariants(variants);
}

// perhitungan estimasi jarak drop point menggunakan rumus Haversine
// rumus ini menghitung jarak antara dua titik koordinat di permukaan bumi
function calculateDistanceKm(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number
) {
  const earthRadiusKm = 6371;

  const degreeToRadian = (degree: number) => (degree * Math.PI) / 180;

  const deltaLatitude = degreeToRadian(destinationLatitude - originLatitude);
  const deltaLongitude = degreeToRadian(destinationLongitude - originLongitude);

  const originLatitudeRadian = degreeToRadian(originLatitude);
  const destinationLatitudeRadian = degreeToRadian(destinationLatitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(originLatitudeRadian) *
      Math.cos(destinationLatitudeRadian) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function formatDistanceLabel(distanceKm: number | null) {
  if (distanceKm === null || !Number.isFinite(distanceKm)) {
    return null;
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

async function geocodeSingleAddress(address: string): Promise<Coordinate | null> {
  const cleanedAddress = ensureIndonesia(cleanAddressText(address));

  if (!cleanedAddress) {
    return null;
  }

  const cacheKey = cleanedAddress.toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q=${encodeURIComponent(
    cleanedAddress
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "DVC-SmartService-TA/1.0",
        "Accept-Language": "id",
      },
    });

    if (!response.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const data = (await response.json().catch(() => [])) as {
      lat?: string;
      lon?: string;
    }[];

    const firstResult = data[0];

    if (!firstResult?.lat || !firstResult?.lon) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const latitude = Number(firstResult.lat);
    const longitude = Number(firstResult.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const coordinate = {
      latitude,
      longitude,
    };

    geocodeCache.set(cacheKey, coordinate);

    return coordinate;
  } catch (error) {
    console.error("GEOCODE SINGLE ADDRESS ERROR:", error);

    geocodeCache.set(cacheKey, null);

    return null;
  }
}

async function geocodeAddress(
  address: string,
  options?: {
    includeSegmentFallback?: boolean;
    includeRegionFallback?: boolean;
  }
): Promise<Coordinate | null> {
  const variants = buildAddressVariants(address, options);

  for (const variant of variants) {
    const coordinate = await geocodeSingleAddress(variant);

    if (coordinate) {
      return coordinate;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const alamatCustomer =
      searchParams.get("alamat_customer")?.trim() ||
      searchParams.get("alamatCustomer")?.trim() ||
      "";

    const addressValidationError =
      getCustomerAddressValidationError(alamatCustomer);

    if (addressValidationError) {
      return NextResponse.json(
        {
          success: false,
          code: "ADDRESS_INCOMPLETE",
          message: addressValidationError,
        },
        { status: 400 }
      );
    }

    const customerCoordinate = await geocodeAddress(alamatCustomer, {
      includeSegmentFallback: false,
      includeRegionFallback: false,
    });

    if (!customerCoordinate) {
      return NextResponse.json(
        {
          success: false,
          code: "ADDRESS_NOT_FOUND",
          message:
            "Alamat customer tidak dapat ditemukan. Mohon isi alamat lebih lengkap, contoh: Jalan Margapati Nomor 2, Sukawati, Gianyar, Bali.",
        },
        { status: 400 }
      );
    }

    const dropPoints = await prisma.drop_point.findMany({
      orderBy: {
        nama_drop_point: "asc",
      },
    });

    const mappedDropPoints = [];

    for (const dropPoint of dropPoints) {
      const dropPointCoordinate = await geocodeAddress(dropPoint.alamat, {
        includeSegmentFallback: true,
        includeRegionFallback: true,
      });

      const distanceKm = dropPointCoordinate
        ? calculateDistanceKm(
            customerCoordinate.latitude,
            customerCoordinate.longitude,
            dropPointCoordinate.latitude,
            dropPointCoordinate.longitude
          )
        : null;

      mappedDropPoints.push({
        id: dropPoint.id.toString(),
        nama_drop_point: dropPoint.nama_drop_point,
        alamat: dropPoint.alamat,
        phone: dropPoint.phone,
        jam_operasional: dropPoint.jam_operasional,
        jarak_km:
          distanceKm === null || !Number.isFinite(distanceKm)
            ? null
            : Number(distanceKm.toFixed(2)),
        jarak_label: formatDistanceLabel(distanceKm),
      });
    }

    mappedDropPoints.sort((a, b) => {
      if (a.jarak_km === null && b.jarak_km === null) {
        return a.nama_drop_point.localeCompare(b.nama_drop_point);
      }

      if (a.jarak_km === null) return 1;
      if (b.jarak_km === null) return -1;

      return a.jarak_km - b.jarak_km;
    });

    return NextResponse.json({
      success: true,
      message: "Drop point terdekat berhasil dihitung dari alamat customer.",
      dropPoints: mappedDropPoints,
    });
  } catch (error) {
    console.error("GET /api/public/drop-point/nearest error:", error);

    return NextResponse.json(
      {
        success: false,
        code: "NEAREST_DROP_POINT_ERROR",
        message: "Terjadi kesalahan saat menghitung drop point terdekat.",
      },
      { status: 500 }
    );
  }
}