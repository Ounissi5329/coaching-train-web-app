import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PDFViewer = ({ url, title, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{title || 'PDF Viewer'}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            title="Close Viewer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 bg-gray-100 relative">
          <iframe
            src={`${url}#toolbar=0`}
            title={title}
            className="w-full h-full border-none"
          />
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <a 
            href={url} 
            download 
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download PDF
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
