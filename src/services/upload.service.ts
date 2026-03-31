import { post } from "./cg-api.service";

export interface IFileUploadResponse {
  id: string;
  filename: string;
  url: string;
  ref: string;
  type: string;
  [key: string]: any;
}

export async function uploadImage(
  file: File,
  itemType: "user" | "distributionPoint",
  itemId: string
): Promise<IFileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("itemType", itemType);
  formData.append("itemId", itemId);

  return post(`/files/upload`, { data: formData });
}