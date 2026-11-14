import { useState, useCallback } from 'react';
import JamConfigForm from './JamConfigForm';
import JamPreview from './JamPreview';
import JamPublish from './JamPublish';

const STEPS = ['configure', 'preview', 'publish'];

const STEP_LABELS = {
  configure: 'Configure',
  preview: 'Preview',
  publish: 'Publish',
};

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

export default function JamCreationWizard({ onComplete, onCancel, isSubmitting = false }) {
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
      if (!jamData.participationTypes.length) {
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

  const handlePublish = useCallback(
    (overrides = {}) => {
      if (isSubmitting) return;
      onComplete({ ...jamData, ...overrides });
    },
    [jamData, onComplete, isSubmitting]
  );

  return (
    <div className="jam-wizard">
      <div className="jam-wizard-steps" role="tablist" aria-label="Creation steps">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`jam-wizard-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            role="tab"
            aria-selected={i === step}
            aria-label={`Step ${i + 1}: ${STEP_LABELS[s]}`}
          >
            <span className="step-number" aria-hidden="true">
              {i < step ? '✓' : i + 1}
            </span>
            <span className="step-label">{STEP_LABELS[s]}</span>
          </div>
        ))}
      </div>

      <div className="jam-wizard-content" role="tabpanel">
        {currentStep === 'configure' && (
          <JamConfigForm data={jamData} onChange={updateJamData} errors={errors} />
        )}
        {currentStep === 'preview' && <JamPreview data={jamData} />}
        {currentStep === 'publish' && (
          <JamPublish
            data={jamData}
            onPublish={handlePublish}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      <div className="jam-wizard-footer">
        <button
          type="button"
          className="btn btn-ghost jam-wizard-btn cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>

        {step > 0 && (
          <button
            type="button"
            className="btn btn-secondary jam-wizard-btn back"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </button>
        )}

        {currentStep !== 'publish' && (
          <button
            type="button"
            className="btn btn-primary jam-wizard-btn next"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
