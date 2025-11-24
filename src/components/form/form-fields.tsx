import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// 카드 기본 스타일
const cardClassName =
  "flex w-full max-w-[768px] flex-col gap-spacing-300 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-500 text-content-standard-primary-primary";

// 입력 필드 기본 스타일
const inputBaseClassName =
  "w-full rounded-radius-500 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-body text-content-standard-primary placeholder:text-content-standard-tertiary outline-none transition focus:border-core-accent focus:ring-2 focus:ring-core-accent focus:ring-offset-0";

// 클래스명 결합 유틸리티
const cn = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

// 폼 필드 Props 타입
type FormFieldProps = {
  title: string; // 필드 제목
  description?: string; // 필드 설명
  required?: boolean; // 필수 여부
  children: ReactNode; // 자식 요소
};

// 폼 필드 컴포넌트
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
          <span className="whitespace-pre-line text-content-standard-secondary text-label">
            {description}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// 텍스트 입력 Props 타입
type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

// 텍스트 입력 컴포넌트
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

// 선택 옵션 타입
export type SelectOption = { label: string; value: string; disabled?: boolean };

// 선택 입력 Props 타입
type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: SelectOption[];
};

// 선택 입력 컴포넌트
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
      {/* 드롭다운 화살표 아이콘 */}
      <span className="pointer-events-none absolute inset-y-0 right-spacing-300 flex items-center text-content-standard-tertiary">
        v
      </span>
    </div>
  );
}

// 라디오 옵션 타입
type RadioOption = { label: string; description?: string; value: string };

// 라디오 선택 Props 타입
type RadioSelectProps = {
  name: string;
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

// 라디오 선택 컴포넌트
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

// 리치 텍스트 입력 Props 타입
type RichTextInputProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

// 리치 텍스트 입력 컴포넌트 (여러 줄 텍스트)
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

// 파일 업로드 입력 Props 타입
type FileUploadInputProps = {
  id: string;
  hint?: string; // 힌트 메시지
  accept?: string; // 허용 파일 타입
  required?: boolean;
  multiple?: boolean; // 다중 파일 선택 허용
  disabled?: boolean;
  selectedSummary?: string; // 선택된 파일 요약
  onFilesSelected?: (files: FileList | null) => void;
};

// 파일 업로드 입력 컴포넌트
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
      {/* 숨겨진 파일 입력 */}
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
      {/* 커스텀 업로드 버튼 */}
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
      {/* 선택된 파일 요약 */}
      {selectedSummary ? (
        <span className="text-body text-content-standard-primary">
          {selectedSummary}
        </span>
      ) : null}
      {/* 힌트 메시지 */}
      {hint ? (
        <span className="text-content-standard-tertiary text-label">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
