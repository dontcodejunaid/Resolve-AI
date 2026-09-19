import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".6rem",
    paddingRight: ".6rem",
  },
  animate: (isSelected) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".6rem",
    paddingRight: isSelected ? "1rem" : ".6rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.05, type: "spring", bounce: 0.15, duration: 0.5 };

export function ExpandableTabs({
  tabs,
  className,
  activeColor = "bg-lime-500 text-slate-950 font-bold shadow-sm shadow-lime-500/20",
  selectedIndex = null,
  onChange,
}) {
  const [selected, setSelected] = useState(selectedIndex);
  const outsideClickRef = useRef(null);

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex !== undefined) {
      setSelected(selectedIndex);
    }
  }, [selectedIndex]);

  useOnClickOutside(outsideClickRef, () => {
    if (selectedIndex === null || selectedIndex === undefined) {
      setSelected(null);
      onChange?.(null);
    }
  });

  const handleSelect = (index) => {
    setSelected(index);
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-5 w-[1px] bg-lime-200" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-2xl border border-lime-200/90 bg-white/95 p-1 shadow-sm backdrop-blur-md",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isCurrent = selected === index;

        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={isCurrent}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl py-1.5 text-xs font-semibold transition-all duration-200",
              isCurrent
                ? activeColor
                : "text-slate-600 hover:bg-lime-50 hover:text-slate-900"
            )}
          >
            <Icon size={17} className={isCurrent ? "text-slate-950" : "text-slate-500"} />
            <AnimatePresence initial={false}>
              {isCurrent && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden whitespace-nowrap ml-1.5 tracking-tight"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
