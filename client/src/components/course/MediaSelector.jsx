import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DocumentIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';

const MediaSelector = ({ onSelect, selectedMedia = [] }) => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    try {
      const response = await axios.get(`${API_URL}/media`);
      setMediaList(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Failed to load media library');
      setLoading(false);
    }
  };

  const toggleMedia = (media) => {
    const isSelected = selectedMedia.some(m => m.fileUrl === media.fileUrl);
    if (isSelected) {
      onSelect(selectedMedia.filter(m => m.fileUrl !== media.fileUrl));
    } else {
      onSelect([...selectedMedia, {
        title: media.title,
        fileUrl: media.fileUrl,
        fileType: 'pdf'
      }]);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Lesson Resources (PDFs)
      </label>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedMedia.map((media, index) => (
          <div key={index} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100">
            <DocumentIcon className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{media.title}</span>
            <button
              type="button"
              onClick={() => onSelect(selectedMedia.filter((_, i) => i !== index))}
              className="hover:text-indigo-900 font-bold ml-1"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1 rounded-full border border-dashed border-indigo-300 hover:border-indigo-500"
        >
          <PlusIcon className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Select Media from Library</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {loading ? (
                <p className="text-center py-10">Loading media library...</p>
              ) : mediaList.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No PDF files found in library.</p>
                  <p className="text-sm text-gray-400 mt-1">Upload files in the Admin Dashboard first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mediaList.map((media) => {
                    const isSelected = selectedMedia.some(m => m.fileUrl === media.fileUrl);
                    return (
                      <div
                        key={media._id}
                        onClick={() => toggleMedia(media)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <DocumentIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{media.title}</p>
                          <p className="text-xs text-gray-500 truncate">{media.description || 'No description'}</p>
                        </div>
                        {isSelected && <CheckCircleIcon className="w-6 h-6 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSelector;
