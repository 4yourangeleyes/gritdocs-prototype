// Simple placeholder pages for MVP
import React from 'react';

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration</h1>
        <p className="text-gray-600">Registration form will be implemented here</p>
      </div>
    </div>
  );
}

export function CreatePage() {
  return (
    <div className="pt-20 pb-8">
      <div className="minimalist-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Invoice</h1>
        <p className="text-gray-600">Invoice creation form will be implemented here</p>
      </div>
    </div>
  );
}

export function InvoicesPage() {
  return (
    <div className="pt-20 pb-8">
      <div className="minimalist-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Invoices</h1>
        <p className="text-gray-600">Invoice list will be implemented here</p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="pt-20 pb-8">
      <div className="minimalist-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-gray-600">User settings will be implemented here</p>
      </div>
    </div>
  );
}