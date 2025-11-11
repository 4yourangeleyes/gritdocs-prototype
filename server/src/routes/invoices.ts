import express from 'express';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { authenticate } from '../middleware/auth';
import { 
  CreateInvoiceRequest, 
  JWTPayload, 
  ComplianceBlockType, 
  Jurisdiction, 
  Currency,
  InvoiceStatus 
} from '../types';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: JWTPayload;
}

// Validation schemas
const createInvoiceSchema = Joi.object({
  clientId: Joi.string().uuid().required(),
  issueDate: Joi.string().isoDate().required(),
  dueDate: Joi.string().isoDate().required(),
  currency: Joi.string().valid('EUR', 'ZAR').required(),
  lineItems: Joi.array().items(
    Joi.object({
      description: Joi.string().min(1).max(500).required(),
      quantity: Joi.number().min(0.001).max(999999).required(),
      unitPrice: Joi.number().min(0).max(999999.99).required(),
      taxRate: Joi.number().min(0).max(100).optional(),
    })
  ).min(1).required(),
  notes: Joi.string().max(2000).optional().allow(''),
});

// Generate atomic invoice number with concurrency safety
async function generateInvoiceNumber(): Promise<string> {
  return await db.transaction(async (trx) => {
    const currentYear = new Date().getFullYear();
    
    // Lock and get the sequence for this year
    const sequence = await trx('invoice_number_sequence')
      .where({ year: currentYear })
      .forUpdate()
      .first();
    
    if (!sequence) {
      // Create sequence for new year
      await trx('invoice_number_sequence').insert({
        year: currentYear,
        current_number: 1,
      });
      
      return `RX-${currentYear}-00001`;
    }
    
    // Increment the sequence atomically
    const nextNumber = sequence.current_number + 1;
    await trx('invoice_number_sequence')
      .where({ year: currentYear })
      .update({ current_number: nextNumber });
    
    // Format with leading zeros
    const paddedNumber = nextNumber.toString().padStart(5, '0');
    return `RX-${currentYear}-${paddedNumber}`;
  });
}

// Generate compliance blocks based on jurisdiction
function generateComplianceBlocks(jurisdiction: Jurisdiction, isVatRegistered: boolean) {
  const blocks = [];
  
  if (jurisdiction === Jurisdiction.FRANCE && !isVatRegistered) {
    blocks.push({
      id: uuidv4(),
      type: ComplianceBlockType.VAT_EXEMPTION,
      content: 'TVA non applicable, art. 293 B du CGI.',
      is_removable: false,
      jurisdiction: Jurisdiction.FRANCE,
    });
  }
  
  // Add more compliance rules as needed
  
  return blocks;
}

