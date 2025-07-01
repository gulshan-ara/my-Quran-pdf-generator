// src/utils/pdf.ts
import puppeteer from "puppeteer";

export async function generatePDFWithPuppeteer(
  surah: any,
  verses: any[]
): Promise<Uint8Array> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

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
        }
        .title { 
          text-align: center; 
          font-size: 24px; 
          margin-bottom: 20px; 
        }
        .verse { 
          margin-bottom: 20px; 
          border-bottom: 1px solid #eee; 
          padding-bottom: 15px; 
        }
        .verse-number { 
          font-weight: bold; 
          color: #2563eb; 
        }
        .arabic { 
          font-size: 18px; 
          line-height: 1.8; 
          margin: 10px 0; 
        }
        .translation { 
          font-size: 14px; 
          color: #555; 
          direction: ltr; 
          text-align: left; 
        }
      </style>
    </head>
    <body>
      <div class="title">
        <h1>سورة ${surah.name_arabic}</h1>
        <h2>Surah ${surah.name_simple}</h2>
        <p>Chapter ${surah.id} - ${surah.verses_count} verses</p>
      </div>
      ${verses
        .map((verse) => {
          console.log(verse);
          return `
        <div class="verse">
          <div class="verse-number">Verse ${verse.verse_key.split(":")[1]}</div>
          <div class="arabic">${verse.text_uthmani}</div>
          ${
            verse.translations && verse.translations[0] && verse.translations[0].text
              ? `<div class="translation">${verse.translations[0].text}</div>`
              : ""
          }
        </div>
      `;
        })
        .join("")}
    </body>
    </html>
  `;

  await page.setContent(html);
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      bottom: "20px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();
  return pdf;
}
