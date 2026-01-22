/**
 * AI API client using OpenAI for both text analysis and image generation
 * - Text Analysis: OpenAI GPT-3.5-turbo
 * - Image Generation: OpenAI DALL-E 3
 */

/**
 * Analyze text using OpenAI API
 * @param inputText The text to analyze
 * @param format The desired format (comic, flowchart, infographic)
 * @returns Promise resolving to structured content
 */
export const analyzeTextWithOpenAI = async (
  inputText: string, 
  format: 'comic' | 'flowchart' | 'infographic'
): Promise<any> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/analyze-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputText,
        format
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend API Error:', errorData);
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend API Response:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing text with OpenAI:', error);
    throw error;
  }
};

/**
 * Generate image using OpenAI DALL-E 3
 * @param prompt The text prompt for image generation
 * @param format The desired format (comic, flowchart, infographic)
 * @returns Promise resolving to multiple image variations
 */
export const generateImageWithDALLE = async (
  prompt: string,
  format: 'comic' | 'flowchart' | 'infographic'
): Promise<{ variations: Array<{id: number, url: string, seed: number}>, message: string }> => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        format
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend API Error:', errorData);
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend API Response:', data);
    return data;
  } catch (error) {
    console.error('Error generating image with DALL-E:', error);
    throw error;
  }
};

/**
 * Generate placeholder image when DALL-E fails
 * @param prompt The original prompt
 * @param format The desired format
 * @returns Promise resolving to placeholder image variations
 */
export const generateImagePlaceholder = async (
  prompt: string,
  format: 'comic' | 'flowchart' | 'infographic'
): Promise<{ variations: Array<{id: number, url: string, seed: number}>, message: string }> => {
  console.log('Using placeholder image generation');
  console.log('Image generation prompt:', prompt);
  console.log('Format:', format);
  
  // Enhanced placeholder images with better styling
  const placeholderImages = {
    comic: 'https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Comic+Strip+Placeholder',
    flowchart: 'https://via.placeholder.com/1024x1024/10B981/FFFFFF?text=Flowchart+Placeholder', 
    infographic: 'https://via.placeholder.com/1024x1024/F59E0B/FFFFFF?text=Infographic+Placeholder'
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    variations: [
      { 
        id: 1, 
        url: placeholderImages[format], 
        seed: 123456
      },
      { 
        id: 2, 
        url: placeholderImages[format], 
        seed: 234567
      },
      { 
        id: 3, 
        url: placeholderImages[format], 
        seed: 345678
      }
    ],
    message: 'Placeholder images generated (DALL-E API unavailable)'
  };
};