// Create invoice
router.post('/', authenticate, async (req: AuthRequest, res: any, next: any): Promise<void> => {
  try {
    const { error, value } = createInvoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const {
      clientId,
      issueDate,
      dueDate,
      currency,
      lineItems,
      notes,
    }: CreateInvoiceRequest = value;

    const userId = req.user!.userId;

    // Verify client belongs to user
    const client = await db('clients')
      .where({ id: clientId, user_id: userId })
      .first();

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Calculate totals
    const calculatedLineItems = lineItems.map((item) => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal = calculatedLineItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    const taxAmount = calculatedLineItems.reduce((sum, item) => {
      const taxRate = item.taxRate || 0;
      return sum + (item.totalPrice * taxRate / 100);
    }, 0);

    const totalAmount = subtotal + taxAmount;

    // Generate atomic invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Create invoice in transaction
    const result = await db.transaction(async (trx) => {
      // Create invoice
      const invoiceId = uuidv4();
      const [invoice] = await trx('invoices')
        .insert({
          id: invoiceId,
          user_id: userId,
          client_id: clientId,
          invoice_number: invoiceNumber,
          status: InvoiceStatus.DRAFT,
          issue_date: issueDate,
          due_date: dueDate,
          currency,
          subtotal: subtotal.toFixed(2),
          tax_amount: taxAmount.toFixed(2),
          total_amount: totalAmount.toFixed(2),
          notes: notes || null,
        })
        .returning('*');

      // Create line items
      const lineItemsData = calculatedLineItems.map((item) => ({
        id: uuidv4(),
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        tax_rate: item.taxRate || null,
      }));

      await trx('invoice_line_items').insert(lineItemsData);

      // Generate and insert compliance blocks
      const complianceBlocks = generateComplianceBlocks(
        req.user!.jurisdiction as Jurisdiction,
        false // TODO: Get from user profile
      );

      if (complianceBlocks.length > 0) {
        const complianceBlocksData = complianceBlocks.map((block) => ({
          ...block,
          invoice_id: invoiceId,
        }));
        
        await trx('compliance_blocks').insert(complianceBlocksData);
      }

      return {
        invoice,
        lineItems: lineItemsData,
        complianceBlocks: complianceBlocks,
      };
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.invoice.id,
        invoiceNumber: result.invoice.invoice_number,
        status: result.invoice.status,
        issueDate: result.invoice.issue_date,
        dueDate: result.invoice.due_date,
        currency: result.invoice.currency,
        subtotal: Number(result.invoice.subtotal),
        taxAmount: Number(result.invoice.tax_amount),
        totalAmount: Number(result.invoice.total_amount),
        notes: result.invoice.notes,
        lineItems: result.lineItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
          taxRate: item.tax_rate ? Number(item.tax_rate) : null,
        })),
        complianceBlocks: result.complianceBlocks,
        createdAt: result.invoice.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get invoices for user
router.get('/', authenticate, async (req: AuthRequest, res: any, next: any): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const offset = (page - 1) * limit;

    const userId = req.user!.userId;

    // Get total count
    const [{ count }] = await db('invoices')
      .where({ user_id: userId })
      .count('id as count');

    const totalCount = parseInt(count as string);

    // Get invoices with client data
    const invoices = await db('invoices')
      .select(
        'invoices.*',
        'clients.name as client_name',
        'clients.email as client_email'
      )
      .leftJoin('clients', 'invoices.client_id', 'clients.id')
      .where({ 'invoices.user_id': userId })
      .orderBy('invoices.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        invoices: invoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          status: invoice.status,
          issueDate: invoice.issue_date,
          dueDate: invoice.due_date,
          currency: invoice.currency,
          totalAmount: Number(invoice.total_amount),
          client: {
            name: invoice.client_name,
            email: invoice.client_email,
          },
          createdAt: invoice.created_at,
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore: offset + limit < totalCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get specific invoice
router.get('/:id', authenticate, async (req: AuthRequest, res: any, next: any): Promise<void> => {
  try {
    const invoiceId = req.params.id;
    const userId = req.user!.userId;

    // Get invoice with all related data
    const invoice = await db('invoices')
      .select('invoices.*', 'clients.name as client_name')
      .leftJoin('clients', 'invoices.client_id', 'clients.id')
      .where({ 'invoices.id': invoiceId, 'invoices.user_id': userId })
      .first();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found',
      });
    }

    // Get line items
    const lineItems = await db('invoice_line_items')
      .where({ invoice_id: invoiceId })
      .orderBy('created_at');

    // Get compliance blocks
    const complianceBlocks = await db('compliance_blocks')
      .where({ invoice_id: invoiceId })
      .orderBy('created_at');

    res.json({
      success: true,
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        currency: invoice.currency,
        subtotal: Number(invoice.subtotal),
        taxAmount: Number(invoice.tax_amount),
        totalAmount: Number(invoice.total_amount),
        notes: invoice.notes,
        client: {
          name: invoice.client_name,
        },
        lineItems: lineItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
          taxRate: item.tax_rate ? Number(item.tax_rate) : null,
        })),
        complianceBlocks: complianceBlocks.map((block) => ({
          id: block.id,
          type: block.type,
          content: block.content,
          isRemovable: block.is_removable,
          jurisdiction: block.jurisdiction,
        })),
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as invoiceRoutes };