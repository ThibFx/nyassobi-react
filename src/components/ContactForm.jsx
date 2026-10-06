import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client/react";
import styles from "./ContactForm.module.scss";
import {
  SEND_NYASSOBI_CONTACT_MESSAGE,
} from "../api/nyassobiMutations";
import { writeContext } from "../api/nyassobiMembership";

const mergeClassNames = (...classNames) =>
  classNames.filter((value) => typeof value === "string" && value.trim()).join(" ");

const initialFormState = {
  fullname: "",
  email: "",
  subject: "",
  message: "",
};

function ContactForm({
  className = "",
  buttonLabel = "Envoyer",
  successMessage = "Merci ! Votre message a bien été envoyé.",
  errorMessage = "Une erreur est survenue lors de l'envoi du message.",
  spamToken = null,
  ...formProps
}) {
  const [formValues, setFormValues] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: null, message: "" });

  const [sendContactMessage, { loading }] = useMutation(SEND_NYASSOBI_CONTACT_MESSAGE, { context: writeContext });

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }, []);

  const validate = useCallback((values) => {
    const nextErrors = {};

    if (!values.fullname.trim()) {
      nextErrors.fullname = "Merci d'indiquer votre nom.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Merci d'indiquer votre adresse e-mail.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(values.email.trim())) {
      nextErrors.email = "Cette adresse e-mail ne semble pas valide.";
    }

    if (!values.subject.trim()) {
      nextErrors.subject = "Merci d'indiquer l'objet de votre message.";
    }

    if (!values.message.trim()) {
      nextErrors.message = "Votre message est vide.";
    }

    return nextErrors;
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setStatus({ type: null, message: "" });

      const validationErrors = validate(formValues);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setStatus({
          type: "error",
          message: errorMessage,
        });
        return;
      }

      try {
        const trimmedToken =
          typeof spamToken === "string" && spamToken.trim().length > 0 ? spamToken.trim() : null;

        const { data } = await sendContactMessage({
          variables: {
            input: {
              fullname: formValues.fullname.trim(),
              email: formValues.email.trim(),
              subject: formValues.subject.trim(),
              message: formValues.message.trim(),
              ...(trimmedToken ? { token: trimmedToken } : {}),
            },
          },
        });

        const response = data?.sendNyassobiContactMessage;

        if (!response?.success) {
          throw new Error(response?.message || errorMessage);
        }

        setStatus({
          type: "success",
          message: response.message || successMessage,
        });
        setFormValues(initialFormState);
        setErrors({});
      } catch (mutationError) {
        const fallbackMessage =
          mutationError instanceof Error && mutationError.message
            ? mutationError.message
            : errorMessage;
        setStatus({
          type: "error",
          message: fallbackMessage,
        });
      }
    },
    [errorMessage, formValues, sendContactMessage, spamToken, successMessage, validate],
  );

  return (
    <form
      className={mergeClassNames(styles.contactForm, className)}
      onSubmit={handleSubmit}
      noValidate
      {...formProps}
    >
      <div className={styles.formField}>
        <label htmlFor="fullname" className={styles.label}>
          Nom et prénom
        </label>
        <input
          id="fullname"
          name="fullname"
          type="text"
          className={styles.input}
          value={formValues.fullname}
          onChange={handleChange}
          placeholder="Nyasso Bichon"
          autoComplete="name"
        />
        {errors.fullname ? <span className={styles.error}>{errors.fullname}</span> : null}
      </div>

      <div className={styles.formField}>
        <label htmlFor="email" className={styles.label}>
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={styles.input}
          value={formValues.email}
          onChange={handleChange}
          placeholder="vous@example.com"
          autoComplete="email"
          required
        />
        {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
      </div>

      <div className={styles.formField}>
        <label htmlFor="subject" className={styles.label}>
          Objet
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          className={styles.input}
          value={formValues.subject}
          onChange={handleChange}
          placeholder="Une demande, une proposition..."
        />
        {errors.subject ? <span className={styles.error}>{errors.subject}</span> : null}
      </div>

      <div className={styles.formField}>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          value={formValues.message}
          onChange={handleChange}
          placeholder="Donnez-nous le maximum de détails, Nybi adore ça !"
          rows={6}
        />
        {errors.message ? <span className={styles.error}>{errors.message}</span> : null}
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? "Envoi..." : buttonLabel}
      </button>

      {status.message ? (
        <p
          className={mergeClassNames(
            styles.statusMessage,
            status.type === "success" ? styles.statusSuccess : styles.statusError,
          )}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}

export default ContactForm;
