import { BlobServiceClient, StorageSharedKeyCredential, ContainerClient, PublicAccessType } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export class StorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor(credential: DefaultAzureCredential) {
    const storageAccountUrl = process.env.STORAGE_ACCOUNT_ENDPOINT;
    
    if (!storageAccountUrl) {
      throw new Error('Storage account endpoint not configured');
    }

    this.blobServiceClient = new BlobServiceClient(storageAccountUrl, credential);
    this.containerClient = this.blobServiceClient.getContainerClient('race-data');
  }

  async ensureContainer(): Promise<void> {
    try {
      await this.containerClient.createIfNotExists({
        access: 'blob' as PublicAccessType
      });
    } catch (error) {
      console.error('Error creating container:', error);
    }
  }

  async uploadRaceData(raceId: string, data: any): Promise<string> {
    await this.ensureContainer();
    
    const blobName = `races/${raceId}/${Date.now()}.json`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    
    const uploadData = JSON.stringify(data);
    await blockBlobClient.upload(uploadData, uploadData.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json'
      }
    });

    return blockBlobClient.url;
  }

  async uploadVehicleImage(userId: string, vehicleId: string, imageBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureContainer();
    
    const fileExtension = contentType.split('/')[1] || 'jpg';
    const blobName = `vehicles/${userId}/${vehicleId}/${Date.now()}.${fileExtension}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    return blockBlobClient.url;
  }

  async uploadUserAvatar(userId: string, imageBuffer: Buffer, contentType: string): Promise<string> {
    await this.ensureContainer();
    
    const fileExtension = contentType.split('/')[1] || 'jpg';
    const blobName = `avatars/${userId}/${Date.now()}.${fileExtension}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(imageBuffer, imageBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    return blockBlobClient.url;
  }

  async deleteBlob(blobName: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  }

  async getRaceDataBlob(raceId: string, fileName: string): Promise<Buffer | null> {
    const blobName = `races/${raceId}/${fileName}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    
    try {
      const downloadResponse = await blockBlobClient.download();
      const chunks: Buffer[] = [];
      
      if (downloadResponse.readableStreamBody) {
        for await (const chunk of downloadResponse.readableStreamBody) {
          if (chunk instanceof Buffer) {
            chunks.push(chunk);
          } else {
            chunks.push(Buffer.from(chunk));
          }
        }
        return Buffer.concat(chunks);
      }
      
      return null;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }
}