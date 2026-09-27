import { RATING_OPTIONS } from "../templates";

function RequiredMark() {
  return (
    <span className="required-mark" aria-hidden="true">
      *
    </span>
  );
}

export default function TemplateFeedbackCard({
  id,
  title,
  image,
  url,
  rating,
  liked,
  disliked,
  onChange,
  errors = {},
  disabled = false,
}) {
  const reactionLabelId = `${id}-reaction-label`;
  const reactionErrorId = `${id}-reaction-error`;
  const likedErrorId = `${id}-liked-error`;
  const dislikedErrorId = `${id}-disliked-error`;
  const invalid = Boolean(errors.rating || errors.liked || errors.disliked);

  return (
    <article
      id={`card-${id}`}
      className={`card${invalid ? " is-invalid" : ""}`}
    >
      <div className="card__head">
        <h2 className="card__title">{title}</h2>
        <a
          className="live-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Live Template <span aria-hidden="true">↗</span>
        </a>
      </div>

      <a
        className="preview"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${title} in a new tab`}
      >
        <img src={image} alt="" />
        <span className="preview__shade" aria-hidden="true" />
        <span className="preview__badge">
          View Template
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <path
              fill="currentColor"
              d="M4 3.5h8.5V12h-1.4V6.1L4.7 12.5 3.7 11.5 10.1 5H4V3.5Z"
            />
          </svg>
        </span>
      </a>

      <div className="card__body">
        <div className="reaction-block">
          <div className="reaction-heading">
            <span className="field__label" id={reactionLabelId}>
              Your reaction
              <RequiredMark />
            </span>
          </div>

          <div
            className="reactions"
            role="radiogroup"
            aria-labelledby={reactionLabelId}
            aria-required="true"
            aria-invalid={errors.rating || undefined}
            aria-describedby={errors.rating ? reactionErrorId : undefined}
          >
            {RATING_OPTIONS.map((option) => {
              const selected = rating === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  className={`reaction reaction--${option.value}${selected ? " is-selected" : ""}`}
                  onClick={() => onChange({ rating: option.value })}
                >
                  <span className="reaction__emoji" aria-hidden="true">
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {errors.rating ? (
            <p id={reactionErrorId} className="field-error" role="alert">
              Please select a reaction for this template.
            </p>
          ) : null}
        </div>

        <label className="field" htmlFor={`${id}-liked`}>
          <span className="field__label">
            What did you like about this template?
            <RequiredMark />
          </span>
          <textarea
            id={`${id}-liked`}
            value={liked}
            required
            disabled={disabled}
            aria-invalid={errors.liked || undefined}
            aria-describedby={errors.liked ? likedErrorId : undefined}
            placeholder="Tell us what you liked..."
            onChange={(event) => onChange({ liked: event.target.value })}
          />
          {errors.liked ? (
            <p id={likedErrorId} className="field-error" role="alert">
              Please tell us what you liked about this template.
            </p>
          ) : null}
        </label>

        <label className="field" htmlFor={`${id}-disliked`}>
          <span className="field__label">
            What didn’t you like about this template?
            <RequiredMark />
          </span>
          <textarea
            id={`${id}-disliked`}
            value={disliked}
            required
            disabled={disabled}
            aria-invalid={errors.disliked || undefined}
            aria-describedby={errors.disliked ? dislikedErrorId : undefined}
            placeholder="Tell us what you think could be improved..."
            onChange={(event) => onChange({ disliked: event.target.value })}
          />
          {errors.disliked ? (
            <p id={dislikedErrorId} className="field-error" role="alert">
              Please tell us what could be improved.
            </p>
          ) : null}
        </label>
      </div>
    </article>
  );
}
