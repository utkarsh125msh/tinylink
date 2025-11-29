// src/app/api/links/[code]/route.ts

// GET and Delete for specific code


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidCode } from '@/lib/validators';

export async function DELETE(
    _req: Request,
    props: { params: Promise<{ code: string }> }
) {
    const params = await props.params;
    const code = params.code;
    if (!isValidCode(code)) return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });

    try {
        // Soft-delete: mark deleted = true so history is preserved
        const existing = await prisma.link.findUnique({ where: { code } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await prisma.link.update({
            where: { code },
            data: { deleted: true },
        });

        return new Response(null, { status: 204 });
    } catch (err) {
        console.error('DELETE /api/links/:code error', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    _req: Request,
    props: { params: Promise<{ code: string }> }
) {
    const params = await props.params;
    const code = params.code;
    if (!isValidCode(code)) return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });

    try {
        const link = await prisma.link.findUnique({ where: { code } });
        if (!link || link.deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(link);
    } catch (err) {
        console.error('GET /api/links/:code error', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
