import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { BankDataMap, BankData } from '@/types/mortgage';

const DATA_FILE = path.join(process.cwd(), 'data', 'banks.json');

async function readBankData(): Promise<BankDataMap> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data) as BankDataMap;
  } catch {
    // Return empty object if file doesn't exist or is invalid
    return {};
  }
}

async function writeBankData(data: BankDataMap): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const bankData = await readBankData();
    return NextResponse.json(bankData);
  } catch (error) {
    console.error('Error reading bank data:', error);
    return NextResponse.json(
      { error: 'Failed to read bank data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bankKey, data } = body as { bankKey: string; data: BankData };

    if (!bankKey || !data) {
      return NextResponse.json(
        { error: 'Missing bankKey or data' },
        { status: 400 }
      );
    }

    const bankData = await readBankData();
    bankData[bankKey] = data;
    await writeBankData(bankData);

    return NextResponse.json({ success: true, data: bankData[bankKey] });
  } catch (error) {
    console.error('Error updating bank data:', error);
    return NextResponse.json(
      { error: 'Failed to update bank data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as BankDataMap;
    await writeBankData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving bank data:', error);
    return NextResponse.json(
      { error: 'Failed to save bank data' },
      { status: 500 }
    );
  }
}
