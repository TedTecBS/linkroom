import React from 'react';
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  deleteObject,
} from 'firebase/storage';
import { deleteField, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Loader2, UploadCloud, FileText, Trash2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { jobSeekerProfileDoc } from '@/lib/firestore-collections';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface CvUploadCardProps {
  profileId: string;
  cvUrl?: string | null;
  cvFileName?: string | null;
  onUpdated?: () => void;
  disabled?: boolean;
}

export const CvUploadCard: React.FC<CvUploadCardProps> = ({
  profileId,
  cvUrl,
  cvFileName,
  onUpdated,
  disabled,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileSelect = () => {
    if (!fileInputRef.current || disabled) return;
    fileInputRef.current.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF or Word documents are allowed');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Maximum file size is 10MB');
      return;
    }
    if (!profileId) {
      setError('Missing profile identifier');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileRef = ref(storage, `cvs/${profileId}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: profileId,
        },
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (uploadError) => {
          console.error('CV upload failed', uploadError);
          setError('Failed to upload CV. Please try again.');
          setIsUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await setDoc(
            jobSeekerProfileDoc(profileId),
            {
              cvUrl: downloadUrl,
              cvFileName: file.name,
              updatedAt: new Date(),
            },
            { merge: true }
          );
          toast.success('CV uploaded successfully');
          setIsUploading(false);
          setUploadProgress(0);
          onUpdated?.();
        }
      );
    } catch (uploadError) {
      console.error(uploadError);
      setError('Failed to upload CV. Please try again.');
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!profileId) return;

    setIsUploading(true);
    setError(null);

    try {
      if (cvFileName) {
        const fileRef = ref(storage, `cvs/${profileId}/${cvFileName}`);
        await deleteObject(fileRef).catch((err) => {
          // Ignore not-found errors to keep UX smooth
          if (err.code !== 'storage/object-not-found') {
            throw err;
          }
        });
      }

      await setDoc(
        jobSeekerProfileDoc(profileId),
        {
          cvUrl: deleteField(),
          cvFileName: deleteField(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
      toast.success('CV removed');
      onUpdated?.();
    } catch (deleteError) {
      console.error(deleteError);
      setError('Failed to delete CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum Vitae</CardTitle>
        <CardDescription>
          Upload your latest CV in PDF or Word format (max 10MB).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleUpload}
        />

        {cvUrl ? (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{cvFileName ?? 'CV.pdf'}</p>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View or download
                </a>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              disabled={isUploading || disabled}
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-center">
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No CV uploaded yet. Uploading a CV improves your chances of getting noticed.
            </p>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading... {uploadProgress}%
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleFileSelect}
            disabled={isUploading || disabled}
          >
            Upload new CV
          </Button>
          {cvUrl && (
            <Button
              type="button"
              variant="ghost"
              disabled={isUploading || disabled}
              onClick={handleDelete}
            >
              Remove current CV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
