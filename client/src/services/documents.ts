import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type Document = Tables<'documents'>;
export type DocumentType = 'invoice' | 'contract' | 'hr_document';
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface CreateDocumentData {
  clientId: string;
  type: DocumentType;
  title: string;
  content: any;
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  dueDate?: string;
}

export interface UpdateDocumentData extends Partial<CreateDocumentData> {
  id: string;
  status?: DocumentStatus;
}

export interface DocumentTemplate {
  type: DocumentType;
  name: string;
  content: any;
}

class DocumentService {
  // Get all documents for current user
  async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    return data || [];
  }

  // Get document by ID
  async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone,
          address_street,
          address_city,
          address_postal_code,
          address_country,
          business_number
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }

    return data;
  }

  // Create new document
  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate document number
    const documentNumber = await this.generateDocumentNumber(documentData.type);

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        client_id: documentData.clientId,
        type: documentData.type,
        document_number: documentNumber,
        title: documentData.title,
        content: documentData.content,
        subtotal: documentData.subtotal,
        tax_amount: documentData.taxAmount,
        total_amount: documentData.totalAmount,
        currency: documentData.currency || 'NZD',
        due_date: documentData.dueDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }

    return data;
  }

  // Update document
  async updateDocument(documentData: UpdateDocumentData): Promise<Document> {
    const { id, ...updateData } = documentData;

    const { data, error } = await supabase
      .from('documents')
      .update({
        client_id: updateData.clientId,
        type: updateData.type,
        status: updateData.status,
        title: updateData.title,
        content: updateData.content,
        subtotal: updateData.subtotal,
        tax_amount: updateData.taxAmount,
        total_amount: updateData.totalAmount,
        currency: updateData.currency,
        due_date: updateData.dueDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw error;
    }

    return data;
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }

    return true;
  }

  // Mark document as sent
  async sendDocument(id: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error sending document:', error);
      throw error;
    }

    return data;
  }

  // Generate document number
  private async generateDocumentNumber(type: DocumentType): Promise<string> {
    const prefix = type === 'invoice' ? 'INV' : type === 'contract' ? 'CON' : 'HR';
    const year = new Date().getFullYear();
    
    // Get the latest document number for this type and year
    const { data, error } = await supabase
      .from('documents')
      .select('document_number')
      .eq('type', type)
      .like('document_number', `${prefix}-${year}-%`)
      .order('document_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest document number:', error);
      // Fallback to basic numbering
      return `${prefix}-${year}-001`;
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].document_number.split('-').pop();
      nextNumber = parseInt(lastNumber || '0', 10) + 1;
    }

    return `${prefix}-${year}-${nextNumber.toString().padStart(3, '0')}`;
  }

  // Generate PDF from document
  async generatePDF(doc: Document): Promise<Blob> {
    // Create a temporary div for rendering
    const tempDiv = window.document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.padding = '20mm';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.fontFamily = 'Arial, sans-serif';

    // Render document content
    tempDiv.innerHTML = this.renderDocumentHTML(doc);
    window.document.body.appendChild(tempDiv);

    try {
      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } finally {
      // Clean up
      window.document.body.removeChild(tempDiv);
    }
  }

  // Render document as HTML for PDF generation
  private renderDocumentHTML(doc: Document): string {
    const content = doc.content;
    const client = (doc as any).clients;

    if (doc.type === 'invoice') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 800px;">
          <header style="margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 24px; margin: 0;">INVOICE</h1>
            <p style="margin: 5px 0; color: #666;">#${doc.document_number}</p>
          </header>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h3 style="margin: 0 0 10px 0;">Bill To:</h3>
              <p style="margin: 0; line-height: 1.5;">
                <strong>${client?.name}</strong><br>
                ${client?.address_street || ''}<br>
                ${client?.address_city || ''} ${client?.address_postal_code || ''}<br>
                ${client?.email || ''}
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0;"><strong>Invoice Date:</strong> ${new Date(doc.created_at).toLocaleDateString()}</p>
              ${doc.due_date ? `<p style="margin: 5px 0;"><strong>Due Date:</strong> ${new Date(doc.due_date).toLocaleDateString()}</p>` : ''}
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rate</th>
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${content.items?.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;">${item.description}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${item.rate.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">$${(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 30px;">
            <p style="margin: 5px 0;"><strong>Subtotal: $${doc.subtotal?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 5px 0;"><strong>Tax: $${doc.tax_amount?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 10px 0; font-size: 18px;"><strong>Total: $${doc.total_amount?.toFixed(2) || '0.00'}</strong></p>
          </div>

          ${content.notes ? `
            <div style="margin-top: 40px;">
              <h3>Notes:</h3>
              <p style="line-height: 1.5;">${content.notes}</p>
            </div>
          ` : ''}
        </div>
      `;
    } else if (doc.type === 'contract') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 800px; line-height: 1.6;">
          <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 24px; margin: 0;">CONTRACT</h1>
            <p style="margin: 5px 0; color: #666;">#${doc.document_number}</p>
          </header>

          <div style="margin-bottom: 30px;">
            <h3>Parties:</h3>
            <p><strong>Service Provider:</strong> ${content.serviceProvider || 'Your Company'}</p>
            <p><strong>Client:</strong> ${client?.name}</p>
            <p><strong>Date:</strong> ${new Date(doc.created_at).toLocaleDateString()}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h3>Scope of Work:</h3>
            <p>${content.scopeOfWork || doc.title}</p>
          </div>

          ${content.terms?.map((term: any, index: number) => `
            <div style="margin-bottom: 20px;">
              <h4>${index + 1}. ${term.title}</h4>
              <p>${term.content}</p>
            </div>
          `).join('') || ''}

          <div style="margin-top: 40px; display: flex; justify-content: space-between;">
            <div style="text-align: center;">
              <div style="border-top: 1px solid #000; width: 200px; margin-top: 60px; padding-top: 10px;">
                <p style="margin: 0;"><strong>Service Provider</strong></p>
                <p style="margin: 0; font-size: 12px;">Date: ___________</p>
              </div>
            </div>
            <div style="text-align: center;">
              <div style="border-top: 1px solid #000; width: 200px; margin-top: 60px; padding-top: 10px;">
                <p style="margin: 0;"><strong>Client</strong></p>
                <p style="margin: 0; font-size: 12px;">Date: ___________</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Default HR document template
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; line-height: 1.6;">
        <header style="margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 24px; margin: 0;">${doc.title}</h1>
          <p style="margin: 5px 0; color: #666;">#${doc.document_number}</p>
          <p style="margin: 5px 0;">Date: ${new Date(doc.created_at).toLocaleDateString()}</p>
        </header>

        <div style="margin-bottom: 30px;">
          <p><strong>Employee/Contractor:</strong> ${client?.name}</p>
          ${client?.email ? `<p><strong>Email:</strong> ${client.email}</p>` : ''}
        </div>

        <div>${content.body || 'Document content goes here.'}</div>
      </div>
    `;
  }

  // Get documents by status
  async getDocumentsByStatus(status: DocumentStatus): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        clients (
          id,
          name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents by status:', error);
      throw error;
    }

    return data || [];
  }

  // Get document statistics
  async getDocumentStats() {
    const { data, error } = await supabase
      .from('documents')
      .select('id, type, status, total_amount');

    if (error) {
      console.error('Error fetching document stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      invoices: data?.filter(d => d.type === 'invoice').length || 0,
      contracts: data?.filter(d => d.type === 'contract').length || 0,
      hrDocuments: data?.filter(d => d.type === 'hr_document').length || 0,
      draft: data?.filter(d => d.status === 'draft').length || 0,
      sent: data?.filter(d => d.status === 'sent').length || 0,
      paid: data?.filter(d => d.status === 'paid').length || 0,
      overdue: data?.filter(d => d.status === 'overdue').length || 0,
      totalAmount: data?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0,
      paidAmount: data?.filter(d => d.status === 'paid')
        .reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0,
    };

    return stats;
  }
}

export const documentService = new DocumentService();