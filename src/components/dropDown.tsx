"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import CustomImage from "./image";
import { DropdownProps, Option } from "@/types/dropdown";
import { X } from "lucide-react";

export default function Dropdown({
  options,
  placeholder = "",
  className = "bg-white border rounded-md hover:border-blue-400",
  onSelect,
  width,
  hasSearch = false,
  value,
  zIndex = 9999,
  disabled = false,
  multiple = false,
}: DropdownProps) {
  const [singleSelected, setSingleSelected] = useState<Option | null>(null);
  const [multiSelected, setMultiSelected] = useState<Option[]>([]);
  const [search, setSearch] = useState("");

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number>();

  /* =============================
     Sync value
  ============================== */
  useEffect(() => {
    if (value === undefined) return;

    if (multiple) {
      const values = Array.isArray(value) ? value.map(String) : [];
      setMultiSelected(options.filter((o) => values.includes(String(o.id))));
    } else {
      setSingleSelected(
        options.find((o) => String(o.id) === String(value)) ?? null,
      );
    }
  }, [value, options, multiple]);

  /* =============================
     Measure width
  ============================== */
  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  /* =============================
     Filter
  ============================== */
  const filteredOptions = useMemo(() => {
    if (!hasSearch) return options;
    return options.filter(
      (opt) =>
        opt.label?.toLowerCase().includes(search.toLowerCase()) ||
        (typeof opt.icon === "string" &&
          opt.icon.toLowerCase().includes(search.toLowerCase())),
    );
  }, [options, search, hasSearch]);

  /* =============================
     Select
  ============================== */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (option: any) => {
    if (multiple) {
      setMultiSelected(option);
      onSelect?.(option);
    } else {
      setSingleSelected(option);
      onSelect?.(option);
    }
    setSearch("");
  };

  /* =============================
     Delete (multi)
  ============================== */
  const handleDelete = (opt: Option) => {
    if (!multiple) return;

    const newList = multiSelected.filter((x) => x.id !== opt.id);
    setMultiSelected(newList);
    onSelect?.(newList);
  };

  /* =============================
     Limit visible tags
  ============================== */
  const [visibleItems, hiddenCount] = useMemo(() => {
    if (!multiple || !buttonWidth) return [multiSelected, 0];

    let usedWidth = 0;
    const gap = 8;
    const padding = 16;
    const maxWidth = buttonWidth - padding;

    const visible: Option[] = [];

    for (const item of multiSelected) {
      const estimatedWidth =
        (item.label?.length ?? 0) * 8 + (item.icon ? 32 : 0) + 40;

      if (usedWidth + estimatedWidth + gap > maxWidth) break;

      usedWidth += estimatedWidth + gap;
      visible.push(item);
    }

    return [visible, multiSelected.length - visible.length];
  }, [multiSelected, buttonWidth, multiple]);

  return (
    <Listbox
      as="div"
      className="relative"
      multiple={multiple}
      value={multiple ? multiSelected : (singleSelected ?? undefined)}
      onChange={handleSelect}
      disabled={disabled}
    >
      {/* ============ Button ============ */}
      <ListboxButton
        ref={buttonRef}
        className={`w-full text-left px-2 py-[3px] flex flex-wrap space-x-2 items-center outline-none cursor-pointer ${className} ${
          disabled ? "bg-gray-300 cursor-not-allowed opacity-50" : ""
        }`}
        style={
          width
            ? { width: typeof width === "number" ? `${width}px` : width }
            : undefined
        }
      >
        {multiple ? (
          <>
            {multiSelected.length > 0 ? (
              visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-2 items-center bg-blue-100 px-3 py-1 rounded-lg"
                  onMouseDownCapture={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <X
                    width={14}
                    height={14}
                    onClick={() => handleDelete(item)}
                  />
                  {item.icon && typeof item.icon === "string" && (
                    <CustomImage
                      src={item.icon}
                      width={20}
                      height={20}
                      alt=""
                    />
                  )}
                  <span>{item.label}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}

            {hiddenCount > 0 && (
              <div className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-600">
                +{hiddenCount}
              </div>
            )}
          </>
        ) : (
          <>
            {singleSelected?.icon &&
              typeof singleSelected.icon === "string" && (
                <CustomImage
                  src={singleSelected.icon}
                  width={24}
                  height={24}
                  alt=""
                  className="mr-2"
                />
              )}

            {singleSelected?.label ? (
              <span>{singleSelected.label}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </>
        )}
      </ListboxButton>

      {/* ============ Options ============ */}
      <ListboxOptions
        className="absolute mt-1 w-full border border-gray-300 rounded-lg bg-white shadow-lg focus:outline-none max-h-60 overflow-auto"
        style={{
          zIndex,
          width: buttonWidth,
        }}
      >
        {hasSearch && (
          <div className="sticky top-0 bg-white p-2 border-b z-10">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 border rounded outline-none"
            />
          </div>
        )}

        {!multiple && placeholder && (
          <ListboxOption
            value={null}
            className="px-3 py-2 text-gray-400 cursor-pointer hover:bg-blue-100"
          >
            {placeholder}
          </ListboxOption>
        )}

        {filteredOptions.map((opt) => (
          <ListboxOption
            key={opt.id}
            value={opt}
            className={({ selected }) =>
              `px-3 py-2 flex items-center space-x-2 cursor-pointer
              ${selected ? "bg-blue-100" : "hover:bg-blue-100"}`
            }
            style={{
              fontWeight: opt.bold ? 600 : 400,
              paddingLeft: `${(opt.padding ?? 0) + 12}px`,
            }}
          >
            {opt.icon && typeof opt.icon === "string" && (
              <CustomImage src={opt.icon} width={20} height={20} alt="" />
            )}
            {opt.icon && typeof opt.icon !== "string" && opt.icon}
            {opt.label && <span>{opt.label}</span>}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}
