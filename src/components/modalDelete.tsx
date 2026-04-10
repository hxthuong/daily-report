import { Trash2 } from "lucide-react";
import Modal from "./modal";
import { Button } from "./button";
import { useEffect, useState } from "react";
import { useScreen } from "@/hooks/useScreen";

export default function ModalDelete({
  data,
  type,
  openModal,
  onClose,
  onDelete,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  type: string;
  openModal: boolean;
  onClose: () => void;
  onDelete?: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  const { width } = useScreen();

  useEffect(() => {
    setTimeout(() => setItem(data));
  }, [openModal, data]);

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  let name: string = "";

  switch (type) {
    case "report":
      name = item?.fullname
        ? `${item?.content} (${item?.fullname})`
        : item?.fullname;
      break;
    case "file":
      name = item?.filename;
      break;
    case "user":
      name = item?.fullname;
      break;
    case "role":
      name = item?.description;
      break;
    default:
      name = item?.fullname || "";
  }

  return (
    <Modal
      openModal={openModal}
      onClose={onClose}
      data={[]}
      position="center"
      width={width >= 415 ? "300px" : `${width}px`}
      className={`min-w-[${width}px]`}
    >
      <div className="w-full h-50 flex flex-col justify-center items-center space-y-4">
        <Trash2 className="text-red-500 w-12 h-12" />
        <div className="text-center space-x-1 text-wrap">
          <span>Bạn xác nhận muốn xóa</span>
          <span className="text-red-500">{name}?</span>
        </div>
        <div className="col-span-6 flex items-end justify-end space-x-3">
          <Button
            className="text-white bg-red-500 font-semibold p-3 rounded-xl border border-red-500 min-w-30 hover:bg-transparent hover:text-red-500"
            onClick={handleDelete}
          >
            Xác nhận
          </Button>
          <Button
            className="text-gray-500! bg-transparent font-semibold p-3 rounded-xl min-w-30 border border-gray-500 hover:bg-transparent!"
            onClick={onClose}
          >
            Hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
}
