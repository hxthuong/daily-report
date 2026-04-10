"use client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExportWordButton({ data }: any) {
  const exportFile = async () => {
    const res = await fetch("/api/export-word", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const blob = await res.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "bao-cao-cong-viec.docx";

    document.body.appendChild(a);
    a.click();

    a.remove();
  };

  return (
    <button
      onClick={exportFile}
      style={{
        padding: "10px 16px",
        background: "#2563eb",
        color: "white",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
      }}
    >
      Xuất báo cáo Word
    </button>
  );
}
