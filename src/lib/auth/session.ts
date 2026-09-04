export type SessionIdentity = {
	userId: string;
	email: string;
	name: string;
};

export function toSessionIdentity(session: {
	user: { id: string; email: string; name: string };
}): SessionIdentity {
	return {
		userId: session.user.id,
		email: session.user.email,
		name: session.user.name,
	};
}
