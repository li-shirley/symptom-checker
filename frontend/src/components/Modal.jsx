import { useEffect, useId, useRef } from "react";

const Modal = ({
    isOpen,
    onCancel,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmDisabled = false,
}) => {
    const titleId = useId();
    const descId = useId();
    const cancelBtnRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        // focus the cancel button when modal opens
        cancelBtnRef.current?.focus();

        const onKeyDown = (e) => {
            if (e.key === "Escape") onCancel?.();
        };

        document.addEventListener("keydown", onKeyDown);

        // prevent background scroll while open
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                // close only if click is on the overlay (not inside dialog)
                if (e.target === e.currentTarget) onCancel?.();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={message ? descId : undefined}
                className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full text-center space-y-4"
            >
                {title && (
                    <h3 id={titleId} className="text-lg font-bold">
                        {title}
                    </h3>
                )}

                {message && (
                    <div id={descId} className="text-base">
                        {message}
                    </div>
                )}

                <div className="flex justify-center gap-4 mt-4">
                    <button
                        ref={cancelBtnRef}
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
