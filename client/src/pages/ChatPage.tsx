import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { aiService } from '../services/ai';
import { useNavigate } from 'react-router-dom';

export function ChatPage() {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [selectedClient, setSelectedClient] = useState('');
  const [docType, setDocType] = useState('');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const docTypes = [
    { id: 'invoice', name: 'INVOICE', description: 'Bill for services' },
    { id: 'contract', name: 'CONTRACT', description: 'Service agreement' },
    { id: 'hr', name: 'HR DOC', description: 'Employment paperwork' },
  ];

  const mockClients = [
    { id: '1', name: 'SMITH CONSTRUCTION' },
    { id: '2', name: 'JONES PLUMBING' },
    { id: '3', name: 'BROWN ELECTRIC' },
  ];

  const handleSendMessage = async () => {
    if (!selectedClient || !docType || (!message && !isRecording)) {
      addNotification({
        type: 'error',
        message: 'Please select client, document type, and provide description',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const selectedClientName = mockClients.find(c => c.id === selectedClient)?.name || 'Client';
      
      const request = {
        type: docType as 'invoice' | 'contract' | 'hr_document',
        context: {
          clientName: selectedClientName,
          serviceDescription: message,
          notes: message,
        },
      };

      const result = await aiService.generateDocument(request);
      
      // Navigate to canvas with generated content
      navigate('/canvas', { 
        state: { 
          generatedDocument: result,
          clientName: selectedClientName,
          docType 
        } 
      });
      
      addNotification({
        type: 'success',
        message: 'Document generated successfully!',
      });
      
    } catch (error) {
      console.error('Error generating document:', error);
      addNotification({
        type: 'error',
        message: 'Failed to generate document. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        await aiService.startVoiceRecording();
        setIsRecording(true);
        addNotification({
          type: 'info',
          message: 'Recording started. Speak your requirements.',
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to start recording. Please check microphone permissions.',
        });
      }
    } else {
      try {
        const audioBlob = await aiService.stopVoiceRecording();
        const transcription = await aiService.transcribeAudio(audioBlob);
        
        setMessage(prev => prev ? `${prev} ${transcription.text}` : transcription.text);
        setIsRecording(false);
        
        addNotification({
          type: 'success',
          message: 'Voice recording transcribed!',
        });
      } catch (error) {
        setIsRecording(false);
        addNotification({
          type: 'error',
          message: 'Failed to process voice recording.',
        });
      }
    }
  };

  return (
    <div className="screen-chat">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container">
          <div className="flex items-center justify-between mb-2">
            <h1 className="heading-lg">AI Assistant</h1>
            {process.env.REACT_APP_PROTOTYPE_MODE === 'true' && (
              <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded-full">
                🚀 PROTOTYPE
              </span>
            )}
          </div>
          <p className="body-base text-gray-600">
            {process.env.REACT_APP_PROTOTYPE_MODE === 'true' 
              ? 'Using intelligent templates - full AI coming soon!'
              : 'Tell me what document you need'}
          </p>
        </div>
      </div>

      {/* Setup Form */}
      <div className="flex-1 p-4 space-y-6 bg-gray-50">
        <div className="container space-y-6">
          
          {/* Client Selection */}
          <div className="card">
            <label className="input-label">Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="input-field mb-3"
            >
              <option value="">Choose a client...</option>
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <button className="btn-secondary w-full">
              + Add New Client
            </button>
          </div>

          {/* Document Type */}
          <div className="card">
            <label className="input-label">Document Type</label>
            <div className="space-y-3">
              {docTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDocType(type.id)}
                  className={`card-interactive w-full text-left transition-all ${
                    docType === type.id ? 'card-selected ring-2 ring-orange-500' : ''
                  }`}
                >
                  <div>
                    <h3 className="heading-sm">{type.name}</h3>
                    <p className="body-small text-gray-600">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          {selectedClient && docType && (
            <div className="card">
              <label className="input-label">Describe what you need</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field h-32 resize-none mb-4"
                placeholder="Describe the work, services, amounts, deadlines, etc..."
              />
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVoiceRecord}
                  disabled={isGenerating}
                  className={`btn-secondary w-full flex items-center justify-center space-x-2 ${
                    isRecording ? 'bg-red-50 text-red-600 border-red-300' : ''
                  }`}
                >
                  <span>{isRecording ? '🔴' : '🎤'}</span>
                  <span>{isRecording ? 'Recording...' : 'Use Voice Input'}</span>
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={(!message.trim() && !isRecording) || isGenerating}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner w-4 h-4"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    'Create Document'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}