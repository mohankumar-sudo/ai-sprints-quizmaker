export async function emailExists(
	db: D1Database,
	email: string,
): Promise<boolean> {
	const result = await db
		.prepare("SELECT id FROM user WHERE email = ?1 LIMIT 1")
		.bind(email)
		.first<{ id: string }>();

	return result !== null;
}

export async function getCredentialPasswordHash(
	db: D1Database,
	email: string,
): Promise<string | null> {
	const result = await db
		.prepare(
			`SELECT a.password AS password
			 FROM account a
			 INNER JOIN user u ON u.id = a.userId
			 WHERE u.email = ?1 AND a.providerId = 'credential'
			 LIMIT 1`,
		)
		.bind(email)
		.first<{ password: string | null }>();

	return result?.password ?? null;
}
