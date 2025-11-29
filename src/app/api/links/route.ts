// POST + GET (list)


import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isValidUrl, isValidCode } from '@/lib/validators';
import { genCode } from '@/lib/codegen';


// function isValidUrl(url: string): boolean {
//     try {
//         const parsed = new URL(url);
//         return parsed.protocol === "http:" || parsed.protocol === "https:";
//     } catch {
//         return false;
//     }
// }

// function isValidCode(code: string): boolean {
//     return /^[A-Za-z0-9]{6,8}$/.test(code);
// }

// function genCode(length = 6) {
//     const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     let res = "";
//     for (let i = 0; i < length; i++) {
//         res += chars[Math.floor(Math.random() * chars.length)];
//     }
//     return res;
// }

type CreateBody = {
  target?: string;
  code?: string;
};

function formatError(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

// POST /api/links → create short link
export async function POST(req: Request) {
  const body = (await req.json()) as CreateBody;
  const target = (body.target || '').trim();
  let code = body.code?.trim();

  if (!target) return formatError('target is required');
  if (!isValidUrl(target)) return formatError('Invalid target URL (must start with http/https)');

  if (code && !isValidCode(code)) {
    return formatError('Invalid code format. Must be 6-8 alphanumeric.');
  }

  // Try to create; on unique collision retry up to N times (regenerate code).
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      if (!code) code = genCode(6);

      const created = await prisma.link.create({
        data: { code, target },
      });

      // Return created resource (201)
      return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
      // Prisma unique constraint code
      if (err?.code === 'P2002') {
        // If user provided custom code, conflict -> 409
        if (body.code) {
          return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
        }
        // Otherwise regenerate and retry
        code = undefined;
        continue;
      }
      // unexpected error
      console.error('POST /api/links error', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
// GET /api/links → list all links
export async function GET() {
  try {
    const rows = await prisma.link.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/links error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


