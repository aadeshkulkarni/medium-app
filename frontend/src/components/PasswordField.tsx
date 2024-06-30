import { useState, ChangeEvent, KeyboardEvent } from 'react';
import PasswordEyeIcon from './icons/PasswordEyeIcon';

interface InputFieldType {
  id?: string;
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const PasswordField = ({ id, label, placeholder, onChange, onKeyDown }: InputFieldType) => {
  const [inputType, setInputType] = useState('password');

  const handleTogglePassword = () => {
    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <div className="w-full text-left my-4 relative">
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-main">
        {label}
      </label>
      <input
        type={inputType}
        id={id}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`bg-sub border border-gray-300 text-main text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 pr-10`}
        placeholder={placeholder}
        required
      />
      <button type="button" onClick={handleTogglePassword} className="absolute top-8 right-0 p-3.5 rounded-e-md">
        <PasswordEyeIcon inputType={inputType} />
      </button>
    </div>
  );
};

export default PasswordField;
