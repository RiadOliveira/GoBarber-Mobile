import { ValidationError } from 'yup';

interface Errors {
    [key: string]: string;
}

// Analisar a tipagem do path para ver se da overwrite

export default function getValidationErrors(err: ValidationError): Errors {
    const validationErrors: Errors = {};

    err.inner.forEach(error => {
        validationErrors[error.path] = error.message;
    });

    return validationErrors;
}
