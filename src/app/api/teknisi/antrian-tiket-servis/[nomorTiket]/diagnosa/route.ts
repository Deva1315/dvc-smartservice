import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") return value.toString();

      if (
        value &&
        typeof value === "object" &&
        value.constructor?.name === "Decimal"
      ) {
        return value.toString();
      }

      return value;
    })
  );
}

function parseRequiredBigInt(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${fieldName} wajib diisi`);
  }

  const stringValue = String(value);

  if (!/^\d+$/.test(stringValue)) {
    throw new Error(`${fieldName} harus berupa angka`);
  }

  return BigInt(stringValue);
}

type RouteParams = {
  params: Promise<{
    nomorTiket: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { nomorTiket } = await params;
    const body = await request.json();

    const idUser = parseRequiredBigInt(body.id_user, "User teknisi");
    const hasilDiagnosa =
      typeof body.hasil_diagnosa === "string"
        ? body.hasil_diagnosa.trim()
        : "";

    const catatanTeknisi =
      typeof body.catatan_teknisi === "string" &&
      body.catatan_teknisi.trim() !== ""
        ? body.catatan_teknisi.trim()
        : null;

    if (!hasilDiagnosa) {
      return NextResponse.json(
        {
          success: false,
          message: "Hasil diagnosa wajib diisi",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const tiket = await tx.tiket_servis.findUnique({
        where: {
          nomor_tiket: nomorTiket,
        },
      });

      if (!tiket) {
        throw new Error("Tiket servis tidak ditemukan");
      }

      const user = await tx.users.findUnique({
        where: {
          id: idUser,
        },
      });

      if (!user) {
        throw new Error("User teknisi tidak ditemukan");
      }

      const existingDiagnosa = await tx.diagnosa_lanjutan.findFirst({
        where: {
          id_tiket_servis: tiket.id,
        },
        orderBy: {
          id: "desc",
        },
      });

      if (existingDiagnosa) {
        const updatedDiagnosa = await tx.diagnosa_lanjutan.update({
          where: {
            id: existingDiagnosa.id,
          },
          data: {
            id_user: idUser,
            hasil_diagnosa: hasilDiagnosa,
            catatan_teknisi: catatanTeknisi,
          },
          include: {
            users: {
              select: {
                id: true,
                nama: true,
                email: true,
              },
            },
          },
        });

        return {
          action: "updated",
          diagnosa: updatedDiagnosa,
        };
      }

      const createdDiagnosa = await tx.diagnosa_lanjutan.create({
        data: {
          id_tiket_servis: tiket.id,
          id_user: idUser,
          hasil_diagnosa: hasilDiagnosa,
          catatan_teknisi: catatanTeknisi,
        },
        include: {
          users: {
            select: {
              id: true,
              nama: true,
              email: true,
            },
          },
        },
      });

      return {
        action: "created",
        diagnosa: createdDiagnosa,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message:
          result.action === "updated"
            ? "Diagnosa lanjutan berhasil diperbarui"
            : "Diagnosa lanjutan berhasil disimpan",
        data: serializeData(result.diagnosa),
      },
      { status: result.action === "updated" ? 200 : 201 }
    );
  } catch (error) {
    console.error("POST DIAGNOSA LANJUTAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan diagnosa lanjutan",
      },
      { status: 500 }
    );
  }
}