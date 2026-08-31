import { useState, useCallback } from 'react';
import { FaImage, FaVideo, FaPen, FaSpinner, FaCheck } from 'react-icons/fa';
import { contributionAPI } from '../../services/jamApi';
import { PARTICIPATION_TYPE } from '../../models/jam';

const IDLE = 'idle';
const UPLOADING = 'uploading';
const SUBMITTING = 'submitting';
const SUCCESS = 'success';
const ERROR = 'error';

const TYPE_CONFIG = {
  [PARTICIPATION_TYPE.IMAGE]: { icon: FaImage, label: 'Photo', accept: 'image/*' },
  [PARTICIPATION_TYPE.VIDEO]: { icon: FaVideo, label: 'Video', accept: 'video/*' },
  [PARTICIPATION_TYPE.POST]: { icon: FaPen, label: 'Post', accept: null },
};

export default function ContributionComposer({ jamId, participationTypes = [], onSubmitted }) {
  const [selectedType, setSelectedType] = useState(participationTypes[0] || PARTICIPATION_TYPE.POST);
  const [textContent, setTextContent] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  const config = TYPE_CONFIG[selectedType] || TYPE_CONFIG[PARTICIPATION_TYPE.POST];

  const handleFileChange = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!textContent.trim() && !file) {
      setError('Add some content or attach a file');
      return;
    }

    setStatus(SUBMITTING);
    setError('');

    try {
      const contributionData = {
        type: selectedType,
        textContent: textContent.trim() || undefined,
      };

      if (file) {
        setStatus(UPLOADING);
        // In a real app, upload to storage first and set contentUrl
        // For now, we'll pass the file name as a placeholder
        contributionData.contentUrl = `uploads/${file.name}`;
        setStatus(SUBMITTING);
      }

      await contributionAPI.create(jamId, contributionData);
      setStatus(SUCCESS);
      setTextContent('');
      setFile(null);

      setTimeout(() => {
        setStatus(IDLE);
        onSubmitted?.();
      }, 1500);
    } catch (err) {
      setStatus(ERROR);
      setError(err.message || 'Failed to submit');
    }
  }, [selectedType, textContent, file, jamId, onSubmitted]);

  return (
    <div className="contribution-composer">
      <h3 className="contribution-composer-title">Add your contribution</h3>

      {/* Type selector */}
      {participationTypes.length > 1 && (
        <div className="contribution-type-tabs" role="tablist" aria-label="Contribution type">
          {participationTypes.map((type) => {
            const tabConfig = TYPE_CONFIG[type];
            if (!tabConfig) return null;
            const Icon = tabConfig.icon;
            return (
              <button
                key={type}
                role="tab"
                aria-selected={selectedType === type}
                className={`contribution-type-tab ${selectedType === type ? 'active' : ''}`}
                onClick={() => { setSelectedType(type); setFile(null); setError(''); }}
              >
                <Icon aria-hidden="true" />
                {tabConfig.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Text input for post type */}
      {selectedType === PARTICIPATION_TYPE.POST && (
        <textarea
          className="contribution-text-input"
          placeholder="Write your contribution..."
          value={textContent}
          onChange={(e) => { setTextContent(e.target.value); setError(''); }}
          rows={4}
          maxLength={2000}
          aria-label="Contribution text"
        />
      )}

      {/* File upload for image/video types */}
      {(selectedType === PARTICIPATION_TYPE.IMAGE || selectedType === PARTICIPATION_TYPE.VIDEO) && (
        <div className="contribution-upload">
          <label className="contribution-upload-label" htmlFor="contribution-file">
            {config.icon && <config.icon aria-hidden="true" />}
            {file ? file.name : `Tap to add ${config.label.toLowerCase()}`}
          </label>
          <input
            id="contribution-file"
            type="file"
            accept={config.accept}
            onChange={handleFileChange}
            className="contribution-file-input"
          />
          {file && (
            <span className="contribution-file-name">{file.name}</span>
          )}
        </div>
      )}

      {/* Status messages */}
      {status === SUCCESS && (
        <div className="contribution-success" role="status">
          <FaCheck /> Contribution submitted!
        </div>
      )}

      {status === ERROR && (
        <div className="contribution-error" role="alert">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        className="contribution-submit-btn"
        onClick={handleSubmit}
        disabled={status === SUBMITTING || status === UPLOADING || status === SUCCESS}
      >
        {status === UPLOADING && <><FaSpinner className="contribution-spinner" /> Uploading...</>}
        {status === SUBMITTING && <><FaSpinner className="contribution-spinner" /> Submitting...</>}
        {status === SUCCESS && <><FaCheck /> Done</>}
        {status === IDLE && 'Submit Contribution'}
      </button>
    </div>
  );
}
