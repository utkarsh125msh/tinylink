// redirect handler - Redirect with atomic increment


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  // Validate basic shape (fast): must be 6-8 alnum
  if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    // Atomically increment clicks and get target in single transaction
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.link.findUnique({ where: { code } });
      if (!row || row.deleted) return null;

      const res = await tx.link.update({
        where: { code },
        data: { clicks: { increment: 1 }, lastClicked: new Date() },
      });
      return res;
    });

    if (!updated) return new Response('Not found', { status: 404 });

    // Use NextResponse.redirect to preserve headers
    return NextResponse.redirect(updated.target, 302);
  } catch (err) {
    console.error('Redirect error for code', code, err);
    return new Response('Internal server error', { status: 500 });
  }
}
