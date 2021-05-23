function ImageURL({
  children
}) {
  return (
    <button
      onClick={
        () => {
          navigator.clipboard.writeText(`@@src='${children}'@@`).then(
            function () {
              alert("copied to clipboard");
            }
          );
        }}
    >
      {children}
    </button>
  );
}

export function MediaPreview({
  imagePreviewInfo, updateImageURLs
}) {
  const [thumbnail, image] = imagePreviewInfo;

  return (
    <div className="image-preview-thing">
      <img key={thumbnail} src={thumbnail} alt={image} width="80px"></img>
      <ImageURL>{image}</ImageURL>
      <button
        onClick={() => updateImageURLs(imageURLs =>
          imageURLs.filter(([previewName]) =>
            (previewName !== thumbnail)
          )
        )}
      >
        X
      </button>
    </div>
  );
}