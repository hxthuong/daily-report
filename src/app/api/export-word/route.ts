import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "template-baocao.docx",
    );

    const content = fs.readFileSync(templatePath);

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.setData(data);

    try {
      doc.render();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Docxtemplater error:", error);

      if (error.properties && error.properties.errors) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error.properties.errors.forEach((e: any) => {
          console.error(e.properties.explanation);
        });
      }

      throw error;
    }

    const buffer = doc.getZip().generate({
      type: "arraybuffer",
    });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="bao-cao-cong-viec.docx"',
      },
    });
  } catch (error) {
    console.error("Export failed:", error);

    return new Response("Export failed", { status: 500 });
  }
}
