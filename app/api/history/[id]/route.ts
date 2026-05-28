import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.run.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    console.error("DELETE ERROR:", err);

    // already deleted
    if (err?.code === "P2025") {
      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        error: "Delete failed",
      },
      {
        status: 500,
      }
    );
  }
}