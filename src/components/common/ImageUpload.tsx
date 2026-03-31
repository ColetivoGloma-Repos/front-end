import React, { useCallback, useState, useRef, useEffect } from "react";
import { IoMdCloudUpload, IoMdClose } from "react-icons/io";

interface ImageUploadProps {
  label?: string;
  onChange: (file: File | null) => void;
  error?: string;
  value?: string | File | null;
}

export function ImageUpload({ label, onChange, error, value }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof value === "string" ? value : null
  );

  useEffect(() => {
    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (!value) {
      setPreview(null);
    }
  }, [value]);

  const handleFile = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onChange(file);
      }
    },
    [onChange]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-semibold">{label}</span>
        </label>
      )}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-base-300 hover:border-primary/50"
        } ${error ? "border-error" : ""} min-h-[150px] flex flex-col items-center justify-center cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onInputChange}
        />

        {preview ? (
          <div className="relative w-full aspect-video max-h-[200px]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error shadow-sm"
            >
              <IoMdClose size={14} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <IoMdCloudUpload size={48} className="mx-auto text-base-content/30 mb-2" />
            <p className="text-sm font-medium">
              Clique para upload ou arraste e solte
            </p>
            <p className="text-xs text-base-content/50 mt-1">
              PNG, JPG ou GIF (Máx. 5MB)
            </p>
          </div>
        )}
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
