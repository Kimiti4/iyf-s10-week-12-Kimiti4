import { useState, useCallback } from 'react';
import JamConfigForm from './JamConfigForm';
import JamPreview from './JamPreview';
import JamPublish from './JamPublish';

const STEPS = ['configure', 'preview', 'publish'];

const INITIAL_STATE = {
  title: '',
  description: '',
  prompt: '',
  participationTypes: ['post'],
  category: 'creator',
  location: null,
  deadline: '',
  coverMediaUrl: '',
  tags: [],
};

export default function JamCreationWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [jamData, setJamData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  const currentStep = STEPS[step];

  const updateJamData = useCallback((updates) => {
    setJamData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const validateStep = useCallback(() => {
    const newErrors = {};

    if (currentStep === 'configure') {
      if (!jamData.title.trim()) {
        newErrors.title = 'Title is required';
      } else if (jamData.title.length > 120) {
        newErrors.title = 'Title must be 120 characters or less';
      }
      if (!jamData.prompt.trim()) {
        newErrors.prompt = 'A prompt helps people know what to do';
      }
      if (jamData.participationTypes.length === 0) {
        newErrors.participationTypes = 'Select at least one participation type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, jamData]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [validateStep]);

  const handleBack = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handlePublish = useCallback(() => {
    onComplete(jamData);
  }, [jamData, onComplete]);

  return (
    <div className="jam-wizard">
      <div className="jam-wizard-header">
        <h1>Start a Jam</h1>
        <p className="jam-wizard-subtitle">
          Turn your audience into participants
        </p>

        <div className="jam-wizard-steps" role="tablist" aria-label="Creation steps">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`jam-wizard-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${s}`}
            >
              <span className="step-number">{i < step ? '✓' : i + 1}</span>
              <span className="step-label">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="jam-wizard-content" role="tabpanel">
        {currentStep === 'configure' && (
          <JamConfigForm
            data={jamData}
            onChange={updateJamData}
            errors={errors}
          />
        )}
        {currentStep === 'preview' && (
          <JamPreview data={jamData} />
        )}
        {currentStep === 'publish' && (
          <JamPublish data={jamData} onPublish={handlePublish} />
        )}
      </div>

      <div className="jam-wizard-footer">
        <button className="jam-wizard-btn cancel" onClick={onCancel}>
          Cancel
        </button>

        {step > 0 && (
          <button className="jam-wizard-btn back" onClick={handleBack}>
            Back
          </button>
        )}

        {currentStep !== 'publish' && (
          <button className="jam-wizard-btn next" onClick={handleNext}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
