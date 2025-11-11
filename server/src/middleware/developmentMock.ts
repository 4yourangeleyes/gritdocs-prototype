import { Request, Response, NextFunction } from 'express';

// Mock data for UI/UX development when database is not available
const mockUser = {
  id: 'mock-user-id',
  email: 'demo@invoisity.com',
  firstName: 'Demo',
  lastName: 'User',
  jurisdiction: 'FR',
  isVatRegistered: false,
  subscriptionTier: 'free',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockInvoices = [
  {
    id: 'mock-invoice-1',
    invoiceNumber: 'INV-001',
    status: 'draft',
    issueDate: '2025-11-01',
    dueDate: '2025-12-01',
    currency: 'EUR',
    subtotal: 1000,
    taxAmount: 200,
    totalAmount: 1200,
    client: {
      name: 'Sample Client',
      email: 'client@example.com'
    },
    lineItems: [
      {
        id: 'item-1',
        description: 'Web Development Services',
        quantity: 10,
        unitPrice: 100,
        totalPrice: 1000,
        taxRate: 20
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const mockClients = [
  {
    id: 'mock-client-1',
    name: 'Sample Client',
    email: 'client@example.com',
    phone: '+33 1 23 45 67 89',
    address: {
      street: '123 Business Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const developmentMockMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only apply mocks in development and when database connection failed
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  // Mock auth endpoints
  if (req.path === '/api/auth/login' && req.method === 'POST') {
    return res.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  }

  if (req.path === '/api/auth/register' && req.method === 'POST') {
    return res.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  }

  if (req.path === '/api/auth/me' && req.method === 'GET') {
    return res.json({
      success: true,
      data: mockUser
    });
  }

  // Mock invoice endpoints
  if (req.path === '/api/invoices' && req.method === 'GET') {
    return res.json({
      success: true,
      data: mockInvoices
    });
  }

  if (req.path === '/api/invoices' && req.method === 'POST') {
    const newInvoice = {
      ...mockInvoices[0],
      id: 'mock-invoice-' + Date.now(),
      invoiceNumber: 'INV-' + String(Date.now()).slice(-3),
      ...req.body
    };
    return res.json({
      success: true,
      data: newInvoice
    });
  }

  // Mock client endpoints
  if (req.path === '/api/clients' && req.method === 'GET') {
    return res.json({
      success: true,
      data: mockClients
    });
  }

  if (req.path === '/api/clients' && req.method === 'POST') {
    const newClient = {
      ...mockClients[0],
      id: 'mock-client-' + Date.now(),
      ...req.body
    };
    return res.json({
      success: true,
      data: newClient
    });
  }

  // Mock AI endpoints
  if (req.path === '/api/ai/generate-compliance' && req.method === 'POST') {
    return res.json({
      success: true,
      data: {
        complianceBlocks: [
          {
            id: 'mock-compliance-1',
            type: 'vat_exemption',
            content: 'TVA non applicable, art. 293 B du CGI',
            isRemovable: false,
            jurisdiction: 'FR'
          }
        ]
      }
    });
  }

  // Continue to next middleware if no mock matches
  next();
};