import { Secrets } from "secrets";
//Return the current property of a ref if it is a ref
export const getRefCurrent = (ref) => {
  return ref.hasOwnProperty("current")
    ? ref.current
    : ref;
};

export const validPageLink = (originalName) => `/${originalName.toLowerCase().replace(" ", "_")}`;

export async function uploadImage(image_name) {
  let form_data = new FormData();
  form_data.append("image", image_name);

  const expirationValue = 600;
  const requestUrl = `https://api.imgbb.com/1/upload?expiration${expirationValue}&key=${Secrets.IMGBB_KEY}`;
  const res = await fetch(requestUrl, { method: "POST", body: form_data, });

  return await res.json();
}

export async function retrieveImageData(imageFileName, whenRetrieved) {
  const image_file = imageFileName;
  const img = document.createElement('img');
  img.src = URL.createObjectURL(image_file);
  img.onload = async function () {
    const canvas = document.createElement("canvas");
    const canvas_context = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    canvas_context.drawImage(img, 0, 0);
    const imgData = canvas.toDataURL().split(',')[1];
    whenRetrieved(imgData);
  };
}