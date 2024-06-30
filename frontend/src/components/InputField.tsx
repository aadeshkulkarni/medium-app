import { ChangeEvent } from 'react';

interface InputFieldType {
  id?: string;
  label: string;
  type?: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
const InputField = ({ id, label, type, placeholder, onChange }: InputFieldType) => {
  return (
    <div className="w-full text-left my-4">
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-main">
        {label}
      </label>
      <input
        type={type || 'text'}
        id={id}
        onChange={onChange}
        className="bg-sub border border-gray-300 text-main text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4"
        placeholder={placeholder}
        required
      />
    </div>
  );
};
export default InputField;
