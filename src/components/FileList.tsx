import type { UploadedFile } from '../types';
import { formatFileSize } from '../utils';

interface FileListProps {
  files: UploadedFile[];
}

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Uploaded Files ({files.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {files.map((file) => (
            <FileListItem key={file.id} file={file} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FileListItemProps {
  file: UploadedFile;
}

function FileListItem({ file }: FileListItemProps) {
  return (
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      {/* Thumbnail or Icon */}
      <div className="flex-shrink-0">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={`Thumbnail for ${file.name}`}
            className="w-16 h-16 object-cover rounded border border-gray-200"
          />
        ) : (
          <FileIcon type={file.type} />
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-sm text-gray-500">
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Status Indicator */}
      <div className="flex-shrink-0">
        <StatusBadge status={file.status} error={file.error} />
      </div>

      {/* Progress Indicator */}
      {file.status === 'processing' && (
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
}

interface FileIconProps {
  type: 'pdf' | 'image' | 'text';
}

function FileIcon({ type }: FileIconProps) {
  const iconClasses = "w-16 h-16 rounded border border-gray-200 flex items-center justify-center";
  
  if (type === 'pdf') {
    return (
      <div className={`${iconClasses} bg-red-50`}>
        <svg
          className="w-8 h-8 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={`${iconClasses} bg-purple-50`}>
        <svg
          className="w-8 h-8 text-purple-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  // text type
  return (
    <div className={`${iconClasses} bg-blue-50`}>
      <svg
        className="w-8 h-8 text-blue-600"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

function StatusBadge({ status, error }: StatusBadgeProps) {
  if (status === 'completed') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
        aria-label="File upload completed"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Complete
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
        aria-label={`File upload error: ${error || 'Unknown error'}`}
        title={error}
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        Error
      </span>
    );
  }

  if (status === 'processing') {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        aria-label="File is processing"
      >
        Processing
      </span>
    );
  }

  // pending
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
      aria-label="File is pending"
    >
      Pending
    </span>
  );
}
