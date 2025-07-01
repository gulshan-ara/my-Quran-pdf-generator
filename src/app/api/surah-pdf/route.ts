// src/app/api/surah-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePDFWithPuppeteer } from '@/utils/pdf';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const surahParam = searchParams.get('surah') || '1';
  const translationId = searchParams.get('translation') || '20';

  // Support multiple surah IDs
  const surahIds = surahParam.split(',');
  const surahDataArr = [];

  for (const surahId of surahIds) {
    // Fetch surah info
    const surahRes = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
    const surahData = await surahRes.json();
    const surah = surahData.chapter;

    // Fetch verses
    const versesRes = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`
    );
    const versesData = await versesRes.json();

    // Fetch translations 
    const translationRes = await fetch(
      `https://api.quran.com/api/v4/quran/translations/${translationId}?chapter_number=${surahId}`
    );
    const translationData = await translationRes.json();

    // Merge translations into verses
    const verses = versesData.verses.map((verse: any, idx: number) => ({
      ...verse,
      translations: [translationData.translations[idx]],
    }));

    surahDataArr.push({ surah, verses });
  }

  // Generate PDF for all surahs
  const pdf = await generatePDFWithPuppeteer(surahDataArr);

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="surahs-${surahIds.join('-')}.pdf"`,
    },
  });
}