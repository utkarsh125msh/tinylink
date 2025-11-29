// src/app/api/links/[code]/route.ts

// GET and Delete for specific code


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidCode } from '@/lib/validators';


export async function DELETE(
  req: Request,
  { params }: { params: { code: string } }
) {
  const { code } = await params;
  
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }
  
  try {
    const existing = await prisma.link.findUnique({ where: { code } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    await prisma.link.update({
      where: { code },
      data: { deleted: true },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const { code } = await params;
  
  if (!isValidCode(code)) {
    return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
  }
  
  try {
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link || link.deleted) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(link);
  } catch (err) {
    console.error('GET /api/links/:code error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}