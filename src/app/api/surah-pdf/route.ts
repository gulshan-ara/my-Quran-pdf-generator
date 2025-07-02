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
    try {
      // Fetch surah info
      const surahRes = await fetch(`https://api.quran.com/api/v4/chapters/${surahId}`);
      const surahData = await surahRes.json();
      
      // Use composite API call for verses with translations
      const versesRes = await fetch(
        `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?translations=${translationId}&text_type=uthmani`
      );
      const versesData = await versesRes.json();
      
      // Data should already be properly structured
      const verses = versesData.verses || [];
      
      surahDataArr.push({ 
        surah: surahData.chapter, 
        verses 
      });
      
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
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