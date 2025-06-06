"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  key: string;
}

export const CustomUploadButton = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const removeFile = () => {
    setUploadedFile(null);
    toast.success("File removed");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        {!uploadedFile ?
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]) {
                const file = res[0];
                setUploadedFile({
                  url: file.url,
                  name: file.name,
                  size: file.size,
                  key: file.key,
                });
                toast.success("Upload Completed");
                console.log("File data:", file);
              } else {
                toast.error("Failed to get upload URL");
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`ERROR! ${error.message}`);
            }}
            onUploadBegin={() => {
              toast.loading("Uploading...");
            }}
            className="ut-label:text-lg ut-allowed-content:text-sm ut-button:bg-gradient-to-r ut-button:from-blue-600 ut-button:to-purple-600 ut-button:text-white ut-button:rounded-lg ut-button:px-4 ut-button:py-2 ut-button:font-medium ut-button:hover:from-blue-700 ut-button:hover:to-purple-700 ut-button:transition-all ut-button:duration-200"
          />
        : <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden group">
              <Image
                src={uploadedFile.url}
                alt={uploadedFile.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={removeFile}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {uploadedFile.name}
              </p>
              <p>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="truncate">Key: {uploadedFile.key}</p>
            </div>
            <Button
              onClick={() => setUploadedFile(null)}
              variant="outline"
              className="w-full"
            >
              Upload Another
            </Button>
          </div>
        }
      </CardContent>
    </Card>
  );
};
