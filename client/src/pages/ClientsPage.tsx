import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const mockClients = [
    {
      id: '1',
      name: 'JONES CONSTRUCTION',
      email: 'mike@jonesconstruction.com',
      phone: '(555) 987-6543',
      totalInvoiced: 15750,
      invoiceCount: 8,
      lastInvoice: '2025-11-05',
    },
    {
      id: '2',
      name: 'BROWN ELECTRIC CO',
      email: 'sarah@brownelectric.com',
      phone: '(555) 456-7890',
      totalInvoiced: 8900,
      invoiceCount: 5,
      lastInvoice: '2025-10-28',
    },
    {
      id: '3',
      name: 'DAVIS ROOFING',
      email: 'tom@davisroofing.com',
      phone: '(555) 321-0987',
      totalInvoiced: 22400,
      invoiceCount: 12,
      lastInvoice: '2025-11-08',
    },
  ];

  const mockInvoices = [
    { id: 'INV-008', date: '2025-11-05', amount: 2950, status: 'PAID' },
    { id: 'INV-006', date: '2025-10-15', amount: 1800, status: 'PAID' },
    { id: 'INV-004', date: '2025-09-22', amount: 3200, status: 'OVERDUE' },
    { id: 'INV-002', date: '2025-08-30', amount: 1500, status: 'PAID' },
  ];

  if (selectedClient) {
    const client = mockClients.find(c => c.id === selectedClient);
    
    return (
      <div className="screen-dashboard">
        <div className="container py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedClient(null)}
              className="btn-secondary py-2 px-4"
            >
              ← BACK
            </button>
            <div>
              <h1 className="heading-lg">{client?.name}</h1>
              <p className="body-base text-grit-600">{client?.email}</p>
            </div>
          </div>

          {/* Client Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-500 mb-2">
                {client?.invoiceCount}
              </div>
              <div className="body-base text-grit-600 uppercase tracking-wide">
                INVOICES
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-grit-900 mb-2">
                ${client?.totalInvoiced.toLocaleString()}
              </div>
              <div className="body-base text-grit-600 uppercase tracking-wide">
                TOTAL
              </div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-success-600 mb-2">
                {client?.lastInvoice}
              </div>
              <div className="body-base text-grit-600 uppercase tracking-wide">
                LAST JOB
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="heading-md">INVOICES</h2>
              <Link to="/chat" className="btn-action py-2 px-4">
                + NEW INVOICE
              </Link>
            </div>
            
            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/canvas/${invoice.id}`}
                  className="card-interactive block"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="heading-sm">{invoice.id}</h3>
                      <p className="body-base text-grit-600">{invoice.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-grit-900">
                        ${invoice.amount.toLocaleString()}
                      </div>
                      <div className={`text-sm font-bold uppercase tracking-wide ${
                        invoice.status === 'PAID' ? 'text-success-600' :
                        invoice.status === 'OVERDUE' ? 'text-error-600' :
                        'text-warning-600'
                      }`}>
                        {invoice.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-dashboard">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-xl">MY CLIENTS</h1>
            <p className="body-base text-grit-600">Manage your business relationships</p>
          </div>
          <Link to="/chat" className="btn-action">
            + ADD CLIENT
          </Link>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {mockClients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client.id)}
              className="card-interactive w-full text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="heading-lg mb-2">{client.name}</h3>
                  <div className="space-y-1">
                    <p className="body-base text-grit-600">{client.email}</p>
                    <p className="body-base text-grit-600">{client.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-grit-900 mb-1">
                    ${client.totalInvoiced.toLocaleString()}
                  </div>
                  <div className="body-base text-grit-600">
                    {client.invoiceCount} INVOICES
                  </div>
                  <div className="text-sm text-grit-500 mt-1">
                    LAST: {client.lastInvoice}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {mockClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="heading-lg mb-2">NO CLIENTS YET</h3>
            <p className="body-base text-grit-600 mb-6">
              Add your first client to get started
            </p>
            <Link to="/chat" className="btn-primary">
              ADD FIRST CLIENT
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}