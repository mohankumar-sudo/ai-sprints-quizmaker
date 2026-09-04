export const AUTH_MESSAGES = {
	fullName: {
		required: "Full name is required.",
		tooShort: "Full name must be at least 2 characters.",
		tooLong: "Full name must be 100 characters or fewer.",
	},
	email: {
		required: "Email is required.",
		invalid: "Please enter a valid email address.",
		alreadyRegistered:
			"An account with this email already exists. Please sign in.",
	},
	password: {
		required: "Password is required.",
		tooShort: "Password must be at least 8 characters.",
		missingUppercase: "Password must contain at least one uppercase letter.",
		missingLowercase: "Password must contain at least one lowercase letter.",
		missingNumber: "Password must contain at least one number.",
		missingSpecial: "Password must contain at least one special character.",
	},
	confirmPassword: {
		required: "Please confirm your password.",
		mismatch: "Passwords do not match.",
	},
	signIn: {
		invalidCredentials: "Invalid email or password.",
	},
	server: {
		unexpected: "Something went wrong. Please try again later.",
	},
} as const;
