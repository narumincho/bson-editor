import React, { useCallback, useEffect, useRef } from "react";

/**
 * 自動リサイズ付きの `<textarea />`
 */
export const TextEdit = (
  { initialValue, onChange }: {
    initialValue: string;
    onChange: (value: string) => void;
  },
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();

    const observer = new ResizeObserver(resize);

    observer.observe(textarea);

    return () => observer.disconnect();
  }, []);

  const handleOnChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >((e) => {
    resize();
    onChange(e.target.value);
  }, []);

  return (
    <textarea
      ref={textareaRef}
      onChange={handleOnChange}
      defaultValue={initialValue}
    />
  );
};
