import React from 'react';
import { useSearchParams } from 'react-router-dom';

const PDFPage = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const title = searchParams.get('title') || 'PDF Document';

  if (!url) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="bg-white dark:bg-dark-800 shadow rounded-xl p-6 border border-gray-200 dark:border-dark-700">
          <p className="text-gray-600 dark:text-gray-300">Missing or invalid PDF URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate pr-4">{title}</h1>
          <div className="flex gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              Open in new tab
            </a>
            <a
              href={url}
              download
              className="px-3 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              Download
            </a>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-200px)]">
          <iframe
            src={`${url}#toolbar=0`}
            title={title}
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFPage;
