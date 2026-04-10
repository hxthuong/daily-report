"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { File as FileType } from "@/types/file";
import { useNotification } from "@/context/notification";
import { createClient } from "@/utils/supabase/client";
import { normalizeText } from "@/utils/normalizeText";

export default function FileEditPage({
  data,
  fetchDataFn,
  onClose,
}: {
  data: FileType | null;
  fetchDataFn: (
    strSearch?: string,
    from?: Date | null,
    to?: Date | null,
  ) => void;
  onClose: () => void;
}) {
  const notify = useNotification();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    if (!data) return;

    const mapped = {
      name: data.filename || "",
      size: Number(data.filesize) || 0,
      type: data.filetype || null,
    } as File;
    setSelectedFile(mapped);
    setDescription(data.description || "");
  }, [data]);

  const clearInput = () => {
    setDescription("");
    setSelectedFile(null);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
  };

  const handleSave = async () => {
    if (!description.trim()) {
      notify.warning("Vui lòng nhập nội dung công việc");
      return;
    }

    if (!selectedFile) {
      notify.warning("Vui lòng chọn file");
      return;
    }

    if (!fileFilter(selectedFile)) {
      notify.warning("File không hợp lệ");
      return;
    }

    try {
      let fileUrl = "";
      const fileName = selectedFile
        ? `${Date.now()}-${normalizeText(selectedFile?.name)}`
        : "";

      // Upload avatar nếu có file
      if (selectedFile) {
        const { error: uploadError } = await supabase.storage
          .from("fileUpload") // bucket phải tồn tại
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("fileUpload")
          .getPublicUrl(fileName);

        fileUrl = publicData.publicUrl;
      }

      // RPC create file
      const { error } = await supabase.rpc("spu_dr_files_add", {
        p_filename: fileName || null,
        p_filetype: selectedFile?.type || null,
        p_filesize: selectedFile?.size || null,
        p_filepath: fileUrl || null,
        p_description: description.trim() || "",
      });

      if (error) throw error;

      if (fetchDataFn) await fetchDataFn();

      notify.success("Tải lên file thành công");
      onClose();
      clearInput();
    } catch (err) {
      console.error(err);
      notify.error("Tải lên thất bại");
    }
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      <div className="col-span-7">
        <p className="form-label">Mô tả nội dung file</p>
        <textarea
          className="form-input"
          value={description}
          rows={4}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="col-span-7">
        <p className="form-label">Chọn file</p>
        <label className="file-upload form-input flex items-center gap-2.5 cursor-pointer p-0!">
          <input type="file" className="hidden" onChange={handleChange} />
          <span
            className="bg-gray-300 p-2.5 rounded-l-lg"
            onClick={handleClick}
          >
            Chọn tệp
          </span>
          <span className={`${!selectedFile ? "text-gray-400" : ""}`}>
            {!selectedFile ? "Chưa có tệp nào được chọn" : selectedFile.name}
          </span>
        </label>
      </div>
      <div className="col-span-7 flex items-end justify-end space-x-3 border-t border-t-gray-300 pt-4 mt-3">
        <Button
          className="text-white bg-blue-700 font-semibold p-3 rounded-xl border border-blue-700 min-w-30"
          onClick={handleSave}
        >
          Tải lên
        </Button>
        <Button
          className="text-gray-500! bg-transparent font-semibold p-3 rounded-xl min-w-30 border border-gray-500 hover:bg-transparent!"
          onClick={onClose}
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}

const fileFilter = (file: File) => {
  const mime = file.type || "";
  const ext = file.name.split(".").pop()?.toLowerCase() as string;

  const allowedMimeTypes = [
    // images
    "image/",

    // pdf
    "application/pdf",

    // word
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

    // excel
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx

    // zip / rar
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
  ];

  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "pdf",
    "doc",
    "docx",
    "rar",
    "zip",
  ];

  const isMimeValid = allowedMimeTypes.some((type) => mime.startsWith(type));

  const isExtValid = allowedExtensions.includes(ext);

  // ✅ Cho phép nếu 1 trong 2 đúng
  if (isMimeValid || isExtValid) {
    return true;
  } else {
    return false;
  }
};
