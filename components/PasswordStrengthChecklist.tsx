import { PASSWORD_RULES } from "@/lib/password-strength";

export default function PasswordStrengthChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-1.5 grid grid-cols-1 gap-y-0.5 text-xs sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 ${passed ? "text-green-600" : "text-shop-text-soft"}`}
          >
            <span aria-hidden>{passed ? "✓" : "○"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
