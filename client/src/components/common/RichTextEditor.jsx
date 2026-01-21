import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { mediaAPI } from '../../services/api';
import { BoldIcon, ItalicIcon, ListBulletIcon, PhotoIcon } from '@heroicons/react/24/outline';

const RichTextEditor = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();

        if (file) {
          await handleImageUpload(file);
        }
      }
    }
  };

  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Pasted image ${Date.now()}`);

      const response = await mediaAPI.uploadMedia(formData);
      const imageUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${response.data.fileUrl}`;

      // Insert image into editor
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.margin = '8px 0';

      if (editorRef.current) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        range.insertNode(img);
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger input event
        handleInput();
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      toast.error(`Image upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const execCommand = (command, value = null) => {
    try {
      if (command === 'insertUnorderedList') {
        handleBulletList();
        return;
      }
      document.execCommand(command, false, value);
    } catch (error) {
      console.warn('execCommand failed, using fallback:', error);
      if (command !== 'insertUnorderedList') {
        handleManualFormatting(command);
      }
    }
    editorRef.current?.focus();
    handleInput();
  };

  const handleManualFormatting = (command) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    switch (command) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'insertUnorderedList':
        // Handle bullet list manually
        handleBulletList();
        break;
      default:
        break;
    }
  };

  const handleBulletList = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let currentNode = range.commonAncestorContainer;

    // If we're in a text node, get the parent element
    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentElement;
    }

    // Check if we're already in a list
    let listItem = currentNode.closest('li');
    let list = currentNode.closest('ul, ol');

    if (listItem && list) {
      // We're in a list, remove the list formatting
      const fragment = document.createDocumentFragment();
      while (listItem.firstChild) {
        fragment.appendChild(listItem.firstChild);
      }

      // Replace the list item with its contents
      listItem.parentNode.replaceChild(fragment, listItem);

      // Clean up empty lists
      if (list.children.length === 0) {
        list.remove();
      }
    } else {
      // Not in a list, create a new bullet list
      const selectedText = range.toString();

      if (!selectedText.trim()) {
        // No selection, create empty bullet point
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        li.innerHTML = '<br>';
        ul.appendChild(li);

        range.deleteContents();
        range.insertNode(ul);

        // Position cursor in the new list item
        const newRange = document.createRange();
        newRange.setStart(li, 0);
        newRange.setEnd(li, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Wrap selected text in bullet list
        const ul = document.createElement('ul');
        const li = document.createElement('li');
        li.textContent = selectedText;
        ul.appendChild(li);

        range.deleteContents();
        range.insertNode(ul);
      }
    }
  };

  const handleKeyDown = (e) => {
    // Handle Ctrl+V for paste
    if (e.ctrlKey && e.key === 'v') {
      // Let the paste event handle it
      return;
    }

    // Handle Enter key for lists
    if (e.key === 'Enter') {
      handleEnterKey(e);
      return;
    }

    // Handle keyboard shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        default:
          break;
      }
    }
  };

  const handleEnterKey = (e) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let currentNode = range.commonAncestorContainer;

    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentElement;
    }

    const listItem = currentNode.closest('li');

    if (listItem) {
      e.preventDefault();

      // Check if the list item is empty or only contains a <br>
      const isEmpty = !listItem.textContent.trim() ||
                     (listItem.children.length === 1 && listItem.children[0].tagName === 'BR');

      if (isEmpty) {
        // Exit the list
        const list = listItem.closest('ul, ol');
        const fragment = document.createDocumentFragment();

        // Move all content after the list to a new paragraph
        let nextSibling = list.nextSibling;
        while (nextSibling) {
          const temp = nextSibling.nextSibling;
          fragment.appendChild(nextSibling);
          nextSibling = temp;
        }

        // Replace the list with a paragraph containing a <br>
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        list.parentNode.replaceChild(p, list);

        if (fragment.children.length > 0) {
          p.parentNode.insertBefore(fragment, p.nextSibling);
        }

        // Position cursor in the new paragraph
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.setEnd(p, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Create a new list item
        const newLi = document.createElement('li');
        newLi.innerHTML = '<br>';

        listItem.parentNode.insertBefore(newLi, listItem.nextSibling);

        // Position cursor in the new list item
        const newRange = document.createRange();
        newRange.setStart(newLi, 0);
        newRange.setEnd(newLi, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  };

  return (
    <div className="border border-gray-300 dark:border-dark-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          title="Bullet List"
        >
          <ListBulletIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1" />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isUploading ? 'Uploading image...' : 'Paste images or use formatting'}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className={`w-full p-3 text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 min-h-[120px] focus:outline-none overflow-y-auto ${className}`}
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable]:focus:empty:before {
          color: #d1d5db;
        }
        .dark [contenteditable]:empty:before {
          color: #6b7280;
        }
        .dark [contenteditable]:focus:empty:before {
          color: #9ca3af;
        }
        [contenteditable] ul {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        [contenteditable] ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] ul li {
          list-style-type: disc;
        }
        [contenteditable] ol li {
          list-style-type: decimal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;