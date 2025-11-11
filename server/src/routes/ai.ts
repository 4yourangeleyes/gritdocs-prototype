import express from 'express';

const router = express.Router();

// Placeholder AI/NLP endpoint for Phase 3
router.post('/parse-text', async (req, res, next) => {
  try {
    const { text } = req.body;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock parsed data - this will be replaced with actual AI/NLP service
    const mockParsedData = {
      clientName: extractClientName(text),
      lineItems: extractLineItems(text),
      currency: extractCurrency(text),
      dueDate: extractDueDate(text),
      confidence: 0.85,
    };

    res.json({
      success: true,
      data: mockParsedData,
    });
  } catch (error) {
    next(error);
  }
});

// Mock extraction functions - replace with actual AI/NLP
function extractClientName(text: string): string | null {
  const lines = text.toLowerCase().split('\n');
  // Simple heuristic - look for company patterns
  for (const line of lines) {
    if (line.includes('company') || line.includes('ltd') || line.includes('inc')) {
      return line.trim();
    }
  }
  return null;
}

function extractLineItems(text: string) {
  const lines = text.split('\n');
  const items = [];
  
  for (const line of lines) {
    // Look for patterns like "Description - $100" or "Service 2 hours @$50/hr"
    const match = line.match(/^(.+?)\s*[-–]\s*[$€]?(\d+(?:\.\d{2})?)/);
    if (match) {
      items.push({
        description: match[1].trim(),
        quantity: 1,
        unitPrice: parseFloat(match[2]),
      });
    }
  }
  
  return items.length > 0 ? items : [
    { description: 'Consulting Services', quantity: 1, unitPrice: 100 }
  ];
}

function extractCurrency(text: string): 'EUR' | 'ZAR' {
  if (text.includes('€') || text.toLowerCase().includes('euro')) {
    return 'EUR';
  }
  if (text.includes('R') || text.toLowerCase().includes('rand')) {
    return 'ZAR';
  }
  return 'EUR'; // Default
}

function extractDueDate(text: string): string {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + 30); // Default 30 days
  return dueDate.toISOString().split('T')[0];
}

export { router as aiRoutes };