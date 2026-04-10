export default function CheckBoxButton({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: string | number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-4">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name="option"
          value={value}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)} // chỉ trả boolean
          className="form-radio text-blue-600 h-5 w-5 
                     hover:ring-0 hover:ring-blue-300 
                     focus:ring-0 focus:ring-blue-500 focus:outline-none"
        />
        <span className="ml-2 text-gray-700">{label}</span>
      </label>
    </div>
  );
}
