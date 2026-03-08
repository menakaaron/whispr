"use client";

import React, { useCallback, useRef, useState } from "react";
import { useConversations } from "@/state/conversations";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function UploadPanel() {
  const { addAudioFiles } = useConversations();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onPick = useCallback(() => inputRef.current?.click(), []);

  const onFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsUploading(true);
      try {
        await addAudioFiles(files);
      } finally {
        setIsUploading(false);
      }
    },
    [addAudioFiles],
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Upload conversation recordings</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Add one or more audio files (m4a/mp3/wav). Analysis is placeholder text for now.
          </p>
        </div>
        <button
          type="button"
          onClick={onPick}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          disabled={isUploading}
        >
          {isUploading ? "Uploading…" : "Choose files"}
        </button>
      </div>

      <div
        className={cn(
          "mt-4 grid place-items-center rounded-2xl border border-dashed px-4 py-8 transition",
          isDragging
            ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900"
            : "border-zinc-300 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-950/30",
        )}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          if (e.dataTransfer.files?.length) await onFiles(e.dataTransfer.files);
        }}
      >
        <div className="max-w-md text-center">
          <div className="text-sm font-medium">
            Drag & drop audio files here, or{" "}
            <button
              type="button"
              className="font-semibold underline underline-offset-4"
              onClick={onPick}
              disabled={isUploading}
            >
              browse
            </button>
          </div>
          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Your recordings are stored locally in this browser (IndexedDB) for now.
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
onChange={async (e) => {
  const input = e.currentTarget;
  if (e.target.files?.length) await onFiles(e.target.files);
  if (input) input.value = "";
}}
      />
    </section>
  );
}

