import puppeteer from 'puppeteer';
import { promises as fs } from 'fs'
import PDFMerger from 'pdf-merger-js'

async function crawlAndSavePDF(url, filename, selectors) {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });    

    if (selectors && selectors.length > 0) {
      await page.evaluate((sels) => {
        const newBody = document.createElement('body');
        sels.forEach(sel => {
          const elements = document.querySelectorAll(sel);
          elements.forEach(el => newBody.appendChild(el.cloneNode(true)));
        });
        document.body = newBody;
      }, selectors);
    }

    await page.pdf({ 
      path: filename, 
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();
    return true;
  } catch (error) {
    console.error(`Error processing ${url}: ${error.message}`);
    return false;
  }
}

async function mergePDFs(inputFiles, outputFile) {
  const merger = new PDFMerger();
  for (const file of inputFiles) {
    await merger.add(file);
  }
  await merger.save(outputFile);
}

function parseUrls(input) {
  return input.split('\n').filter(line => line.trim() !== '').map(line => {
    const [url, ...selectorsPart] = line.split('|').map(item => item.trim());
    const selectors = selectorsPart.length > 0 ? selectorsPart[0].split(',').map(s => s.trim()) : [];
    return { url, selectors };
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node doc-ock.js <output_filename> <urls_or_file>');
    process.exit(1);
  }

  const outputFilename = args[0];
  const urlFile = args[1];

  let urlsData;
  try {
    const fileContent = await fs.readFile(urlFile, 'utf-8');
    urlsData = parseUrls(fileContent);
  } catch (error) {
    console.error(`Error reading URL file: ${error.message}`);
    process.exit(1);
  }

  if (urlsData.length === 0) {
    console.log('No valid URLs provided.');
    process.exit(1);
  }

  const pdfFiles = [];
  let errorCount = 0;

  for (let i = 0; i < urlsData.length; i++) {
    const { url, selectors } = urlsData[i];
    const filename = `output_${i + 1}.pdf`;
    process.stdout.write(`Processing [${i + 1}/${urlsData.length}]: ${url} `);
    
    const success = await crawlAndSavePDF(url, filename, selectors);
    if (success) {
      pdfFiles.push(filename);
      process.stdout.write('✓\n');
    } else {
      process.stdout.write('✗\n');
      errorCount++;
    }

    if (errorCount > urlsData.length / 2) {
      console.error('Error occurred: More than half of the URLs failed. Please try again.');
      process.exit(1);
    }
  }

  if (pdfFiles.length > 0) {
    console.log('Merging PDFs...');
    await mergePDFs(pdfFiles, outputFilename);
    console.log(`Merged PDFs into ${outputFilename}`);

    console.log('Cleaning up individual PDF files...');
    for (const file of pdfFiles) {
      await fs.unlink(file);
    }
    console.log('Cleanup complete.');
  } else {
    console.log('No PDFs were successfully created. Exiting.');
  }
}

main().catch(console.error);