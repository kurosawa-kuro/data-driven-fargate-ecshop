import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const email = (await cookieStore).get('email')?.value;
  console.log("API Route - email from cookie:", email);

    try {
        const products = await prisma.product.findMany();
        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating sample:', error.message);
            return NextResponse.json(
                { error: 'Failed to create sample: ' + error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create sample' },
            { status: 500 }
        );
    }
}