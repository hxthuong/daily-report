export const getValueFromClass = (
  className: string = "",
  key: string = "",
  regex?: string | RegExp
) => {
  if (!className || !key) return "";
  const cls = className.split(" ").find((x) => x.startsWith(key));
  if (cls?.includes("-full")) return "100%";
  else {
    const match = regex ? cls?.match(regex) : null;
    if (match && match[1]) return match[1];
  }
};
