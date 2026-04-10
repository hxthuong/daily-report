export default function Loading({
  width = "1.5rem",
  height = "1.5rem",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  const dotStyle = {
    display: "inline-block",
    width: width,
    height: height,
    marginRight: "0.5rem",
    borderRadius: "9999px",
    animation: "bounce 1.2s infinite ease-in-out",
  };

  return (
    <>
      {/* Keyframes bounce */}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
          }
        `}
      </style>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        {/* Loading dots container */}
        <div
          style={{ display: "flex", alignItems: "flex-end", height: "1.5rem" }}
        >
          <span
            className="bg-blue-700"
            style={{ ...dotStyle, animationDelay: "0s" }}
          ></span>
          <span
            className="bg-blue-500"
            style={{ ...dotStyle, animationDelay: "0.2s" }}
          ></span>
          <span
            className="bg-blue-300"
            style={{ ...dotStyle, animationDelay: "0.4s", marginRight: 0 }}
          ></span>
        </div>
      </div>
    </>
  );
}

// import CustomImage from "@/components/image";

// export default function Loading() {
//   const loadingStyle = {
//     display: "inline-block",
//     marginRight: "0.5rem",
//     borderRadius: "9999px",
//     animation: "pulse 1.2s infinite ease-in-out",
//   };
//   return (
//     <div className="fixed inset-0 bg-blue-950 flex items-center justify-center z-52">
//       {/* Loading dots container */}
//       <CustomImage
//         src="/images/logo.png"
//         alt="Background"
//         width={150}
//         height={150}
//         className="rounded-full fade-in"
//         style={{ ...loadingStyle, animationDelay: "0.6s" }}
//       />
//     </div>
//   );
// }
