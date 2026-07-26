import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import crypto from 'node:crypto';

const app = express();
const port = process.env.PORT ?? '4000';

app.use(cors());

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

app.use(express.json());

app.post(
  '/api/upload-url',
  async (
    req: Request<{}, {}, { fileName?: string; contentType?: string; fileSize?: number }>,
    res: Response,
  ) => {
    const { fileName, contentType, fileSize } = req.body;

    if (!fileName || !contentType) {
      res.status(400).json({ error: 'fileName and contentType are required' });
      return;
    }

    const bucket = process.env.S3_BUCKET ?? 'my-app-uploads';
    const key = `uploads/${crypto.randomUUID()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ...(fileSize ? { ContentLength: fileSize } : {}),
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.json({
      uploadUrl,
      fileUrl: `https://${bucket}.s3.${process.env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${key}`,
      fileKey: key,
    });
  },
);

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
