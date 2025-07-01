import { useRef } from 'react';

export default function ImageUploader({ onImagesSelected }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      onImagesSelected(imageFiles);
    }
    
    // Reset input value to allow selecting the same files again
    event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      onImagesSelected(imageFiles);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 transition-all duration-300 hover:bg-white/5"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="text-white/80 space-y-4">
        <div className="text-4xl">📸</div>
        <h3 className="text-xl font-semibold">Upload Images</h3>
        <p className="text-white/60">
          Click here or drag and drop your images
        </p>
        <p className="text-sm text-white/50">
          Supports JPG, PNG, GIF, and other image formats
        </p>
      </div>
    </div>
  );
}