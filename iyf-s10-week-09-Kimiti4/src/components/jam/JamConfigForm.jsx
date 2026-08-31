import {
  PARTICIPATION_TYPE,
  JAM_CATEGORIES,
  JAM_TITLE_MAX,
  JAM_DESCRIPTION_MAX,
  JAM_PROMPT_MAX,
  MAX_PARTICIPATION_TYPES,
} from '../../models/jam';

const CATEGORY_OPTIONS = Object.entries(JAM_CATEGORIES).map(([key, value]) => ({
  value,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
}));

const PARTICIPATION_OPTIONS = [
  { value: PARTICIPATION_TYPE.VIDEO, label: '🎥 Video', desc: 'Record or upload a video' },
  { value: PARTICIPATION_TYPE.IMAGE, label: '📸 Photo', desc: 'Upload a photo' },
  { value: PARTICIPATION_TYPE.POST, label: '✍️ Post', desc: 'Write a text post' },
  { value: PARTICIPATION_TYPE.POLL, label: '🗳️ Poll', desc: 'Create a poll' },
  { value: PARTICIPATION_TYPE.LOCATION, label: '📍 Location', desc: 'Add a place' },
  { value: PARTICIPATION_TYPE.SKILL, label: '🛠️ Skill', desc: 'Offer a skill' },
  { value: PARTICIPATION_TYPE.GIG, label: '💼 Gig', desc: 'Offer a gig' },
];

export default function JamConfigForm({ data, onChange, errors }) {
  const handleTitleChange = (e) => {
    onChange({ title: e.target.value.slice(0, JAM_TITLE_MAX) });
  };

  const handleDescriptionChange = (e) => {
    onChange({ description: e.target.value.slice(0, JAM_DESCRIPTION_MAX) });
  };

  const handlePromptChange = (e) => {
    onChange({ prompt: e.target.value.slice(0, JAM_PROMPT_MAX) });
  };

  const handleCategoryChange = (e) => {
    onChange({ category: e.target.value });
  };

  const handleDeadlineChange = (e) => {
    onChange({ deadline: e.target.value });
  };

  const toggleParticipationType = (type) => {
    const current = data.participationTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : current.length < MAX_PARTICIPATION_TYPES
        ? [...current, type]
        : current;
    onChange({ participationTypes: next });
  };

  return (
    <div className="jam-config-form">
      {/* Title */}
      <div className="form-group">
        <label htmlFor="jam-title" className="form-label">
          Jam Title <span className="required">*</span>
        </label>
        <input
          id="jam-title"
          type="text"
          className={`form-input ${errors.title ? 'error' : ''}`}
          placeholder="e.g. Nairobi Street Food Jam"
          value={data.title}
          onChange={handleTitleChange}
          maxLength={JAM_TITLE_MAX}
          aria-describedby={errors.title ? 'jam-title-error' : undefined}
        />
        <div className="form-hint">
          {data.title.length}/{JAM_TITLE_MAX}
        </div>
        {errors.title && (
          <div id="jam-title-error" className="form-error" role="alert">
            {errors.title}
          </div>
        )}
      </div>

      {/* Prompt */}
      <div className="form-group">
        <label htmlFor="jam-prompt" className="form-label">
          What do you want people to do? <span className="required">*</span>
        </label>
        <input
          id="jam-prompt"
          type="text"
          className={`form-input ${errors.prompt ? 'error' : ''}`}
          placeholder="e.g. Show us the best street food you've discovered"
          value={data.prompt}
          onChange={handlePromptChange}
          maxLength={JAM_PROMPT_MAX}
          aria-describedby={errors.prompt ? 'jam-prompt-error' : undefined}
        />
        <div className="form-hint">
          {data.prompt.length}/{JAM_PROMPT_MAX}
        </div>
        {errors.prompt && (
          <div id="jam-prompt-error" className="form-error" role="alert">
            {errors.prompt}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="jam-description" className="form-label">
          Description
        </label>
        <textarea
          id="jam-description"
          className="form-input form-textarea"
          placeholder="Tell people more about this Jam..."
          value={data.description}
          onChange={handleDescriptionChange}
          maxLength={JAM_DESCRIPTION_MAX}
          rows={3}
        />
        <div className="form-hint">
          {data.description.length}/{JAM_DESCRIPTION_MAX}
        </div>
      </div>

      {/* Participation Types */}
      <div className="form-group">
        <label className="form-label">
          How can people participate? <span className="required">*</span>
        </label>
        <div className="form-hint">
          Select up to {MAX_PARTICIPATION_TYPES} types
        </div>
        <div className="participation-grid">
          {PARTICIPATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`participation-option ${
                data.participationTypes.includes(option.value) ? 'selected' : ''
              }`}
              onClick={() => toggleParticipationType(option.value)}
              aria-pressed={data.participationTypes.includes(option.value)}
            >
              <span className="participation-label">{option.label}</span>
              <span className="participation-desc">{option.desc}</span>
            </button>
          ))}
        </div>
        {errors.participationTypes && (
          <div className="form-error" role="alert">
            {errors.participationTypes}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="jam-category" className="form-label">
          Category
        </label>
        <select
          id="jam-category"
          className="form-input form-select"
          value={data.category}
          onChange={handleCategoryChange}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Deadline */}
      <div className="form-group">
        <label htmlFor="jam-deadline" className="form-label">
          Deadline
        </label>
        <input
          id="jam-deadline"
          type="datetime-local"
          className="form-input"
          value={data.deadline}
          onChange={handleDeadlineChange}
          min={new Date().toISOString().slice(0, 16)}
        />
        <div className="form-hint">
          Leave empty for no deadline
        </div>
      </div>
    </div>
  );
}
