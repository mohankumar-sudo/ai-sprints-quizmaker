import { AUTH_MESSAGES } from "@/lib/auth/messages";

const EMAIL_MAX_LENGTH = 254;
const FULL_NAME_MIN_LENGTH = 2;
const FULL_NAME_MAX_LENGTH = 100;
const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_UPPERCASE_PATTERN = /[A-Z]/;
const PASSWORD_LOWERCASE_PATTERN = /[a-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;
const PASSWORD_SPECIAL_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export type SignUpInput = {
	fullName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

export type SignInInput = {
	email: string;
	password: string;
};

export type SignUpField = keyof SignUpInput;
export type SignInField = keyof SignInInput;

export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; errors: ValidationErrors<string> };

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

function validateFullName(fullName: string): string | undefined {
	const trimmed = fullName.trim();

	if (!trimmed) {
		return AUTH_MESSAGES.fullName.required;
	}

	if (trimmed.length < FULL_NAME_MIN_LENGTH) {
		return AUTH_MESSAGES.fullName.tooShort;
	}

	if (trimmed.length > FULL_NAME_MAX_LENGTH) {
		return AUTH_MESSAGES.fullName.tooLong;
	}

	return undefined;
}

function validateEmail(email: string): string | undefined {
	const trimmed = email.trim();

	if (!trimmed) {
		return AUTH_MESSAGES.email.required;
	}

	if (trimmed.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(trimmed)) {
		return AUTH_MESSAGES.email.invalid;
	}

	return undefined;
}

function validatePassword(password: string): string | undefined {
	if (!password) {
		return AUTH_MESSAGES.password.required;
	}

	if (password.length < PASSWORD_MIN_LENGTH) {
		return AUTH_MESSAGES.password.tooShort;
	}

	if (!PASSWORD_UPPERCASE_PATTERN.test(password)) {
		return AUTH_MESSAGES.password.missingUppercase;
	}

	if (!PASSWORD_LOWERCASE_PATTERN.test(password)) {
		return AUTH_MESSAGES.password.missingLowercase;
	}

	if (!PASSWORD_NUMBER_PATTERN.test(password)) {
		return AUTH_MESSAGES.password.missingNumber;
	}

	if (!PASSWORD_SPECIAL_PATTERN.test(password)) {
		return AUTH_MESSAGES.password.missingSpecial;
	}

	return undefined;
}

function validateConfirmPassword(
	password: string,
	confirmPassword: string,
): string | undefined {
	if (!confirmPassword) {
		return AUTH_MESSAGES.confirmPassword.required;
	}

	if (confirmPassword !== password) {
		return AUTH_MESSAGES.confirmPassword.mismatch;
	}

	return undefined;
}

export function validateSignUp(input: SignUpInput): ValidationResult<SignUpInput> {
	const errors: ValidationErrors<SignUpField> = {};

	const fullNameError = validateFullName(input.fullName);
	if (fullNameError) {
		errors.fullName = fullNameError;
	}

	const emailError = validateEmail(input.email);
	if (emailError) {
		errors.email = emailError;
	}

	const passwordError = validatePassword(input.password);
	if (passwordError) {
		errors.password = passwordError;
	}

	const confirmPasswordError = validateConfirmPassword(
		input.password,
		input.confirmPassword,
	);
	if (confirmPasswordError) {
		errors.confirmPassword = confirmPasswordError;
	}

	if (Object.keys(errors).length > 0) {
		return { success: false, errors };
	}

	return {
		success: true,
		data: {
			fullName: input.fullName.trim(),
			email: normalizeEmail(input.email),
			password: input.password,
			confirmPassword: input.confirmPassword,
		},
	};
}

export function validateSignIn(input: SignInInput): ValidationResult<SignInInput> {
	const errors: ValidationErrors<SignInField> = {};

	const emailError = validateEmail(input.email);
	if (emailError) {
		errors.email = emailError;
	}

	if (!input.password) {
		errors.password = AUTH_MESSAGES.password.required;
	}

	if (Object.keys(errors).length > 0) {
		return { success: false, errors };
	}

	return {
		success: true,
		data: {
			email: normalizeEmail(input.email),
			password: input.password,
		},
	};
}
