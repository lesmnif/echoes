import { MotivationalPost } from "@/app/api/motivational-post/schema";

export interface GeneratedImage {
  dataUrl: string;
  width: number;
  height: number;
}

export async function generateMotivationalImages(post: MotivationalPost): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = [];
  
  for (const slide of post.slides) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas dimensions (Instagram post ratio 4:5)
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;
    
    // Fill background
    ctx.fillStyle = slide.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Set text properties
    ctx.fillStyle = slide.textColor;
    ctx.textAlign = slide.textAlign.includes('text-center') ? 'center' : 
                   slide.textAlign.includes('text-left') ? 'left' : 'right';
    
    // Set font
    let fontSize = 48; // Default size
    if (slide.fontSize.includes('text-4xl')) fontSize = 64;
    else if (slide.fontSize.includes('text-3xl')) fontSize = 48;
    else if (slide.fontSize.includes('text-2xl')) fontSize = 32;
    else if (slide.fontSize.includes('text-xl')) fontSize = 24;
    else if (slide.fontSize.includes('text-lg')) fontSize = 20;
    else if (slide.fontSize.includes('text-base')) fontSize = 16;
    else if (slide.fontSize.includes('text-sm')) fontSize = 14;
    
    const fontWeight = slide.fontWeight.includes('font-bold') ? 'bold' : 
                     slide.fontWeight.includes('font-semibold') ? '600' : 'normal';
    const fontFamily = slide.fontFamily === 'serif' ? 'Georgia, serif' : 
                      slide.fontFamily === 'monospace' ? 'Courier New, monospace' : 
                      'Arial, sans-serif';
    
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    
    // Calculate text position
    let x = width / 2; // Default center
    if (slide.textPosition.x.includes('left')) x = 100;
    if (slide.textPosition.x.includes('right')) x = width - 100;
    
    let y = height / 2; // Default center
    if (slide.textPosition.y.includes('top')) y = 200;
    if (slide.textPosition.y.includes('bottom')) y = height - 200;
    
    // Draw title
    ctx.fillText(slide.content.title, x, y);
    
    // Draw subtitle if exists
    if (slide.content.subtitle) {
      ctx.font = `normal ${Math.round(fontSize * 0.6)}px ${fontFamily}`;
      ctx.fillText(slide.content.subtitle, x, y + Math.round(fontSize * 0.8));
    }
    
    // Draw body text if exists
    if (slide.content.body) {
      ctx.font = `normal ${Math.round(fontSize * 0.5)}px ${fontFamily}`;
      const words = slide.content.body.split(' ');
      const maxWidth = width - 200;
      let line = '';
      let lineY = y + Math.round(fontSize * 1.5);
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, x, lineY);
          line = word + ' ';
          lineY += Math.round(fontSize * 0.7);
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, lineY);
    }
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    images.push({
      dataUrl,
      width,
      height
    });
  }
  
  return images;
}

// Server-side version using node-canvas (for API routes)
export async function generateMotivationalImagesServer(post: MotivationalPost): Promise<Buffer[]> {
  // This would require node-canvas package
  // For now, we'll return empty array and handle client-side generation
  return [];
} 