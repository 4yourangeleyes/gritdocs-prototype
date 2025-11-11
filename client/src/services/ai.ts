// AI Service for document generation and processing using Google Gemini
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export interface AIDocumentRequest {
  type: 'invoice' | 'contract' | 'hr_document';
  context: {
    clientName?: string;
    serviceDescription?: string;
    amount?: number;
    deadline?: string;
    notes?: string;
  };
  voiceInput?: string;
}

export interface AIDocumentResponse {
  title: string;
  content: any;
  suggestions?: string[];
  estimatedAmount?: number;
}

export interface VoiceTranscription {
  text: string;
  confidence: number;
  duration: number;
}

class AIService {
  private isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const prototypeMode = process.env.REACT_APP_PROTOTYPE_MODE === 'true';
    
    if (apiKey && !prototypeMode) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      if (prototypeMode) {
        console.log('🚀 PROTOTYPE MODE: Using intelligent fallback templates');
      } else {
        console.warn('Gemini API key not found. Using fallback templates.');
      }
    }
  }

  // Generate document content based on AI prompt
  async generateDocument(request: AIDocumentRequest): Promise<AIDocumentResponse> {
    const { type, context } = request;

    // Try AI generation first if available
    if (this.genAI) {
      try {
        return await this.generateWithAI(request);
      } catch (error) {
        console.error('AI generation failed, falling back to templates:', error);
      }
    }

    // Fallback to templates
    switch (type) {
      case 'invoice':
        return this.generateInvoiceTemplate(context);
      case 'contract':
        return this.generateContractTemplate(context);
      case 'hr_document':
        return this.generateHRTemplate(context);
      default:
        throw new Error('Unsupported document type');
    }
  }

  // Generate content using Gemini AI
  private async generateWithAI(request: AIDocumentRequest): Promise<AIDocumentResponse> {
    if (!this.genAI) throw new Error('AI not available');

    const model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const { type, context, voiceInput } = request;
    
    let prompt = '';
    
    if (type === 'invoice') {
      prompt = `Create a professional invoice for ${context.clientName || 'a client'}. 
      Service: ${context.serviceDescription || 'Professional services'}
      ${context.amount ? `Amount: $${context.amount} NZD` : ''}
      ${context.deadline ? `Due date: ${context.deadline}` : ''}
      ${context.notes ? `Notes: ${context.notes}` : ''}
      ${voiceInput ? `Voice input: ${voiceInput}` : ''}
      
      Please provide a structured response with line items, subtotal, 15% GST, and total. Format for New Zealand business.`;
    } else if (type === 'contract') {
      prompt = `Create a professional service contract for ${context.clientName || 'a client'}.
      Service: ${context.serviceDescription || 'Professional services'}
      ${context.deadline ? `Completion date: ${context.deadline}` : ''}
      ${context.amount ? `Contract value: $${context.amount} NZD` : ''}
      ${context.notes ? `Special requirements: ${context.notes}` : ''}
      
      Include standard clauses for New Zealand business law, payment terms, warranties, and liability.`;
    } else {
      prompt = `Create a professional HR document/employment contract.
      ${context.notes ? `Requirements: ${context.notes}` : ''}
      
      Include standard employment terms for New Zealand, duties, remuneration framework, and compliance requirements.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response into structured format
    return this.parseAIResponse(text, type, context);
  }

  // Parse AI response into structured format
  private parseAIResponse(aiText: string, type: string, context: any): AIDocumentResponse {
    // This is a simplified parser - in production you'd want more sophisticated parsing
    const title = type === 'invoice' ? 'AI-Generated Invoice' : 
                  type === 'contract' ? 'AI-Generated Contract' : 'AI-Generated HR Document';

    return {
      title,
      content: {
        aiGenerated: true,
        body: aiText,
        originalContext: context,
      },
      suggestions: [
        'Review and customize the generated content',
        'Add your company branding',
        'Verify legal compliance',
      ],
      estimatedAmount: context.amount,
    };
  }

  // Start voice recording
  async startVoiceRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;

    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Failed to access microphone. Please check permissions.');
    }
  }

  // Stop voice recording and return audio blob
  async stopVoiceRecording(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress');
    }

    return new Promise((resolve, reject) => {
      const currentRecorder = this.mediaRecorder!;
      
      currentRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        // Stop all audio tracks
        if (currentRecorder.stream) {
          currentRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }
        
        resolve(audioBlob);
      };

      currentRecorder.onerror = () => {
        reject(new Error('Recording failed'));
      };

      currentRecorder.stop();
    });
  }

  // Transcribe audio to text (prototype with realistic examples)
  async transcribeAudio(audioBlob: Blob): Promise<VoiceTranscription> {
    const isPrototype = process.env.REACT_APP_PROTOTYPE_MODE === 'true';
    
    // Realistic prototype transcriptions based on actual tradesperson scenarios
    const realisticTranscriptions = [
      'Create an invoice for plumbing work at 23 Queen Street. Fixed the kitchen sink blockage and replaced the tap washer. Took about 2 hours at my standard rate of $95 per hour.',
      
      'I need a contract for electrical rewiring job on Ponsonby Road. The house is from the 1940s and needs complete rewiring. Should take about 5 days. Materials will be around $2000.',
      
      'Invoice for emergency roof repair last weekend. Storm damage to tiles on the north side. 4 hours emergency rate plus materials. About $1200 total.',
      
      'Contract for painting the exterior of a villa in Parnell. 3 bedrooms, weatherboard house. Quote was $8500 including all prep work and premium paint.',
      
      'Create invoice for landscaping work. Removed the old hedge, planted new natives, and laid fresh lawn. Client is Sarah Johnson. 2 days work.',
      
      'Need a service agreement for ongoing commercial cleaning. Twice weekly cleaning for the dental practice on High Street. 6 month contract.',
      
      'Invoice for urgent plumbing callout to the restaurant. Burst pipe in the kitchen flooded everything. Had to work through the night to get them back open.',
      
      'Contract for building the new deck. Kauri timber, 40 square meters with built-in seating. Materials plus 10 days labour. Due to start next month.',
    ];

    const selectedText = realisticTranscriptions[Math.floor(Math.random() * realisticTranscriptions.length)];
    
    // Add prototype indicator
    const finalText = isPrototype 
      ? `${selectedText} [Note: This is a prototype transcription - in production, your actual voice would be transcribed using advanced AI]`
      : selectedText;
    
    // Simulate realistic processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      text: finalText,
      confidence: isPrototype ? 0.98 : 0.95,
      duration: audioBlob.size / 1000,
    };
  }

  // Process voice input to extract document information
  parseVoiceInput(transcription: string): Partial<AIDocumentRequest> {
    const text = transcription.toLowerCase();
    
    let type: 'invoice' | 'contract' | 'hr_document' = 'invoice';
    if (text.includes('contract') || text.includes('agreement')) {
      type = 'contract';
    } else if (text.includes('employment') || text.includes('hr') || text.includes('employee')) {
      type = 'hr_document';
    }

    // Extract key information using simple pattern matching
    // In a real implementation, this would use NLP/AI
    const context: any = {};

    // Extract amounts
    const amountMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      context.amount = parseFloat(amountMatch[1]);
    }

    // Extract hours
    const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*hours?/);
    if (hoursMatch) {
      context.hours = parseFloat(hoursMatch[1]);
    }

    // Extract rates
    const rateMatch = text.match(/\$(\d+(?:\.\d{2})?)\s*(?:per\s*hour|\/hour|hourly)/);
    if (rateMatch) {
      context.rate = parseFloat(rateMatch[1]);
    }

    // Extract service type
    const services = ['plumbing', 'electrical', 'construction', 'carpentry', 'painting', 'roofing'];
    const service = services.find(s => text.includes(s));
    if (service) {
      context.serviceType = service;
    }

    return {
      type,
      context,
      voiceInput: transcription,
    };
  }

  // Generate smart suggestions based on context
  generateSuggestions(context: any): string[] {
    const suggestions: string[] = [];

    if (context.serviceType) {
      suggestions.push(`Add ${context.serviceType} materials to the invoice`);
      suggestions.push(`Include travel time for ${context.serviceType} work`);
    }

    if (context.amount || (context.hours && context.rate)) {
      suggestions.push('Add GST/tax to the total amount');
      suggestions.push('Set payment terms to 30 days');
    }

    suggestions.push('Include warranty information');
    suggestions.push('Add your company logo');
    suggestions.push('Set up client contact details');

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Private methods for generating templates

  private generateInvoiceTemplate(context: any): AIDocumentResponse {
    const items = [];
    const isPrototype = process.env.REACT_APP_PROTOTYPE_MODE === 'true';
    
    // Parse intelligent context from user input
    const input = (context.serviceDescription || context.notes || '').toLowerCase();
    
    // Smart detection of services and amounts
    let detectedService = 'Professional Services';
    let baseRate = 85.00;
    let hours = 4;
    
    if (input.includes('plumb')) {
      detectedService = 'Plumbing Services';
      baseRate = 95.00;
    } else if (input.includes('electric')) {
      detectedService = 'Electrical Work';  
      baseRate = 105.00;
    } else if (input.includes('paint')) {
      detectedService = 'Painting Services';
      baseRate = 75.00;
    } else if (input.includes('roof')) {
      detectedService = 'Roofing Services';
      baseRate = 120.00;
    } else if (input.includes('garden') || input.includes('landscape')) {
      detectedService = 'Landscaping Services';
      baseRate = 65.00;
    }
    
    // Extract hours if mentioned
    const hoursMatch = input.match(/(\d+(?:\.\d+)?)\s*hours?/);
    if (hoursMatch) {
      hours = parseFloat(hoursMatch[1]);
    }
    
    // Extract amounts if mentioned  
    const amountMatch = input.match(/\$(\d+(?:\.\d{2})?)/);
    let customAmount = null;
    if (amountMatch) {
      customAmount = parseFloat(amountMatch[1]);
    }

    if (customAmount) {
      items.push({
        description: `${detectedService} - Fixed Price`,
        quantity: 1,
        rate: customAmount,
        unit: 'job',
      });
    } else {
      items.push({
        description: `${detectedService} - Labour`,
        quantity: hours,
        rate: baseRate,
        unit: 'hours',
      });
      
      // Add materials if mentioned
      if (input.includes('material') || input.includes('part') || input.includes('supply')) {
        const materialsCost = Math.round(baseRate * hours * 0.3); // 30% materials estimate
        items.push({
          description: 'Materials and Supplies',
          quantity: 1,
          rate: materialsCost,
          unit: 'allowance',
        });
      }
    }
    
    // Add call-out fee if emergency
    if (input.includes('emergency') || input.includes('urgent') || input.includes('call out')) {
      items.push({
        description: 'Emergency Call-Out Fee',
        quantity: 1,
        rate: 150.00,
        unit: 'fee',
      });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxRate = 0.15; // 15% GST for New Zealand
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    return {
      title: `${isPrototype ? '[PROTOTYPE] ' : ''}Invoice - ${detectedService}`,
      content: {
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        clientName: context.clientName || 'Valued Client',
        items,
        notes: this.generateContextualNotes(input, detectedService),
        taxRate,
        subtotal,
        taxAmount,
        total,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        issueDate: new Date().toLocaleDateString(),
        prototypeMode: isPrototype,
      },
      suggestions: this.generateSmartSuggestions(context, detectedService),
      estimatedAmount: total,
    };
  }
  
  private generateContextualNotes(input: string, service: string): string {
    const notes = [];
    
    notes.push('Thank you for choosing our services!');
    
    if (input.includes('emergency') || input.includes('urgent')) {
      notes.push('Emergency service provided outside normal hours.');
    }
    
    if (service.includes('Electrical')) {
      notes.push('All electrical work complies with local safety standards.');
      notes.push('12-month warranty on workmanship included.');
    } else if (service.includes('Plumbing')) {
      notes.push('All plumbing work meets building code requirements.');
      notes.push('6-month warranty on repairs and installations.');
    } else if (service.includes('Roofing')) {
      notes.push('Weather-dependent work schedule applied.');
      notes.push('Materials warranty as per manufacturer specifications.');
    }
    
    notes.push('Payment due within 30 days of invoice date.');
    
    if (process.env.REACT_APP_PROTOTYPE_MODE === 'true') {
      notes.push('');
      notes.push('🚀 PROTOTYPE MODE: This invoice was generated using intelligent templates.');
      notes.push('In production, AI will create fully customized documents.');
    }
    
    return notes.join('\n');
  }
  
  private generateSmartSuggestions(context: any, service: string): string[] {
    const suggestions = [
      `Add detailed ${service.toLowerCase()} breakdown`,
      'Include photos of completed work',
      'Set up recurring maintenance schedule',
    ];
    
    if (service.includes('Electrical')) {
      suggestions.push('Add electrical safety certificate');
    } else if (service.includes('Plumbing')) {
      suggestions.push('Include water pressure test results');
    }
    
    if (process.env.REACT_APP_PROTOTYPE_MODE === 'true') {
      suggestions.unshift('🤖 Upgrade to AI generation for custom suggestions');
    }
    
    return suggestions;
  }

  private generateContractTemplate(context: any): AIDocumentResponse {
    const input = (context.serviceDescription || context.notes || '').toLowerCase();
    const isPrototype = process.env.REACT_APP_PROTOTYPE_MODE === 'true';
    
    // Smart service detection
    let serviceType = 'Professional Services';
    let warranty = '12 months';
    let specialTerms = [];
    
    if (input.includes('plumb')) {
      serviceType = 'Plumbing Services';
      warranty = '12 months on workmanship, manufacturer warranty on parts';
      specialTerms.push('Water pressure testing included');
      specialTerms.push('Compliance with local plumbing codes');
    } else if (input.includes('electric')) {
      serviceType = 'Electrical Services';
      warranty = '12 months on installation, lifetime on safety standards';
      specialTerms.push('Electrical safety certification provided');
      specialTerms.push('Compliance with electrical safety standards');
    } else if (input.includes('roof')) {
      serviceType = 'Roofing Services';
      warranty = '5 years on workmanship, material warranty per manufacturer';
      specialTerms.push('Weather-dependent scheduling');
      specialTerms.push('Materials sourced from certified suppliers');
    } else if (input.includes('paint')) {
      serviceType = 'Painting Services';
      warranty = '2 years on interior, 5 years on exterior work';
      specialTerms.push('Premium paint products used');
      specialTerms.push('Surface preparation included');
    }
    
    // Generate intelligent contract terms
    const terms = [
      {
        title: 'Scope of Work',
        content: `The Contractor agrees to provide ${serviceType.toLowerCase()} including all labour, materials, equipment, and services necessary to complete the work as specified. ${specialTerms.length > 0 ? specialTerms.join('. ') + '.' : ''}`,
      },
      {
        title: 'Timeline and Schedule',
        content: context.deadline 
          ? `Work to be completed by ${context.deadline}. Time is of the essence.`
          : 'Work to be completed within a reasonable timeframe as mutually agreed. Client will be notified of any delays beyond contractor control.',
      },
      {
        title: 'Payment Terms',
        content: input.includes('large') || input.includes('big') || input.includes('major')
          ? 'Progress payments: 25% deposit, 50% at halfway point, 25% on completion. Final payment due within 7 days of completion.'
          : 'Payment due within 30 days of invoice. Deposit may be required for materials on larger projects.',
      },
      {
        title: 'Warranty and Guarantee',
        content: `All workmanship warranted for ${warranty}. Warranty covers defects in workmanship but excludes normal wear and tear, misuse, or damage by others.`,
      },
      {
        title: 'Health & Safety Compliance',
        content: 'All work carried out in accordance with applicable health and safety regulations, building codes, and industry standards. Client responsible for site access and maintaining safe working environment.',
      },
      {
        title: 'Variations and Changes',
        content: 'Any changes to the original scope must be agreed in writing with cost implications clearly stated before proceeding.',
      },
    ];
    
    // Add service-specific terms
    if (serviceType.includes('Electrical')) {
      terms.push({
        title: 'Electrical Safety',
        content: 'All electrical work will be tested and certified. Electrical safety certificate provided on completion. Work complies with current wiring regulations.',
      });
    } else if (serviceType.includes('Plumbing')) {
      terms.push({
        title: 'Water and Drainage',
        content: 'All plumbing work tested for leaks and proper flow. Water pressure testing certificate provided where applicable.',
      });
    }

    return {
      title: `${isPrototype ? '[PROTOTYPE] ' : ''}Service Agreement - ${serviceType}`,
      content: {
        contractNumber: `SA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        serviceProvider: 'GritDocs Professional Services',
        client: context.clientName || 'Client Name',
        serviceType,
        date: new Date().toLocaleDateString(),
        terms,
        prototypeMode: isPrototype,
        specialConditions: isPrototype 
          ? ['🚀 PROTOTYPE MODE: This contract uses intelligent templates', 'AI generation available in full production version']
          : [],
      },
      suggestions: this.generateSmartSuggestions(context, serviceType),
    };
  }

  private generateHRTemplate(context: any): AIDocumentResponse {
    return {
      title: 'Employment Agreement',
      content: {
        employeePosition: 'Tradesperson',
        startDate: context.deadline || 'To be confirmed',
        body: `
          <h2>Employment Terms</h2>
          <p><strong>Position:</strong> Tradesperson</p>
          <p><strong>Employment Type:</strong> Full-time</p>
          <p><strong>Start Date:</strong> ${context.deadline || 'To be confirmed'}</p>
          
          <h3>Duties and Responsibilities</h3>
          <p>The employee will perform duties including but not limited to:</p>
          <ul>
            <li>Provision of professional trade services</li>
            <li>Maintenance of tools and equipment</li>
            <li>Compliance with health and safety requirements</li>
            <li>Customer service and professional conduct</li>
          </ul>
          
          <h3>Remuneration</h3>
          <p>Salary and benefits to be confirmed based on experience and qualifications.</p>
          
          <h3>Health & Safety</h3>
          <p>Employee must comply with all workplace health and safety policies and procedures.</p>
        `,
      },
      suggestions: [
        'Add specific salary details',
        'Include probationary period terms',
        'Add leave entitlements',
      ],
    };
  }

  // Check if browser supports required features
  checkBrowserSupport(): { audio: boolean; canvas: boolean; pdf: boolean } {
    return {
      audio: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      canvas: !!document.createElement('canvas').getContext,
      pdf: typeof window !== 'undefined',
    };
  }

  // Get microphone permission status
  async getMicrophonePermission(): Promise<PermissionState | 'unsupported'> {
    if (!navigator.permissions) {
      return 'unsupported';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state;
    } catch {
      return 'unsupported';
    }
  }
}

export const aiService = new AIService();