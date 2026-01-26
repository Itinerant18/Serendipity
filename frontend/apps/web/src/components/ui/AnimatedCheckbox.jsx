import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnimatedCheckbox({ checked, onChange }) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onChange();
            }}
            className={`relative flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-300 ${checked ? "bg-sky-500 border-sky-500" : "bg-white border-slate-300 hover:border-sky-400 shadow-sm"
                }`}
        >
            <AnimatePresence>
                {checked && (
                    <motion.i
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                        className="fa-solid fa-check text-white text-[10px]"
                    />
                )}
            </AnimatePresence>
        </button>
    );
}
