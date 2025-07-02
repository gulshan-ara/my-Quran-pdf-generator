// src/utils/pdf.ts
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function generatePDFWithPuppeteer(
  surahDataArr: { surah: any; verses: any[] }[]
): Promise<Uint8Array> {
  let browser;
  
  try {
    // Add more chromium args for better compatibility
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
      timeout: 30000, // 30 second timeout
    });

    const page = await browser.newPage();
    
    // Set a larger viewport for better rendering
    await page.setViewport({ width: 1200, height: 800 });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            padding: 20px;
            margin: 0;
          }
          .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 90vh;
            page-break-after: always;
          }
          .cover-title {
            font-size: 40px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
          .title { 
            text-align: center; 
            font-size: 24px; 
            margin-bottom: 20px; 
          }
          .verse { 
            margin-bottom: 20px; 
            display: flex;
            flex-direction: row-reverse;
            align-items: flex-start;
          }
          .verse-number { 
            font-weight: bold; 
            color: #2563eb; 
            font-size: 22px;
            margin-left: 16px;
            min-width: 32px;
            text-align: left;
            direction: ltr;
            flex-shrink: 0;
          }
          .arabic { 
            font-size: 34px; 
            line-height: 1.8; 
            margin: 10px 0; 
            flex: 1;
            word-wrap: break-word;
          }
          .translation { 
            font-size: 20px; 
            color: #555; 
            direction: ltr; 
            text-align: left; 
            padding-left: 24px;
            margin-top: 10px;
          }
          .surah-section {
            page-break-after: always;
          }
          .surah-section:last-child {
            page-break-after: auto;
          }
          .translation-block {
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 20px;
            margin-right: 48px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="cover-page">
          <div class="cover-title">Daily Dose of Quran Combined</div>
        </div>
        ${surahDataArr
          .map(({ surah, verses }) => `
            <div class="surah-section">
              <div class="title">
                <h1>سورة ${surah?.name_arabic || 'Unknown'}</h1>
                <h2>Surah ${surah?.name_simple || 'Unknown'}</h2>
                <p>${surah?.verses_count || verses?.length || 0} verses</p>
              </div>
              ${verses
                ?.map((verse) => `
                  <div class="verse">
                    <div class="verse-number">${
                      verse?.verse_key?.split(":")[1] || '?'
                    }.</div>
                    <div class="arabic">${verse?.text_uthmani || ''}</div>
                  </div>
                  ${
                    verse?.translations?.[0]?.text
                      ? `<div class="translation-block"><div class="translation">${verse.translations[0].text}</div></div>`
                      : '<div class="translation-block"></div>'
                  }
                `)
                .join("") || ''}
            </div>
          `)
          .join("")}
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "20px",
        left: "20px",
        right: "20px",
      },
      timeout: 30000,
    });

    return pdf;
  } catch (error) {
    console.error('Puppeteer error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}