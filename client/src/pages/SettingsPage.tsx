import React, { useState } from 'react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const tabs = [
    { id: 'profile', name: 'PROFILE', icon: '👤' },
    { id: 'business', name: 'BUSINESS', icon: '🏢' },
    { id: 'templates', name: 'TEMPLATES', icon: '📋' },
    { id: 'clients', name: 'CLIENTS', icon: '👥' },
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.includes('svg')) {
      setLogoFile(file);
    }
  };

  return (
    <div className="screen-settings">
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="heading-xl">SETTINGS</h1>
          <p className="body-base text-grit-600">Configure your business details</p>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-grit-200">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 font-bold uppercase tracking-wide border-b-4 transition-all ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-500 bg-orange-50'
                    : 'border-transparent text-grit-600 hover:text-grit-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue="JOHN SMITH"
                  placeholder="YOUR FULL NAME"
                />
              </div>
              <div>
                <label className="input-label">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  defaultValue="john@smithplumbing.com"
                  placeholder="YOUR@BUSINESS.COM"
                />
              </div>
              <button className="btn-primary">SAVE CHANGES</button>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <label className="input-label">Company Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue="SMITH PLUMBING"
                  placeholder="YOUR BUSINESS NAME"
                />
              </div>
              <div>
                <label className="input-label">Registration Number (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="BUSINESS REGISTRATION #"
                />
              </div>
              <div>
                <label className="input-label">Jurisdiction</label>
                <select className="input-field">
                  <option>UNITED STATES</option>
                  <option>CANADA</option>
                  <option>UNITED KINGDOM</option>
                  <option>AUSTRALIA</option>
                </select>
              </div>
              
              {/* Logo Upload */}
              <div>
                <label className="input-label">Business Logo (SVG Only)</label>
                <div className="card space-y-4">
                  <div className="border-2 border-dashed border-grit-300 p-8 text-center">
                    {logoFile ? (
                      <div>
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-bold text-grit-900">{logoFile.name}</p>
                        <p className="body-base text-grit-600">SVG UPLOADED</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📎</div>
                        <p className="font-bold text-grit-900 mb-2">DRAG SVG HERE</p>
                        <p className="body-base text-grit-600">OR CLICK TO BROWSE</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".svg"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="btn-secondary cursor-pointer">
                    CHOOSE SVG FILE
                  </label>
                </div>
              </div>
              
              <button className="btn-primary">SAVE BUSINESS INFO</button>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="heading-md mb-4">TEMPLATE BLOCKS</h3>
                <p className="body-base text-grit-600 mb-6">
                  Create reusable blocks for common services or products
                </p>
                
                <div className="space-y-4">
                  {/* Example template blocks */}
                  <div className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="heading-sm">BATHROOM RENOVATION</h4>
                        <p className="body-base text-grit-600">6 ITEMS • $3,200 AVERAGE</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary py-2 px-4">EDIT</button>
                        <button className="btn-action py-2 px-4">USE</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="heading-sm">KITCHEN PLUMBING</h4>
                        <p className="body-base text-grit-600">4 ITEMS • $1,800 AVERAGE</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary py-2 px-4">EDIT</button>
                        <button className="btn-action py-2 px-4">USE</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="btn-primary w-full mt-4">
                  + CREATE NEW TEMPLATE BLOCK
                </button>
              </div>
              
              <div>
                <h3 className="heading-md mb-4">CONTRACT CLAUSES</h3>
                <p className="body-base text-grit-600 mb-6">
                  Standard clauses for your service contracts
                </p>
                
                <div className="space-y-4">
                  <div className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="heading-sm">WARRANTY TERMS</h4>
                        <p className="body-base text-grit-600">STANDARD 1-YEAR WARRANTY</p>
                      </div>
                      <button className="btn-secondary py-2 px-4">EDIT</button>
                    </div>
                  </div>
                  
                  <div className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="heading-sm">PAYMENT TERMS</h4>
                        <p className="body-base text-grit-600">50% UPFRONT, 50% COMPLETION</p>
                      </div>
                      <button className="btn-secondary py-2 px-4">EDIT</button>
                    </div>
                  </div>
                </div>
                
                <button className="btn-primary w-full mt-4">
                  + ADD CONTRACT CLAUSE
                </button>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="heading-md">MANAGE CLIENTS</h3>
                <button className="btn-action">+ ADD CLIENT</button>
              </div>
              
              <div className="space-y-3">
                {/* Client management would be similar to ClientsPage but with edit functionality */}
                <div className="card">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="heading-sm">JONES CONSTRUCTION</h4>
                      <p className="body-base text-grit-600">mike@jonesconstruction.com</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary py-2 px-4">EDIT</button>
                      <button className="btn-action py-2 px-4">VIEW</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}