import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">
          Images ({images.length})
        </h3>
        <p className="text-white/60 text-sm">
          Drag to reorder
        </p>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-3 min-h-[100px] p-2 rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-white/5' : ''
              }`}
            >
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center space-x-4 bg-white/10 rounded-lg p-3 transition-all duration-200 ${
                        snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50' : 'hover:bg-white/15'
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        ...(snapshot.isDragging && {
                          transform: `${provided.draggableProps.style?.transform} rotate(2deg)`,
                        }),
                      }}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="drag-handle text-white/60 hover:text-white cursor-grab active:cursor-grabbing flex-shrink-0"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm2 2a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                        </svg>
                      </div>
                      
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-white/20 flex-shrink-0"
                      />
                      
                      <div className="flex-1 text-white min-w-0">
                        <p className="font-medium truncate">{image.name}</p>
                        <p className="text-sm text-white/60">
                          {Math.round(image.size / 1024)} KB
                        </p>
                      </div>
                      
                      <button
                        onClick={() => onRemove(image.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-full transition-all duration-200 flex-shrink-0"
                        title="Remove image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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