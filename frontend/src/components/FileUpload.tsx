import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete: (fileHash: string, aiReport: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 50 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 50MB');
        return;
      }
      setFile(droppedFile);
      setAiReport(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 50MB');
        return;
      }
      setFile(selectedFile);
      setAiReport(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sellerAddress', 'mpesa-user');

    try {
      // For demo/development - simulate AI verification
      // Replace with actual API call when backend is ready
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI report
      const mockReport = {
        fileType: file.name.split('.').pop() || 'unknown',
        fileName: file.name,
        fileSize: file.size,
        wordCount: Math.floor(Math.random() * 5000),
        riskScore: Math.floor(Math.random() * 100),
        suggestedPrice: Math.floor(Math.random() * 100) + 10,
        keywords: ['document', 'contract', 'agreement', 'terms'],
        preview: 'This is a preview of the file content...'
      };
      
      setAiReport(mockReport);
      toast.success('File uploaded and verified!');
      onUploadComplete(`ipfs_${Date.now()}`, mockReport);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAiReport(null);
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { text: 'Low Risk', color: '#10b981', bg: '#f0fdf4' };
    if (score < 70) return { text: 'Medium Risk', color: '#f59e0b', bg: '#fef3c7' };
    return { text: 'High Risk', color: '#ef4444', bg: '#fef2f2' };
  };

  return (
    <div className="file-upload-container">
      {!file ? (
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-input" className="drop-zone-label">
            <Upload size={48} strokeWidth={1.5} />
            <h3>Drag & drop your file here</h3>
            <p>or click to browse</p>
            <span className="file-hint">PDF, DOC, TXT, ZIP (Max 50MB)</span>
          </label>
        </div>
      ) : (
        <div className="file-preview">
          <div className="file-info">
            <FileText size={24} />
            <div className="file-details">
              <strong>{file.name}</strong>
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button onClick={removeFile} className="remove-file">
              <X size={18} />
            </button>
          </div>
          
          {!aiReport ? (
            <button 
              className="upload-btn" 
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="spinner-small"></div>
                  Verifying file...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload & Verify
                </>
              )}
            </button>
          ) : (
            <div className="ai-report">
              <div className="report-header">
                <CheckCircle size={18} color="#059669" />
                <strong>AI Verification Complete</strong>
              </div>
              <div className="report-stats">
                <div className="stat">
                  <span>File Type</span>
                  <strong>{aiReport.fileType}</strong>
                </div>
                <div className="stat">
                  <span>Words</span>
                  <strong>{aiReport.wordCount.toLocaleString()}</strong>
                </div>
                <div className="stat">
                  <span>Risk Score</span>
                  <strong style={{ color: getRiskLevel(aiReport.riskScore).color }}>
                    {aiReport.riskScore}/100
                  </strong>
                </div>
                <div className="stat">
                  <span>Suggested Price</span>
                  <strong>KES {(aiReport.suggestedPrice * 130).toLocaleString()}</strong>
                </div>
              </div>
              <div className="risk-badge" style={{ background: getRiskLevel(aiReport.riskScore).bg }}>
                <AlertCircle size={14} color={getRiskLevel(aiReport.riskScore).color} />
                <span style={{ color: getRiskLevel(aiReport.riskScore).color }}>
                  {getRiskLevel(aiReport.riskScore).text}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};