"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ImagePlus,
  X,
  Link,
  User,
  Phone,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";
import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const { useUploadThing } = generateReactHelpers();

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().url("Invalid photo URL").optional().or(z.literal("")),
  guarantorName: z.string().optional().or(z.literal("")),
  guarantorPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  guarantorAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  documentsUrl: z
    .string()
    .url("Invalid documents URL")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface PhotoUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  alt: string;
}

function PhotoUpload({
  file,
  onFileSelect,
  onFileRemove,
  alt,
}: PhotoUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-slate-600 bg-slate-800/50">
          {file ?
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full h-full"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={alt}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          : <div className="w-full h-full flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-slate-400" />
            </div>
          }
        </div>
        {file && (
          <button
            type="button"
            onClick={onFileRemove}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500/90 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors border-2 border-slate-800"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          Select Photo
        </label>
      </div>
    </div>
  );
}

interface DocumentUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

function DocumentUpload({
  file,
  onFileSelect,
  onFileRemove,
}: DocumentUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md p-6 rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/50">
        {file ?
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-200">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onFileRemove}
              className="p-1.5 bg-red-500/90 backdrop-blur-sm rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        : <div className="flex flex-col items-center justify-center gap-2 text-center">
            <FileText className="w-8 h-8 text-slate-400" />
            <div className="text-sm text-slate-300">
              <span className="font-medium">Click to upload</span> or drag and
              drop
            </div>
            <div className="text-xs text-slate-400">
              PDF, DOC, DOCX up to 10MB
            </div>
          </div>
        }
      </div>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload"
        />
        <label
          htmlFor="document-upload"
          className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-2 font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          Select Document
        </label>
      </div>
    </div>
  );
}

interface CustomerFormProps {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

export function CustomerForm({ onSubmit, onCancel }: CustomerFormProps) {
  const [customerPhoto, setCustomerPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
      setIsUploading(false);
    },
    onClientUploadComplete: () => {
      setIsUploading(false);
    },
  });
  const { startUpload: startDocumentUpload } = useUploadThing(
    "documentUploader",
    {
      onUploadError: (error) => {
        console.error("Document upload error:", error);
        toast.error("Failed to upload document. Please try again.");
        setIsUploading(false);
      },
      onClientUploadComplete: () => {
        setIsUploading(false);
      },
    }
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      photoUrl: "",
      guarantorName: "",
      guarantorPhone: "",
      guarantorAddress: "",
      documentsUrl: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true);
      let photoUrl = "";
      let documentsUrl = "";

      // Upload customer photo if it exists
      if (customerPhoto) {
        try {
          const uploadResult = await startUpload([customerPhoto]);
          if (uploadResult?.[0]?.url) {
            photoUrl = uploadResult[0].url;
          }
        } catch (error) {
          console.error("Photo upload error:", error);
          toast.error("Failed to upload photo. Please try again.");
          return;
        }
      }

      // Upload document if it exists
      if (document) {
        try {
          const uploadResult = await startDocumentUpload([document]);
          if (uploadResult?.[0]?.url) {
            documentsUrl = uploadResult[0].url;
          }
        } catch (error) {
          console.error("Document upload error:", error);
          toast.error("Failed to upload document. Please try again.");
          return;
        }
      }

      // Submit the form with updated values
      await onSubmit({
        ...values,
        photoUrl,
        documentsUrl,
      });

      toast.success("Customer created successfully");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Customer Details Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Details
            </h3>

            <PhotoUpload
              file={customerPhoto}
              onFileSelect={setCustomerPhoto}
              onFileRemove={() => setCustomerPhoto(null)}
              alt="Customer photo"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 transition-colors"
                        placeholder="Enter customer name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 transition-colors"
                        placeholder="Enter phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 transition-colors resize-none"
                      placeholder="Enter address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <Separator className="bg-slate-700/50" />

          {/* Guarantor Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <User className="w-5 h-5" />
              Guarantor Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="guarantorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Guarantor Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 transition-colors"
                        placeholder="Enter guarantor name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guarantorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Guarantor Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 transition-colors"
                        placeholder="Enter guarantor phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="guarantorAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Guarantor Address
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-slate-800/50 border-slate-600/50 focus:border-blue-500/50 transition-colors resize-none"
                      placeholder="Enter guarantor address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <Separator className="bg-slate-700/50" />

          {/* Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </h3>

            <DocumentUpload
              file={document}
              onFileSelect={setDocument}
              onFileRemove={() => setDocument(null)}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end gap-4 pt-6"
        >
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className="border-slate-600/50 text-slate-400 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isUploading || form.formState.isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading || form.formState.isSubmitting ?
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isUploading ?
                    <Loader2 className="w-4 h-4 animate-spin" />
                  : "Creating..."}
                </span>
              </div>
            : "Create New"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
