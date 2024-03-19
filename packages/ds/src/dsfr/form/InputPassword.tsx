import React from "react";
import { HiOutlineEye as Eye, HiOutlineEyeOff as EyeOff } from "react-icons/hi";
import { Input } from "@codegouvfr/react-dsfr/Input";

type OwnProps = {
  label?: string;
  name: string;
  value: string;
  onChange: (e: string) => void;
  disabled?: boolean;
  active?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
  hintText?: string;
};

export default function InputPassword({
  name,
  value,
  onChange,
  label,
  disabled,
  readOnly,
  error,
  className,
  hintText,
}: OwnProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const EyeButton = showPassword ? EyeOff : Eye;

  return (
    <div className="relative w-full mb-6">
      <Input
        label={label}
        disabled={disabled || readOnly}
        state={error ? "error" : "default"}
        stateRelatedMessage={error}
        className={`mb-1 ${className}`}
        nativeInputProps={{
          id: name,
          name,
          type: showPassword ? "text" : "password",
          onChange: handleChangeValue,
          value: value,
          readOnly: readOnly,
        }}
      ></Input>
      {hintText && <span className="fr-hint-text">{hintText}</span>}
      <EyeButton
        className="absolute right-2 top-11 cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
      />
    </div>
  );
}
