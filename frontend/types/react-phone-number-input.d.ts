declare module 'react-phone-number-input' {
  import { ComponentType } from 'react';
  
  interface PhoneInputProps {
    international?: boolean;
    defaultCountry?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
  }
  
  const PhoneInput: ComponentType<PhoneInputProps>;
  export default PhoneInput;
} 