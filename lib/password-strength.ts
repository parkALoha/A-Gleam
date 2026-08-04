export type PasswordRule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

// Matches Supabase's strongest built-in password policy preset ("Lowercase,
// uppercase letters, digits and symbols" + 8 char minimum) — enforced here
// client-side since the project's Auth dashboard currently only requires 6
// characters with no complexity rule. Keep the two in sync: if the
// dashboard's Password Requirements setting changes, update this to match,
// otherwise a password that passes here can still bounce off the server.
export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: "อย่างน้อย 8 ตัวอักษร", test: (pw) => pw.length >= 8 },
  { id: "lowercase", label: "มีตัวพิมพ์เล็ก (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "uppercase", label: "มีตัวพิมพ์ใหญ่ (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "number", label: "มีตัวเลข (0-9)", test: (pw) => /[0-9]/.test(pw) },
  {
    id: "symbol",
    label: "มีอักขระพิเศษ (เช่น ! @ # $)",
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
