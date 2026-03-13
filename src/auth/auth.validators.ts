// ─── src/auth/auth.validators.ts ──────────────────────────────

import { BadRequestException } from '@nestjs/common';
import { AUTH_CONFIG, AUTH_ERROR } from './auth.constants';

/**
 * Validates password strength according to production standards
 */
export class PasswordValidator {
  static validate(password: string): void {
    const {
      MIN_PASSWORD_LENGTH,
      REQUIRE_UPPERCASE,
      REQUIRE_NUMBERS,
      REQUIRE_SPECIAL_CHARS,
    } = AUTH_CONFIG;

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(AUTH_ERROR.WEAK_PASSWORD);
    }

    if (REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      throw new BadRequestException(AUTH_ERROR.WEAK_PASSWORD);
    }

    if (REQUIRE_NUMBERS && !/[0-9]/.test(password)) {
      throw new BadRequestException(AUTH_ERROR.WEAK_PASSWORD);
    }

    if (REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*]/.test(password)) {
      throw new BadRequestException(AUTH_ERROR.WEAK_PASSWORD);
    }
  }
}
