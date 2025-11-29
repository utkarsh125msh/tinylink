// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET(
//     request: Request,
//     context: { params: Promise<{ code: string }> }
// ) {
//     // NEW NEXT.JS 16 WAIT FOR PARAMS
//     const { code } = await context.params;

//     // Fast reject invalid codes
//     if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
//         return new Response('Not found', { status: 404 });
//     }

//     try {
//         // Atomic click increment + fetch target
//         const link = await prisma.$transaction(async (tx) => {
//             const existing = await tx.link.findUnique({ where: { code } });
//             if (!existing || existing.deleted) return null;

//             const updated = await tx.link.update({
//                 where: { code },
//                 data: {
//                     clicks: { increment: 1 },
//                     lastClicked: new Date(),
//                 },
//             });

//             return updated;
//         });

//         if (!link) {
//             return new Response('Not found', { status: 404 });
//         }

//         return NextResponse.redirect(link.target, 302);
//     } catch (err) {
//         console.error('Redirect error', err);
//         return new Response('Internal Server Error', { status: 500 });
//     }
// }
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    props: { params: Promise<{ code: string }> }
) {
    const params = await props.params;
    const { code } = params;

    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
        return new NextResponse("Not found", { status: 404 });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const link = await tx.link.findUnique({ where: { code } });
            if (!link || link.deleted) return null;

            await tx.link.update({
                where: { code },
                data: {
                    clicks: { increment: 1 },
                    lastClicked: new Date(),
                },
            });

            return link;
        });

        if (!result) {
            return new NextResponse("Not found", { status: 404 });
        }

        return NextResponse.redirect(result.target, { status: 302 });
    } catch (err) {
        console.error("Redirect error:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}