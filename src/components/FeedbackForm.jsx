import { useEffect, useRef, useState } from "react";
import { FORM_ENDPOINT } from "../config";
import {
  RATING_LABELS,
  TEMPLATES,
  createEmptyFeedback,
} from "../templates";
import TemplateFeedbackCard from "./TemplateFeedbackCard";

function blankOrText(value) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

function formatSubmission(feedback) {
  const blocks = TEMPLATES.map((template) => {
    const entry = feedback[template.id];

    return [
      "-------------------------",
      template.title,
      `URL: ${template.url}`,
      `Reaction: ${RATING_LABELS[entry.rating]}`,
      "",
      "What they liked:",
      blankOrText(entry.liked),
      "",
      "What they didn't like:",
      blankOrText(entry.disliked),
      "",
    ].join("\n");
  });

  return ["ANMAT Website Templates Feedback", "", ...blocks].join("\n");
}

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState(createEmptyFeedback);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const submittingRef = useRef(false);

  useEffect(() => {
    if (status === "success") {
      document.getElementById("submit-status")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [status]);

  function handleChange(id, patch) {
    setFeedback((current) => ({
      ...current,
      [id]: { ...current[id], ...patch },
    }));

    setErrors((current) => {
      const existing = current[id];
      if (!existing) return current;

      const next = { ...existing };
      if (patch.rating) next.rating = false;
      if ("liked" in patch && patch.liked.trim()) next.liked = false;
      if ("disliked" in patch && patch.disliked.trim()) next.disliked = false;

      return { ...current, [id]: next };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingRef.current || status === "success") {
      return;
    }

    const nextErrors = {};
    for (const template of TEMPLATES) {
      const entry = feedback[template.id];
      const fieldErrors = {
        rating: !entry.rating,
        liked: entry.liked.trim().length === 0,
        disliked: entry.disliked.trim().length === 0,
      };

      if (fieldErrors.rating || fieldErrors.liked || fieldErrors.disliked) {
        nextErrors[template.id] = fieldErrors;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      const firstInvalid = TEMPLATES.find((template) => nextErrors[template.id]);
      document.getElementById(`card-${firstInvalid.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");

    try {
      if (!FORM_ENDPOINT.startsWith("https://")) {
        throw new Error("Formspree endpoint is not configured.");
      }

      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: "ANMAT Website Templates Feedback",
          _gotcha: "",
          feedback: formatSubmission(feedback),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.error) {
        throw new Error("Form submission failed.");
      }

      setStatus("success");
    } catch (error) {
      console.error(error);
      submittingRef.current = false;
      setStatus("error");
    }
  }

  const isLocked = status === "submitting" || status === "success";

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      <p className="form-note">
        A reaction and both comments are required for each template.
      </p>

      <div className="cards">
        {TEMPLATES.map((template) => (
          <TemplateFeedbackCard
            key={template.id}
            id={template.id}
            title={template.title}
            image={template.image}
            url={template.url}
            rating={feedback[template.id].rating}
            liked={feedback[template.id].liked}
            disliked={feedback[template.id].disliked}
            errors={errors[template.id]}
            disabled={isLocked}
            onChange={(patch) => handleChange(template.id, patch)}
          />
        ))}
      </div>

      <div className="submit-panel" id="submit-status" aria-live="polite">
        {status === "success" ? (
          <p className="status status--success">
            Thank you! Your feedback has been submitted successfully.
          </p>
        ) : (
          <>
            <p className="submit-note">
              One submission sends your feedback for all three templates.
            </p>
            <button
              className="submit"
              type="submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Submitting..." : "Submit Feedback"}
            </button>
            {status === "error" ? (
              <p className="status status--error">
                Something went wrong. Please try again.
              </p>
            ) : null}
          </>
        )}
      </div>
    </form>
  );
}
