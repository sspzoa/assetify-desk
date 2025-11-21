import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const cardClassName =
  "flex w-full max-w-[768px] flex-col gap-spacing-300 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-500 text-content-standard-primary-primary";
const inputBaseClassName =
  "w-full rounded-radius-500 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary outline-none transition focus:border-core-accent focus:ring-2 focus:ring-core-accent focus:ring-offset-0";

const cn = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

type FormFieldProps = {
  title: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({
  title,
  description,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className={cardClassName}>
      <div
        className={cn(
          "flex flex-col",
          description ? "gap-spacing-100" : undefined,
        )}
      >
        <span className="font-semibold text-title">
          {title}
          {required ? <span className="text-core-accent">*</span> : null}
        </span>
        {description ? (
          <span className="text-content-standard-secondary text-label">
            {description}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({
  className,
  type = "text",
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      type={type}
      className={cn(inputBaseClassName, className)}
    />
  );
}

export type SelectOption = { label: string; value: string; disabled?: boolean };

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
};

export function SelectInput({
  options,
  className,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={cn(
          inputBaseClassName,
          "cursor-pointer appearance-none pr-spacing-800",
          className,
        )}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            hidden={option.disabled && option.value === ""}
          >
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-spacing-300 flex items-center text-content-standard-tertiary">
        v
      </span>
    </div>
  );
}

type RadioOption = { label: string; description?: string; value: string };

type RadioSelectProps = {
  name: string;
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

export function RadioSelect({
  name,
  options,
  defaultValue,
  value,
  required,
  disabled,
  onChange,
}: RadioSelectProps) {
  const isControlled = typeof value !== "undefined";

  return (
    <div className="flex flex-col gap-spacing-200">
      {options.map((option, index) => (
        <label
          key={option.value}
          className={cn(
            "flex items-start gap-spacing-200 rounded-radius-500 border border-line-outline bg-components-fill-standard-secondary p-spacing-400 transition",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-core-accent",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            {...(isControlled
              ? { checked: value === option.value }
              : { defaultChecked: defaultValue === option.value })}
            onChange={() => onChange?.(option.value)}
            required={required && (isControlled ? !value : true) && index === 0}
            disabled={disabled}
            className="mt-spacing-50 h-spacing-400 w-spacing-400 cursor-pointer accent-core-accent disabled:cursor-not-allowed"
          />
          <span className="flex flex-col gap-spacing-50">
            <span className="font-medium text-body text-content-standard-primary">
              {option.label}
            </span>
            {option.description ? (
              <span className="text-content-standard-tertiary text-label">
                {option.description}
              </span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}

type RichTextInputProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function RichTextInput({
  className,
  rows = 6,
  ...props
}: RichTextInputProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={cn(
        inputBaseClassName,
        "min-h-[180px] resize-none leading-6",
        className,
      )}
    />
  );
}

type FileUploadInputProps = {
  id: string;
  hint?: string;
  accept?: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  selectedSummary?: string;
  onFilesSelected?: (files: FileList | null) => void;
};

export function FileUploadInput({
  id,
  hint,
  accept,
  required,
  multiple,
  disabled,
  selectedSummary,
  onFilesSelected,
}: FileUploadInputProps) {
  return (
    <div className="flex flex-col gap-spacing-200">
      <input
        id={id}
        type="file"
        accept={accept}
        required={required}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => onFilesSelected?.(event.target.files)}
        className="hidden"
      />
      <label
        htmlFor={id}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-spacing-200 rounded-radius-600 border border-line-outline border-dashed bg-components-fill-standard-secondary p-spacing-600 text-center text-body text-content-standard-secondary transition",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-core-accent hover:text-content-standard-primary",
        )}
        aria-disabled={disabled}
      >
        <span className="font-semibold text-content-standard-primary">
          파일 업로드
        </span>
        <span className="text-content-standard-tertiary text-label">
          최대 10MB (PDF, PNG, JPG)
        </span>
      </label>
      {selectedSummary ? (
        <span className="text-body text-content-standard-primary">
          {selectedSummary}
        </span>
      ) : null}
      {hint ? (
        <span className="text-content-standard-tertiary text-label">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
