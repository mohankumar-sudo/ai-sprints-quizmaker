"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type SignUpActionState } from "@/app/sign-up/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PASSWORD_REQUIREMENTS_TEXT } from "@/lib/auth/password-requirements";

const initialState: SignUpActionState = {};

export function SignUpForm() {
	const [state, formAction, isPending] = useActionState(
		signUpAction,
		initialState,
	);

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Create your account</CardTitle>
				<CardDescription>
					Sign up for Quiz Maker to create and manage quizzes.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					action={formAction}
					aria-label="Sign up"
					className="space-y-5"
					noValidate
				>
					<FieldGroup aria-live="polite" aria-atomic="true">
						<Field data-invalid={!!state.errors?.fullName}>
							<FieldLabel htmlFor="sign-up-full-name">Full Name</FieldLabel>
							<Input
								id="sign-up-full-name"
								name="fullName"
								type="text"
								autoComplete="name"
								required
								aria-invalid={!!state.errors?.fullName}
								aria-describedby={
									state.errors?.fullName
										? "sign-up-full-name-error"
										: undefined
								}
							/>
							<FieldError
								id="sign-up-full-name-error"
								errors={[{ message: state.errors?.fullName }]}
							/>
						</Field>

						<Field data-invalid={!!state.errors?.email}>
							<FieldLabel htmlFor="sign-up-email">Email Address</FieldLabel>
							<Input
								id="sign-up-email"
								name="email"
								type="email"
								autoComplete="email"
								required
								aria-invalid={!!state.errors?.email}
								aria-describedby={
									state.errors?.email ? "sign-up-email-error" : undefined
								}
							/>
							<FieldError
								id="sign-up-email-error"
								errors={[{ message: state.errors?.email }]}
							/>
						</Field>

						<Field data-invalid={!!state.errors?.password}>
							<FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
							<Input
								id="sign-up-password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								aria-invalid={!!state.errors?.password}
								aria-describedby="sign-up-password-requirements sign-up-password-error"
							/>
							<FieldDescription id="sign-up-password-requirements">
								{PASSWORD_REQUIREMENTS_TEXT}
							</FieldDescription>
							<FieldError
								id="sign-up-password-error"
								errors={[{ message: state.errors?.password }]}
							/>
						</Field>

						<Field data-invalid={!!state.errors?.confirmPassword}>
							<FieldLabel htmlFor="sign-up-confirm-password">
								Confirm Password
							</FieldLabel>
							<Input
								id="sign-up-confirm-password"
								name="confirmPassword"
								type="password"
								autoComplete="new-password"
								required
								aria-invalid={!!state.errors?.confirmPassword}
								aria-describedby={
									state.errors?.confirmPassword
										? "sign-up-confirm-password-error"
										: undefined
								}
							/>
							<FieldError
								id="sign-up-confirm-password-error"
								errors={[{ message: state.errors?.confirmPassword }]}
							/>
						</Field>
					</FieldGroup>

					<Button
						type="submit"
						className="min-h-11 w-full"
						disabled={isPending}
						aria-busy={isPending}
					>
						{isPending ? "Creating account..." : "Sign Up"}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="justify-center">
				<p className="text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						href="/sign-in"
						className="text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
