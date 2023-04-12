import { useState } from "react";

const isFuncAsync = (func) => func.constructor.name === "AsyncFunction" || func.constructor.name === "Promise";

/**
 * Hook for managing form validation
 * @param {{
 *  initialValues: { [inputName: String]: any },
 *  validateOnChange: Boolean
 * }} config
 * @returns {{
 *  isValid: Boolean,
 * 	isValidationPending: Boolean,
 *  errors: { [inputName: String]: String },
 *  validate: (validationRule: (value) => string | void) => (inputName: string) => void,
 *  setValues: (inputName: string) => (value) => void,
 *  values: formValues: { [inputName: String]: any },
 *  handleSubmit: ((values: { [inputName: String]: any }) => void) => (event) => void,
 * }} methods and parameters
 */
const useForm = ({ initialValues = {}, validateOnChange = false }) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(validateOnChange);
  const [validationRules, setValidationRules] = useState({});
  const [isValidationPending, setIsValidationPending] = useState(false);

  const validateInput = async (inputName, inputValue, validationRule) => {
    const validationResult = isFuncAsync(validationRule) ? await validationRule(inputValue || "") : validationRule(inputValue || "");

    if (typeof validationResult === "string") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [inputName]: validationResult,
      }));
      return;
    }
    setErrors((prevErrors) => {
      if (inputName in prevErrors) {
        const filteredErrors = Object.entries(prevErrors).filter(([errorName]) => errorName !== inputName);
        return Object.fromEntries(filteredErrors);
      }
      return prevErrors;
    });
  };

  const validateForm = async ({ showErrors = false }) => {
    setShowErrors(showErrors);
    setIsValidationPending(true);
    for (const [inputName, validationRule] of Object.entries(validationRules)) {
      await validateInput(inputName, formValues[inputName], validationRule);
    }
    setIsValidationPending(false);
  };

  const validate = (validationRule) => (name) => {
    if (!(name in validationRules)) {
      setValidationRules((prevValidationRules) => ({
        ...prevValidationRules,
        [name]: validationRule,
      }));
    }
  };

  const handleSubmit = (submitHandler) => (event) => {
    event.preventDefault();
    validateForm({ showErrors: true }).finally(() => {
      if (Object.keys(errors).length === 0) {
        submitHandler(formValues);
      }
    });
  };

  const setValues = (inputName) => (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [inputName]: value,
    }));
    const validationRule = validationRules[inputName];
    validateInput(inputName, value, validationRule).finally(() => {
      setShowErrors(validateOnChange);
    });
  };

  return {
    isValid: Object.keys(errors).length === 0,
    isValidationPending,
    errors: showErrors ? errors : {},
    validate,
    setValues,
    values: formValues,
    handleSubmit,
  };
};

export default useForm;
