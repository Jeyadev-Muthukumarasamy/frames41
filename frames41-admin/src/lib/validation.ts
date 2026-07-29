export interface ValidationRule<T = string> {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: T) => string | undefined
}

export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>

export function validateField<T extends string | number>(
  value: string | number | undefined,
  rules: ValidationRule<T>,
  label: string,
): string | undefined {
  if (rules.required && (value === undefined || value === '' || value === null)) {
    return `${label} is required`
  }

  if (value === undefined || value === '') return undefined

  const strValue = String(value)

  if (rules.minLength !== undefined && strValue.length < rules.minLength) {
    return `${label} must be at least ${rules.minLength} characters`
  }

  if (rules.maxLength !== undefined && strValue.length > rules.maxLength) {
    return `${label} must be at most ${rules.maxLength} characters`
  }

  if (rules.pattern && !rules.pattern.test(strValue)) {
    return `${label} format is invalid`
  }

  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `${label} must be at least ${rules.min}`
    }
    if (rules.max !== undefined && value > rules.max) {
      return `${label} must be at most ${rules.max}`
    }
  }

  if (rules.custom) {
    return rules.custom(value as T)
  }

  return undefined
}

export function validateForm<T extends Record<string, unknown>>(
  values: T,
  rules: Partial<Record<keyof T, ValidationRule>>,
  labels: Partial<Record<keyof T, string>>,
): FieldErrors<T> {
  const errors: FieldErrors<T> = {}

  for (const key of Object.keys(rules) as Array<keyof T>) {
    const error = validateField(
      values[key] as string | number | undefined,
      rules[key] as ValidationRule<string | number>,
      labels[key] ?? String(key),
    )
    if (error) {
      errors[key] = error
    }
  }

  return errors
}
