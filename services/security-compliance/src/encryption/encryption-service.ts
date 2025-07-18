import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface EncryptionKey {
  id: string;
  name: string;
  type: 'AES-256' | 'RSA-2048' | 'RSA-4096';
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  metadata: Record<string, any>;
}

export interface EncryptedData {
  encryptedData: string;
  keyId: string;
  algorithm: string;
  iv?: string;
  tag?: string;
}

export class EncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private keyStore: Map<string, Buffer> = new Map();

  constructor() {
    this.initializeMockKeys();
  }

  private initializeMockKeys(): void {
    // Mock encryption keys
    const mockKeys: EncryptionKey[] = [
      {
        id: 'key-001',
        name: 'Default AES Key',
        type: 'AES-256',
        tenantId: 'tenant-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        metadata: { purpose: 'general_encryption', rotation: 'annual' }
      },
      {
        id: 'key-002',
        name: 'PCI Data Key',
        type: 'AES-256',
        tenantId: 'tenant-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        metadata: { purpose: 'pci_data', rotation: 'quarterly' }
      },
      {
        id: 'key-003',
        name: 'RSA Key Pair',
        type: 'RSA-2048',
        tenantId: 'tenant-001',
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
        metadata: { purpose: 'digital_signatures', rotation: 'biennial' }
      }
    ];

    mockKeys.forEach(key => {
      this.keys.set(key.id, key);
      // Generate mock key material
      this.keyStore.set(key.id, crypto.randomBytes(32));
    });
  }

  async encrypt(data: string, keyId: string, tenantId: string): Promise<EncryptedData> {
    try {
      const key = this.keys.get(keyId);
      if (!key || !key.isActive || key.tenantId !== tenantId) {
        throw new Error('Invalid or inactive encryption key');
      }

      const keyMaterial = this.keyStore.get(keyId);
      if (!keyMaterial) {
        throw new Error('Key material not found');
      }

      let encryptedData: EncryptedData;

      if (key.type.startsWith('AES')) {
        // AES encryption using modern crypto methods
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial, iv);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        encryptedData = {
          encryptedData: encrypted,
          keyId,
          algorithm: key.type,
          iv: iv.toString('hex'),
          tag: cipher.getAuthTag().toString('hex')
        };
      } else if (key.type.startsWith('RSA')) {
        // RSA encryption (for smaller data)
        const encrypted = crypto.publicEncrypt(
          {
            key: keyMaterial,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
          },
          Buffer.from(data, 'utf8')
        );

        encryptedData = {
          encryptedData: encrypted.toString('base64'),
          keyId,
          algorithm: key.type
        };
      } else {
        throw new Error(`Unsupported encryption algorithm: ${key.type}`);
      }

      logger.info('Data encrypted successfully', { 
        keyId, 
        tenantId, 
        algorithm: key.type,
        dataLength: data.length 
      });

      return encryptedData;
    } catch (error) {
      logger.error('Encryption error:', error);
      if (error instanceof Error && error.message.includes('Invalid or inactive encryption key')) {
        throw error;
      }
      throw new Error('Encryption failed');
    }
  }

  async decrypt(encryptedData: EncryptedData, keyId: string, tenantId: string): Promise<string> {
    try {
      const key = this.keys.get(keyId);
      if (!key || !key.isActive || key.tenantId !== tenantId) {
        throw new Error('Invalid or inactive encryption key');
      }

      const keyMaterial = this.keyStore.get(keyId);
      if (!keyMaterial) {
        throw new Error('Key material not found');
      }

      let decryptedData: string;

      if (key.type.startsWith('AES')) {
        // AES decryption using modern crypto methods
        if (!encryptedData.iv || !encryptedData.tag) {
          throw new Error('Missing IV or authentication tag for AES decryption');
        }

        const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial, Buffer.from(encryptedData.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        decryptedData = decrypted;
      } else if (key.type.startsWith('RSA')) {
        // RSA decryption
        const decrypted = crypto.privateDecrypt(
          {
            key: keyMaterial,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
          },
          Buffer.from(encryptedData.encryptedData, 'base64')
        );

        decryptedData = decrypted.toString('utf8');
      } else {
        throw new Error(`Unsupported decryption algorithm: ${key.type}`);
      }

      logger.info('Data decrypted successfully', { 
        keyId, 
        tenantId, 
        algorithm: key.type 
      });

      return decryptedData;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  async getKeys(tenantId: string): Promise<EncryptionKey[]> {
    try {
      const keys = Array.from(this.keys.values()).filter(
        key => key.tenantId === tenantId
      );

      // Sort by creation date (newest first)
      keys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      logger.info('Encryption keys retrieved', { tenantId, count: keys.length });

      return keys;
    } catch (error) {
      logger.error('Get encryption keys error:', error);
      throw new Error('Failed to get encryption keys');
    }
  }

  async createKey(name: string, type: 'AES-256' | 'RSA-2048' | 'RSA-4096', tenantId: string): Promise<{ success: boolean; key?: EncryptionKey; error?: string }> {
    try {
      // Check if key with same name already exists for this tenant
      const existingKey = Array.from(this.keys.values()).find(
        key => key.name === name && key.tenantId === tenantId
      );

      if (existingKey) {
        return {
          success: false,
          error: 'Key with this name already exists for this tenant'
        };
      }

      const keyId = uuidv4();
      const keySize = type.startsWith('AES') ? 32 : type.includes('2048') ? 256 : 512;

      // Generate key material
      const keyMaterial = crypto.randomBytes(keySize);

      const key: EncryptionKey = {
        id: keyId,
        name,
        type,
        tenantId,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year default
        metadata: { 
          purpose: 'general_encryption', 
          rotation: 'annual',
          keySize 
        }
      };

      this.keys.set(keyId, key);
      this.keyStore.set(keyId, keyMaterial);

      logger.info('Encryption key created successfully', { 
        keyId, 
        name, 
        type, 
        tenantId 
      });

      return {
        success: true,
        key
      };
    } catch (error) {
      logger.error('Create encryption key error:', error);
      return {
        success: false,
        error: 'Failed to create encryption key'
      };
    }
  }

  async rotateKey(keyId: string, tenantId: string): Promise<{ success: boolean; newKeyId?: string; error?: string }> {
    try {
      const key = this.keys.get(keyId);
      if (!key || key.tenantId !== tenantId) {
        return {
          success: false,
          error: 'Key not found or access denied'
        };
      }

      // Create new key
      const newKeyId = uuidv4();
      const keySize = key.type.startsWith('AES') ? 32 : key.type.includes('2048') ? 256 : 512;
      const newKeyMaterial = crypto.randomBytes(keySize);

      const newKey: EncryptionKey = {
        id: newKeyId,
        name: `${key.name} (Rotated)`,
        type: key.type,
        tenantId,
        isActive: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { 
          ...key.metadata,
          rotatedFrom: keyId,
          rotationDate: new Date().toISOString()
        }
      };

      this.keys.set(newKeyId, newKey);
      this.keyStore.set(newKeyId, newKeyMaterial);

      // Deactivate old key
      key.isActive = false;
      this.keys.set(keyId, key);

      logger.info('Encryption key rotated successfully', { 
        oldKeyId: keyId, 
        newKeyId, 
        tenantId 
      });

      return {
        success: true,
        newKeyId
      };
    } catch (error) {
      logger.error('Rotate encryption key error:', error);
      return {
        success: false,
        error: 'Failed to rotate encryption key'
      };
    }
  }

  async deactivateKey(keyId: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const key = this.keys.get(keyId);
      if (!key || key.tenantId !== tenantId) {
        return {
          success: false,
          error: 'Key not found or access denied'
        };
      }

      key.isActive = false;
      this.keys.set(keyId, key);

      // Remove key material from memory
      this.keyStore.delete(keyId);

      logger.info('Encryption key deactivated successfully', { keyId, tenantId });

      return { success: true };
    } catch (error) {
      logger.error('Deactivate encryption key error:', error);
      return {
        success: false,
        error: 'Failed to deactivate encryption key'
      };
    }
  }

  async getKeyStatus(keyId: string, tenantId: string): Promise<{ success: boolean; status?: any; error?: string }> {
    try {
      const key = this.keys.get(keyId);
      if (!key || key.tenantId !== tenantId) {
        return {
          success: false,
          error: 'Key not found or access denied'
        };
      }

      const status = {
        id: key.id,
        name: key.name,
        type: key.type,
        isActive: key.isActive,
        createdAt: key.createdAt,
        expiresAt: key.expiresAt,
        isExpired: key.expiresAt ? new Date(key.expiresAt) < new Date() : false,
        daysUntilExpiry: key.expiresAt ? Math.ceil((new Date(key.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
        metadata: key.metadata
      };

      return {
        success: true,
        status
      };
    } catch (error) {
      logger.error('Get key status error:', error);
      return {
        success: false,
        error: 'Failed to get key status'
      };
    }
  }

  async generateKeyBackup(keyId: string, tenantId: string): Promise<{ success: boolean; backup?: string; error?: string }> {
    try {
      const key = this.keys.get(keyId);
      if (!key || key.tenantId !== tenantId) {
        return {
          success: false,
          error: 'Key not found or access denied'
        };
      }

      // In a real implementation, this would create a secure backup
      // For mock purposes, we'll create a JSON representation
      const backup = {
        keyId: key.id,
        name: key.name,
        type: key.type,
        tenantId: key.tenantId,
        createdAt: key.createdAt,
        metadata: key.metadata,
        backupCreatedAt: new Date().toISOString()
      };

      logger.info('Key backup generated successfully', { keyId, tenantId });

      return {
        success: true,
        backup: JSON.stringify(backup, null, 2)
      };
    } catch (error) {
      logger.error('Generate key backup error:', error);
      return {
        success: false,
        error: 'Failed to generate key backup'
      };
    }
  }
} 