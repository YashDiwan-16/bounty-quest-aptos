// import { TaskGeneratorService } from "@/services/taskGeneratorService";
import { NextRequest, NextResponse } from "next/server";
import clientPromise from '@/lib/clientpromise';

export const revalidate = 0;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'endTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const pageSize = 12;

    try {
        const client = await clientPromise;
        const db = client.db('tweetcontest');

        const query = {
            isActive: false,
            ...(category ? { category } : {})
        };

        const totalItems = await db.collection('tasks').countDocuments(query);
        const totalPages = Math.ceil(totalItems / pageSize);

        const tasks = await db.collection('tasks')
            .find(query)
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return NextResponse.json({
            tasks,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page,
                pageSize
            }
        });
    } catch (error) {
        console.error('Error fetching past tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}