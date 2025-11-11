import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('jurisdiction', ['FR', 'SA']).notNullable();
    table.boolean('is_vat_registered').defaultTo(false);
    table.enum('subscription_tier', ['free', 'premium']).defaultTo('free');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['jurisdiction']);
  });

  // Create clients table
  await knex.schema.createTable('clients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('email');
    table.string('phone');
    table.string('address_street');
    table.string('address_city');
    table.string('address_postal_code');
    table.string('address_country');
    table.string('address_state');
    table.string('tax_id');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['email']);
  });

  // Create invoice_number_sequence table for atomic numbering
  await knex.schema.createTable('invoice_number_sequence', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('year').notNullable();
    table.integer('current_number').defaultTo(0);
    table.timestamps(true, true);
    
    // Unique constraint on year to prevent duplicates
    table.unique(['year']);
    table.index(['year']);
  });

  // Create invoices table
  await knex.schema.createTable('invoices', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('client_id').notNullable().references('id').inTable('clients').onDelete('RESTRICT');
    table.string('invoice_number').unique().notNullable();
    table.enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']).defaultTo('draft');
    table.date('issue_date').notNullable();
    table.date('due_date').notNullable();
    table.enum('currency', ['EUR', 'ZAR']).notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.text('notes');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['client_id']);
    table.index(['invoice_number']);
    table.index(['status']);
    table.index(['issue_date']);
  });

  // Create invoice_line_items table
  await knex.schema.createTable('invoice_line_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').notNullable().references('id').inTable('invoices').onDelete('CASCADE');
    table.text('description').notNullable();
    table.decimal('quantity', 10, 3).notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.decimal('tax_rate', 5, 2);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['invoice_id']);
  });

  // Create compliance_blocks table
  await knex.schema.createTable('compliance_blocks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').notNullable().references('id').inTable('invoices').onDelete('CASCADE');
    table.enum('type', ['vat_exemption', 'disclaimer', 'terms', 'footer']).notNullable();
    table.text('content').notNullable();
    table.boolean('is_removable').defaultTo(true);
    table.enum('jurisdiction', ['FR', 'SA']).notNullable();
    table.timestamps(true, true);
    
    // Indexes
    table.index(['invoice_id']);
    table.index(['type']);
    table.index(['jurisdiction']);
  });

  // Initialize invoice number sequence for current year
  const currentYear = new Date().getFullYear();
  await knex('invoice_number_sequence').insert({
    year: currentYear,
    current_number: 0,
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('compliance_blocks');
  await knex.schema.dropTableIfExists('invoice_line_items');
  await knex.schema.dropTableIfExists('invoices');
  await knex.schema.dropTableIfExists('invoice_number_sequence');
  await knex.schema.dropTableIfExists('clients');
  await knex.schema.dropTableIfExists('users');
}