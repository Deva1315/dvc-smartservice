import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const GUEST_TICKET_COOKIE_NAME = "dvc_guest_ticket_session";

function errorJson(message: string, status: number) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status }
    );
}

function normalizeTicketResponse(ticket: {
    id: string;
    nomor_tiket: string;
    tanggal_masuk: Date;
    nama_cust: string;
    phone_cust: string;
    alamat_cust: string | null;
    jenis_perangkat: string;
    merk_perangkat: string | null;
    keluhan: string;
    id_drop_point: bigint | null;
    sumber_tiket: "Guest" | "Admin_Penjualan";
    status_verifikasi: "Menunggu" | "Diterima" | "Ditolak";
    status_servis:
    | "Belum_Diproses"
    | "Diproses"
    | "Menunggu_Sparepart"
    | "Selesai"
    | "Diambil"
    | "Dibatalkan";
    guest_session_id: string | null;
}) {
    return {
        id: ticket.id,
        nomor_tiket: ticket.nomor_tiket,
        tanggal_masuk: ticket.tanggal_masuk.toISOString(),
        nama_cust: ticket.nama_cust,
        phone_cust: ticket.phone_cust,
        alamat_cust: ticket.alamat_cust,
        jenis_perangkat: ticket.jenis_perangkat,
        merk_perangkat: ticket.merk_perangkat,
        keluhan: ticket.keluhan,
        gunakan_drop_point: ticket.id_drop_point !== null,
        drop_point_id: ticket.id_drop_point ? ticket.id_drop_point.toString() : null,
        sumber_tiket: ticket.sumber_tiket,
        status_verifikasi: ticket.status_verifikasi,
        status_servis: ticket.status_servis,
        guest_session_id: ticket.guest_session_id,
    };
}

async function getOrCreateGuestSessionId() {
    const cookieStore = await cookies();
    const existing = cookieStore.get(GUEST_TICKET_COOKIE_NAME)?.value;

    if (existing) {
        return {
            guestSessionId: existing,
            isNew: false,
        };
    }

    return {
        guestSessionId: randomUUID(),
        isNew: true,
    };
}

async function generateNomorTiket() {
    const now = new Date();
    const year = now.getFullYear();
    const prefix = `TK-${year}-`;

    const totalThisYear = await prisma.tiket_servis.count({
        where: {
            nomor_tiket: {
                startsWith: prefix,
            },
        },
    });

    const nextNumber = totalThisYear + 1;
    return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

function generateTiketServisId() {
    return `TS-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export async function GET() {
    try {
        const { guestSessionId, isNew } = await getOrCreateGuestSessionId();

        const tickets = await prisma.tiket_servis.findMany({
            where: {
                sumber_tiket: "Guest",
                guest_session_id: guestSessionId,
            },
            include: {
                drop_point: true,
            },
            orderBy: {
                tanggal_masuk: "desc",
            },
        });

        const response = NextResponse.json({
            success: true,
            message: "Data tiket servis guest berhasil diambil.",
            tickets: tickets.map((ticket) => ({
                ...normalizeTicketResponse(ticket),
                drop_point_nama: ticket.drop_point?.nama_drop_point ?? null,
            })),
        });

        if (isNew) {
            response.cookies.set(GUEST_TICKET_COOKIE_NAME, guestSessionId, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
            });
        }

        return response;
    } catch (error) {
        console.error("GET /api/public/tiket-servis error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat mengambil tiket servis.",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { guestSessionId, isNew } = await getOrCreateGuestSessionId();
        const body = await request.json().catch(() => null);

        const tanggalMasukRaw = String(body?.tanggal_masuk ?? "").trim();
        const nama_cust = String(body?.nama_cust ?? "").trim();
        const phone_cust = String(body?.phone_cust ?? "").trim();
        const alamat_cust = String(body?.alamat_cust ?? "").trim();
        const jenis_perangkat = String(body?.jenis_perangkat ?? "").trim();
        const merk_perangkat = String(body?.merk_perangkat ?? "").trim();
        const keluhan = String(body?.keluhan ?? "").trim();
        const gunakan_drop_point = Boolean(body?.gunakan_drop_point);
        const drop_point_id_raw = body?.drop_point_id
            ? String(body.drop_point_id).trim()
            : "";

        if (
            !tanggalMasukRaw ||
            !nama_cust ||
            !phone_cust ||
            !jenis_perangkat ||
            !keluhan
        ) {
            return errorJson("Mohon lengkapi field yang wajib diisi.", 400);
        }

        let id_drop_point: bigint | null = null;
        let dropPointNama: string | null = null;

        if (gunakan_drop_point) {
            if (!drop_point_id_raw) {
                return errorJson("Mohon pilih drop point terlebih dahulu.", 400);
            }

            const selectedDropPoint = await prisma.drop_point.findUnique({
                where: {
                    id: BigInt(drop_point_id_raw),
                },
            });

            if (!selectedDropPoint) {
                return errorJson("Drop point tidak ditemukan.", 404);
            }

            id_drop_point = selectedDropPoint.id;
            dropPointNama = selectedDropPoint.nama_drop_point;
        }

        const nomor_tiket = await generateNomorTiket();
        const id = generateTiketServisId();

        const createdTicket = await prisma.tiket_servis.create({
            data: {
                id,
                nomor_tiket,
                tanggal_masuk: new Date(tanggalMasukRaw),
                nama_cust,
                phone_cust,
                alamat_cust: alamat_cust || null,
                jenis_perangkat,
                merk_perangkat: merk_perangkat || null,
                keluhan,
                sumber_tiket: "Guest",
                guest_session_id: guestSessionId,
                status_verifikasi: "Menunggu",
                status_servis: "Belum_Diproses",
                estimasi_biaya: 0,
                ...(gunakan_drop_point && id_drop_point
                    ? {
                        drop_point: {
                            connect: {
                                id: id_drop_point,
                            },
                        },
                    }
                    : {}),
            },
            include: {
                drop_point: true,
            },
        });

        const response = NextResponse.json({
            success: true,
            message: "Tiket servis berhasil dibuat.",
            ticket: {
                ...normalizeTicketResponse(createdTicket),
                drop_point_nama: dropPointNama,
            },
        });

        if (isNew) {
            response.cookies.set(GUEST_TICKET_COOKIE_NAME, guestSessionId, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
            });
        }

        return response;
    } catch (error) {
        console.error("POST /api/public/tiket-servis error:", error);

        const message =
            error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat membuat tiket servis.";

        return NextResponse.json(
            {
                success: false,
                message,
            },
            { status: 500 }
        );
    }
}