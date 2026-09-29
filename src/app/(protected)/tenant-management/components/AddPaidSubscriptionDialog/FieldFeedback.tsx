'use client';

type FieldFeedbackProps = {
  error?: string;
  warning?: string;
  id?: string;
};

/** Inline validation message shown directly under the related control. */
export function FieldFeedback({
  error,
  warning,
  id,
}: Readonly<FieldFeedbackProps>) {
  if (error) {
    return (
      <p
        id={id}
        data-field-feedback="error"
        className="text-sm text-mds-error-500"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (warning) {
    return (
      <p
        id={id}
        data-field-feedback="warning"
        className="text-sm text-amber-800"
        role="status"
      >
        {warning}
      </p>
    );
  }

  return null;
}
