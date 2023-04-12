import { useEffect, useState } from "react";

/**
 * Hook for managing form validation
 * @param {{
 *  initialValues: { [inputName: String]: any },
 *  validateOnChange: Boolean,
 *  validateOnInit: Boolean
 * }} config
 * @returns {{
 *  isValid: Boolean,
 * 	isValidationPending: Boolean,
 * 	isSubmitionPending: Boolean,
 *  errors: { [inputName: String]: String },
 *  validate: (validationRule: (value) => string | void) => (inputName: string) => void,
 *  setValues: (inputName: string) => (value) => void,
 *  values: formValues: { [inputName: String]: any },
 *  handleSubmit: ((values: { [inputName: String]: any }) => void) => (event) => void,
 * }} methods and parameters
 */
const useForm = ({ initialValues = {}, validateOnChange = false, validateOnInit = true }) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(validateOnChange);
  const [validationRules, setValidationRules] = useState({});
  const [isValidationPending, setIsValidationPending] = useState(false);
  const [isSubmitionPending, setIsSubmitionPending] = useState(false);

  const validateInput = async (inputName, inputValue, validationRule) => {
    if (!validationRule || !inputName) {
      return;
    }
    const validationResult = await validationRule({ value: inputValue || "", formValues });

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
    const validationRulesArr = Object.entries(validationRules);
    if (validationRulesArr.length > 0) {
      setIsValidationPending(true);
      for (const [inputName, validationRule] of Object.entries(validationRules)) {
        await validateInput(inputName, formValues[inputName], validationRule);
      }
      setIsValidationPending(false);
    }
  };

  const validate = (validationRule) => (inputName) => {
    if (!(inputName in validationRules)) {
      setValidationRules((prevValidationRules) => ({
        ...prevValidationRules,
        [inputName]: validationRule,
      }));
    }
    return () => {
      // Remove validation when parent component is destroyed
      if (inputName in validationRules) {
        setValidationRules((prevValidationRules) => {
          const filteredRules = Object.entries(prevValidationRules).filter(([key]) => key !== inputName);
          return Object.fromEntries(filteredRules);
        });
      }
    };
  };

  const handleSubmit = (submitHandler) => async (event) => {
    event.preventDefault();
    await validateForm({ showErrors: true });
    if (Object.keys(errors).length === 0) {
      setIsSubmitionPending(true);
      await submitHandler(formValues);
      setIsSubmitionPending(false);
    }
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

  useEffect(() => {
    if (validateOnInit) {
      console.log("REVALIDATE >>>", validationRules);
      validateForm({ showErrors: true });
    }
  }, [validationRules]);

  return {
    isValid: Object.keys(errors).length === 0,
    isValidationPending,
    isSubmitionPending,
    errors: showErrors ? errors : {},
    validate,
    setValues,
    values: formValues,
    handleSubmit,
  };
};

export default useForm;
