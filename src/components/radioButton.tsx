export default function RadioButton({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: string | number;
  checked: boolean;
  onChange: (value: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center space-x-4">
      <label className="inline-flex items-center">
        <input
          type="radio"
          name="option"
          className="form-radio text-blue-600 h-5 w-5 
              hover:ring-0 hover:ring-blue-300 
              focus:ring-0 focus:ring-blue-500 focus:outline-none"
          value={value}
          checked={checked}
          onChange={onChange}
        />
        <span className="ml-2 text-gray-700">{label || "Option 1"}</span>
      </label>
    </div>
  );
}
