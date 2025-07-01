import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ImageList({ images, onReorder, onRemove }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onReorder(items);
  };

  if (images.length === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col gap-2 mb-4 sm:mb-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">
            Images ({images.length})
          </h3>
          <p className="text-white/60 text-xs sm:text-sm lg:text-base">
            Drag to reorder
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[100px] p-2 sm:p-3 rounded-lg transition-colors duration-200 ${
                snapshot.isDraggingOver ? "bg-white/5" : ""
              }`}
            >
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center gap-2 sm:gap-3 lg:gap-4 bg-white/10 rounded-lg p-2 sm:p-3 lg:p-4 transition-all duration-200 ${
                        snapshot.isDragging
                          ? "shadow-2xl rotate-1 sm:rotate-2 scale-105 z-50 bg-white/20"
                          : "hover:bg-white/15 active:bg-white/20"
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        ...(snapshot.isDragging && {
                          transform: `${
                            provided.draggableProps.style?.transform
                          } rotate(${
                            window.innerWidth < 640 ? "1deg" : "2deg"
                          })`,
                        }),
                      }}
                    >
                      {/* Drag handle - larger on mobile */}
                      <div
                        {...provided.dragHandleProps}
                        className="text-white/60 hover:text-white active:text-white cursor-grab active:cursor-grabbing flex-shrink-0 p-1 sm:p-0 -m-1 sm:m-0 touch-manipulation"
                        style={{ touchAction: "none" }}
                      >
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm2 2a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                        </svg>
                      </div>

                      {/* Thumbnail - responsive sizing */}
                      <div className="flex-shrink-0">
                        <div className="w-16 sm:w-20 lg:w-24 aspect-[9/16] relative overflow-hidden rounded-md sm:rounded-lg border border-white/20">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Image ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Info - responsive layout */}
                      <div className="flex flex-col justify-center min-w-0 flex-1 overflow-hidden">
                        <p className="text-white font-medium text-xs sm:text-sm lg:text-base break-all whitespace-normal overflow-hidden">
                          {image.name}
                        </p>
                        <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                          {Math.round(image.size / 1024)} KB
                        </p>
                      </div>

                      {/* Remove button - larger touch target on mobile */}
                      <button
                        onClick={() => onRemove(image.id)}
                        className="text-red-400 hover:text-red-300 active:text-red-200 hover:bg-red-500/20 active:bg-red-500/30 p-2 sm:p-2 lg:p-2.5 rounded-full transition-all duration-200 flex-shrink-0 touch-manipulation min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center"
                        title="Remove image"
                        type="button"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
