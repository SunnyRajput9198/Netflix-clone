import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { generateAppToken } from '@/lib/auth-utils'; // Import only the generation utility

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const reqBody = await req.json();
        const { creatorId } = reqBody;

        if (!creatorId) {
            return NextResponse.json({ success: false, message: 'Missing creatorId' }, { status: 400 });
        }
        console.log("session.user.id", session.user.id);

        const token = generateAppToken({ userId: session.user.id, creatorId });
        return NextResponse.json({ success: true, token }, { status: 200 });
    } catch (error: any) {
        console.error('Error in /api/generate-token:', error);
        return NextResponse.json({ success: false, message: 'Failed to generate token: ' + error.message }, { status: 500 });
    }
}