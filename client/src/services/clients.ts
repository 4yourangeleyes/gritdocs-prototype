import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/supabase';

export type Client = Tables<'clients'>;

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  businessNumber?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

class ClientService {
  // Get all clients for current user
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return data || [];
  }

  // Get client by ID
  async getClient(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return null;
    }

    return data;
  }

  // Create new client
  async createClient(clientData: CreateClientData): Promise<Client> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address_street: clientData.addressStreet,
        address_city: clientData.addressCity,
        address_postal_code: clientData.addressPostalCode,
        address_country: clientData.addressCountry || 'New Zealand',
        business_number: clientData.businessNumber,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    return data;
  }

  // Update client
  async updateClient(clientData: UpdateClientData): Promise<Client> {
    const { id, ...updateData } = clientData;

    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        address_street: updateData.addressStreet,
        address_city: updateData.addressCity,
        address_postal_code: updateData.addressPostalCode,
        address_country: updateData.addressCountry,
        business_number: updateData.businessNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }

    return data;
  }

  // Delete client
  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }

    return true;
  }

  // Search clients by name or email
  async searchClients(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching clients:', error);
      throw error;
    }

    return data || [];
  }

  // Get client statistics
  async getClientStats(clientId: string) {
    // Get total documents for client
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, type, status, total_amount')
      .eq('client_id', clientId);

    if (docsError) {
      console.error('Error fetching client documents:', docsError);
      throw docsError;
    }

    const totalDocuments = documents?.length || 0;
    const totalInvoices = documents?.filter(doc => doc.type === 'invoice').length || 0;
    const totalContracts = documents?.filter(doc => doc.type === 'contract').length || 0;
    const totalAmount = documents?.reduce((sum, doc) => sum + (doc.total_amount || 0), 0) || 0;
    const paidAmount = documents?.filter(doc => doc.status === 'paid')
      .reduce((sum, doc) => sum + (doc.total_amount || 0), 0) || 0;
    const outstandingAmount = totalAmount - paidAmount;

    return {
      totalDocuments,
      totalInvoices,
      totalContracts,
      totalAmount,
      paidAmount,
      outstandingAmount,
    };
  }

  // Get recent clients
  async getRecentClients(limit: number = 5): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent clients:', error);
      throw error;
    }

    return data || [];
  }

  // Import clients from CSV
  async importClients(csvData: CreateClientData[]): Promise<Client[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const clientsToInsert = csvData.map(client => ({
      user_id: user.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address_street: client.addressStreet,
      address_city: client.addressCity,
      address_postal_code: client.addressPostalCode,
      address_country: client.addressCountry || 'New Zealand',
      business_number: client.businessNumber,
    }));

    const { data, error } = await supabase
      .from('clients')
      .insert(clientsToInsert)
      .select();

    if (error) {
      console.error('Error importing clients:', error);
      throw error;
    }

    return data || [];
  }
}

export const clientService = new ClientService();