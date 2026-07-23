type Validatable = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// Browser-native validation messages ("Please fill out this field") show up
// in English regardless of page language — override them so every required
// field warns in Thai instead.
export function thaiInvalidMessage(e: React.InvalidEvent<Validatable>) {
  const el = e.currentTarget;
  const validity = el.validity;

  if (validity.valueMissing) {
    el.setCustomValidity("กรุณากรอกข้อมูลในช่องนี้");
  } else if (validity.typeMismatch || validity.patternMismatch) {
    el.setCustomValidity("รูปแบบข้อมูลไม่ถูกต้อง");
  } else if (validity.tooShort && "minLength" in el) {
    el.setCustomValidity(`กรุณากรอกอย่างน้อย ${el.minLength} ตัวอักษร`);
  } else {
    el.setCustomValidity("กรุณากรอกข้อมูลให้ถูกต้อง");
  }
}

export function clearCustomValidity(e: React.FormEvent<Validatable>) {
  e.currentTarget.setCustomValidity("");
}
