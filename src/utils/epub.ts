import Epub from 'epub-gen';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

interface EpubOptions {
  title: string;
  author: string;
  content: string;
  watermarkText: string;
}

export class EpubGenerator {
  private async addWatermark(content: string, watermarkText: string): Promise<string> {
    // Add watermark to content
    const watermarkedContent = `
      <div style="position: relative;">
        <div style="position: absolute; top: 0; right: 0; opacity: 0.3; font-size: 12px; color: #999; z-index: 1000;">
          ${watermarkText}
        </div>
        ${content}
        <div style="text-align: center; margin-top: 50px; opacity: 0.5; font-size: 12px; color: #999;">
          ${watermarkText}
        </div>
      </div>
    `;
    
    return watermarkedContent;
  }

  async generateEpub(options: EpubOptions): Promise<Buffer> {
    const { title, author, content, watermarkText } = options;
    
    // Add watermark to content
    const watermarkedContent = await this.addWatermark(content, watermarkText);
    
    const epubOptions = {
      title,
      author,
      publisher: 'Personal Writing Website',
      cover: undefined, // You can add a cover image path here
      content: [
        {
          title: title,
          data: watermarkedContent
        }
      ],
      css: `
        body {
          font-family: 'Spectral', Georgia, serif;
          line-height: 1.6;
          margin: 20px;
        }
        h1, h2, h3 {
          color: #333;
          font-family: 'Spectral', Georgia, serif;
        }
        p {
          margin-bottom: 1em;
        }
      `,
      verbose: false
    };

    return new Promise((resolve, reject) => {
      const epub = new Epub(epubOptions);
      
      epub.promise.then((data: any) => {
        resolve(data as Buffer);
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  async saveEpub(options: EpubOptions, outputPath: string): Promise<string> {
    try {
      const epubBuffer = await this.generateEpub(options);
      
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file
      fs.writeFileSync(outputPath, epubBuffer);
      
      return outputPath;
    } catch (error) {
      console.error('Error generating EPUB:', error);
      throw new Error('Failed to generate EPUB file');
    }
  }
}

export default new EpubGenerator();