import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export default function Notification({ message, type = "info", onClose }) {
  const config = {
    success: {
      icon: <CheckCircle className="text-green-600" />,
      className: "bg-green-50 border-green-200 text-green-700",
    },
    error: {
      icon: <XCircle className="text-red-600" />,
      className: "bg-red-50 border-red-200 text-red-700",
    },
    info: {
      icon: <Info className="text-blue-600" />,
      className: "bg-blue-50 border-blue-200 text-blue-700",
    },
  };

  return (
    <div className="pointer-events-none fixed top-5 right-5 z-50">
      <AnimatePresence>
        {message && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className={`pointer-events-auto border shadow-xl rounded-lg px-5 py-3 flex items-center gap-3 w-fit max-w-sm ${config[type].className}`}
          >
            {config[type].icon}
            <span className="flex-1 text-sm sm:text-base font-medium">{message}</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
