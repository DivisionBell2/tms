export interface FileUploadRequestDto {
    ownerId: string;
    filename: string;
    mime: string;
    dataBase64: string;
  }
  
  export interface FileMetaDto {
    id: string;
    ownerId: string;
    mime: string;
    size: number;
    createdAt: string;
  }
  
  export interface FileGetMetaRequestDto {
    fileId: string;
  }
  
  export interface FileDeleteRequestDto {
    fileId: string;
    ownerId: string;
  }