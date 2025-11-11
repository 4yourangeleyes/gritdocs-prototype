import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Database Types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          company_name?: string;
          registration_number?: string;
          jurisdiction: string;
          logo_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          company_name?: string;
          registration_number?: string;
          jurisdiction?: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          company_name?: string;
          registration_number?: string;
          jurisdiction?: string;
          logo_url?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email?: string;
          phone?: string;
          address_street?: string;
          address_city?: string;
          address_postal_code?: string;
          address_country?: string;
          business_number?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string;
          phone?: string;
          address_street?: string;
          address_city?: string;
          address_postal_code?: string;
          address_country?: string;
          business_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          address_street?: string;
          address_city?: string;
          address_postal_code?: string;
          address_country?: string;
          business_number?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          type: 'invoice' | 'contract' | 'hr_document';
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          document_number: string;
          title: string;
          content: any; // JSON content
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency: string;
          due_date?: string;
          sent_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          type: 'invoice' | 'contract' | 'hr_document';
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          document_number: string;
          title: string;
          content: any;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          due_date?: string;
          sent_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          type?: 'invoice' | 'contract' | 'hr_document';
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          document_number?: string;
          title?: string;
          content?: any;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          currency?: string;
          due_date?: string;
          sent_at?: string;
          updated_at?: string;
        };
      };
      template_blocks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description?: string;
          category: 'invoice_items' | 'contract_clauses';
          content: any; // JSON content
          average_amount?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          category: 'invoice_items' | 'contract_clauses';
          content: any;
          average_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          category?: 'invoice_items' | 'contract_clauses';
          content?: any;
          average_amount?: number;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];