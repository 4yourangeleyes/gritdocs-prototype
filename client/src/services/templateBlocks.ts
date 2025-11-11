import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/supabase';

export type TemplateBlock = Tables<'template_blocks'>;
export type TemplateCategory = 'invoice_items' | 'contract_clauses';

export interface CreateTemplateBlockData {
  name: string;
  description?: string;
  category: TemplateCategory;
  content: any;
  averageAmount?: number;
}

export interface UpdateTemplateBlockData extends Partial<CreateTemplateBlockData> {
  id: string;
}

class TemplateBlockService {
  // Get all template blocks for current user
  async getTemplateBlocks(): Promise<TemplateBlock[]> {
    const { data, error } = await supabase
      .from('template_blocks')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching template blocks:', error);
      throw error;
    }

    return data || [];
  }

  // Get template blocks by category
  async getTemplateBlocksByCategory(category: TemplateCategory): Promise<TemplateBlock[]> {
    const { data, error } = await supabase
      .from('template_blocks')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching template blocks by category:', error);
      throw error;
    }

    return data || [];
  }

  // Get template block by ID
  async getTemplateBlock(id: string): Promise<TemplateBlock | null> {
    const { data, error } = await supabase
      .from('template_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template block:', error);
      return null;
    }

    return data;
  }

  // Create new template block
  async createTemplateBlock(blockData: CreateTemplateBlockData): Promise<TemplateBlock> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('template_blocks')
      .insert({
        user_id: user.id,
        name: blockData.name,
        description: blockData.description,
        category: blockData.category,
        content: blockData.content,
        average_amount: blockData.averageAmount,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template block:', error);
      throw error;
    }

    return data;
  }

  // Update template block
  async updateTemplateBlock(blockData: UpdateTemplateBlockData): Promise<TemplateBlock> {
    const { id, ...updateData } = blockData;

    const { data, error } = await supabase
      .from('template_blocks')
      .update({
        name: updateData.name,
        description: updateData.description,
        category: updateData.category,
        content: updateData.content,
        average_amount: updateData.averageAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template block:', error);
      throw error;
    }

    return data;
  }

  // Delete template block
  async deleteTemplateBlock(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('template_blocks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template block:', error);
      throw error;
    }

    return true;
  }

  // Duplicate template block
  async duplicateTemplateBlock(id: string): Promise<TemplateBlock> {
    const originalBlock = await this.getTemplateBlock(id);
    
    if (!originalBlock) {
      throw new Error('Template block not found');
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('template_blocks')
      .insert({
        user_id: user.id,
        name: `${originalBlock.name} (Copy)`,
        description: originalBlock.description,
        category: originalBlock.category,
        content: originalBlock.content,
        average_amount: originalBlock.average_amount,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating template block:', error);
      throw error;
    }

    return data;
  }

  // Create default template blocks for new users
  async createDefaultTemplateBlocks(): Promise<TemplateBlock[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const defaultBlocks = [
      // Invoice Items
      {
        user_id: user.id,
        name: 'Standard Labour',
        description: 'General labour charges',
        category: 'invoice_items' as TemplateCategory,
        content: {
          description: 'Labour',
          unit: 'hours',
          rate: 75.00,
        },
        average_amount: 75.00,
      },
      {
        user_id: user.id,
        name: 'Emergency Call-out',
        description: 'After-hours emergency service',
        category: 'invoice_items' as TemplateCategory,
        content: {
          description: 'Emergency Call-out',
          unit: 'each',
          rate: 150.00,
        },
        average_amount: 150.00,
      },
      {
        user_id: user.id,
        name: 'Materials',
        description: 'Materials and supplies',
        category: 'invoice_items' as TemplateCategory,
        content: {
          description: 'Materials',
          unit: 'each',
          rate: 0.00,
        },
        average_amount: 0.00,
      },
      {
        user_id: user.id,
        name: 'Travel/Mileage',
        description: 'Travel time and mileage',
        category: 'invoice_items' as TemplateCategory,
        content: {
          description: 'Travel/Mileage',
          unit: 'km',
          rate: 0.79,
        },
        average_amount: 15.80,
      },
      // Contract Clauses
      {
        user_id: user.id,
        name: 'Payment Terms',
        description: 'Standard payment terms clause',
        category: 'contract_clauses' as TemplateCategory,
        content: {
          title: 'Payment Terms',
          text: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges at a rate of 1.5% per month.',
        },
      },
      {
        user_id: user.id,
        name: 'Liability Clause',
        description: 'Standard liability limitation',
        category: 'contract_clauses' as TemplateCategory,
        content: {
          title: 'Limitation of Liability',
          text: 'Our liability is limited to the value of services provided. Client is responsible for site safety, access, and providing accurate information.',
        },
      },
      {
        user_id: user.id,
        name: 'Warranty',
        description: 'Standard warranty terms',
        category: 'contract_clauses' as TemplateCategory,
        content: {
          title: 'Warranty',
          text: 'We warrant our workmanship for a period of 12 months from completion date. Materials are covered by manufacturer warranty.',
        },
      },
      {
        user_id: user.id,
        name: 'Scope Changes',
        description: 'Handling scope changes',
        category: 'contract_clauses' as TemplateCategory,
        content: {
          title: 'Variations and Changes',
          text: 'Any changes to the original scope of work must be agreed in writing and may result in additional charges.',
        },
      },
      {
        user_id: user.id,
        name: 'Force Majeure',
        description: 'Force majeure clause',
        category: 'contract_clauses' as TemplateCategory,
        content: {
          title: 'Force Majeure',
          text: 'Neither party shall be liable for delays caused by circumstances beyond their reasonable control, including weather, natural disasters, or government restrictions.',
        },
      },
    ];

    const { data, error } = await supabase
      .from('template_blocks')
      .insert(defaultBlocks)
      .select();

    if (error) {
      console.error('Error creating default template blocks:', error);
      throw error;
    }

    return data || [];
  }

  // Search template blocks
  async searchTemplateBlocks(query: string, category?: TemplateCategory): Promise<TemplateBlock[]> {
    let queryBuilder = supabase
      .from('template_blocks')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder
      .order('name', { ascending: true });

    if (error) {
      console.error('Error searching template blocks:', error);
      throw error;
    }

    return data || [];
  }

  // Get frequently used template blocks
  async getFrequentlyUsedBlocks(category?: TemplateCategory, limit: number = 10): Promise<TemplateBlock[]> {
    // This would ideally track usage, but for now we'll return by most recent
    let queryBuilder = supabase
      .from('template_blocks')
      .select('*');

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data, error } = await queryBuilder
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching frequently used blocks:', error);
      throw error;
    }

    return data || [];
  }

  // Export template blocks to JSON
  async exportTemplateBlocks(): Promise<string> {
    const blocks = await this.getTemplateBlocks();
    
    // Remove user-specific fields for export
    const exportData = blocks.map(block => ({
      name: block.name,
      description: block.description,
      category: block.category,
      content: block.content,
      average_amount: block.average_amount,
    }));

    return JSON.stringify(exportData, null, 2);
  }

  // Import template blocks from JSON
  async importTemplateBlocks(jsonData: string): Promise<TemplateBlock[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const importData = JSON.parse(jsonData);
      
      const blocksToInsert = importData.map((block: any) => ({
        user_id: user.id,
        name: block.name,
        description: block.description,
        category: block.category,
        content: block.content,
        average_amount: block.average_amount,
      }));

      const { data, error } = await supabase
        .from('template_blocks')
        .insert(blocksToInsert)
        .select();

      if (error) {
        console.error('Error importing template blocks:', error);
        throw error;
      }

      return data || [];
    } catch (err) {
      console.error('Error parsing JSON:', err);
      throw new Error('Invalid JSON format');
    }
  }
}

export const templateBlockService = new TemplateBlockService();