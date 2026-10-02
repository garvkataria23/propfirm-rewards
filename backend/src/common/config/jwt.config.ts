export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '' || secret.includes('propfirm_super_secret_jwt_key_2026')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable is missing or using an insecure default in production! Application refused to start.',
      );
    }
    // Safe non-production developer fallback
    return 'dev_temporary_local_secret_must_be_set_in_production_environment_64chars!';
  }
  return secret;
}
