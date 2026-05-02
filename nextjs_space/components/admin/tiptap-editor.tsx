"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  ImagePlus,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Pilcrow,
  Unlink,
  Loader2,
  GalleryHorizontalEnd,
} from "lucide-react";
import { toast } from "sonner";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  postId?: string | null;
  onDirty?: () => void;
  onPickMedia?: () => void;
  onReadyPickMedia?: (
    handler: (media: { id: string; url: string }) => void,
  ) => void;
}

async function uploadImageFile(
  file: File,
  postId: string | null,
): Promise<string | null> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.type)) {
    toast.error("Chỉ chấp nhận JPEG, PNG, WebP.");
    return null;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Ảnh tối đa 5MB.");
    return null;
  }

  const initRes = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
      type: "CONTENT",
      postId: postId ?? null,
    }),
  });

  if (!initRes.ok) {
    throw new Error("Init upload failed");
  }

  const data = await initRes.json();

  if (data.mode === "S3") {
    const headers: Record<string, string> = {
      "Content-Type": file.type,
    };

    if (data.uploadUrl?.includes("content-disposition")) {
      headers["Content-Disposition"] = "attachment";
    }

    const upRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers,
      body: file,
    });

    if (!upRes.ok) {
      throw new Error("S3 upload failed");
    }

    await fetch("/api/admin/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cloud_storage_path: data.cloud_storage_path,
        mediaId: data.mediaId,
      }),
    });

    return data.url;
  }

  if (data.mode === "LOCAL") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaId", data.mediaId);

    const localRes = await fetch("/api/admin/upload/local", {
      method: "POST",
      body: formData,
    });

    if (!localRes.ok) {
      throw new Error("Local upload failed");
    }

    const localData = await localRes.json();
    return localData.url;
  }

  throw new Error("Unknown upload mode");
}

export default function TiptapEditor({
  content,
  onChange,
  postId,
  onDirty,
  onPickMedia,
  onReadyPickMedia,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Viết nội dung bài viết của bạn...",
      }),
    ],
    content: content || "",
    onUpdate: ({ editor: ed }) => {
      onChange(ed?.getHTML?.() ?? "");
      onDirty?.();
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4",
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false;

        const files = Array.from(event.dataTransfer.files).filter((f) =>
          f.type.startsWith("image/"),
        );

        if (files.length === 0) return false;

        event.preventDefault();
        void handleMultipleImages(files);
        return true;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const imageItems = Array.from(items).filter((i) =>
          i.type.startsWith("image/"),
        );

        if (imageItems.length === 0) return false;

        event.preventDefault();

        const files = imageItems
          .map((i) => i.getAsFile())
          .filter(Boolean) as File[];

        void handleMultipleImages(files);
        return true;
      },
    },
  });

  const handleMultipleImages = useCallback(
    async (files: File[]) => {
      if (!editor) return;

      setUploading(true);
      setUploadCount(files.length);

      let successCount = 0;

      for (const file of files) {
        try {
          const url = await uploadImageFile(file, postId ?? null);
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
            successCount++;
          }
        } catch (err) {
          console.error("Image upload error:", err);
        }
      }

      if (successCount > 0) {
        toast.success(`Đã tải lên ${successCount} ảnh.`);
      }

      if (successCount < files.length) {
        toast.error(`${files.length - successCount} ảnh thất bại.`);
      }

      setUploading(false);
      setUploadCount(0);
    },
    [editor, postId],
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e?.target?.files;
      if (!files?.length || !editor) return;

      await handleMultipleImages(Array.from(files));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor, handleMultipleImages],
  );

  useEffect(() => {
    if (!editor || !onReadyPickMedia) return;

    onReadyPickMedia((media) => {
      editor.chain().focus().setImage({ src: media.url }).run();
      onDirty?.();
      toast.success("Đã chèn ảnh vào nội dung.");
    });
  }, [editor, onReadyPickMedia, onDirty]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link")?.href ?? "";
    const url = window.prompt("Nhập URL liên kết:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return (
      <div className="border rounded-md p-4 text-muted-foreground text-sm">
        Đang tải editor...
      </div>
    );
  }

  const ToolbarBtn = ({
    onClick,
    active,
    children,
    title,
    disabled,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const s = 16;

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-input bg-muted/30">
        <ToolbarBtn
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
          title="Đoạn văn"
        >
          <Pilcrow size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          active={editor.isActive("heading", { level: 4 })}
          title="Tiêu đề 4"
        >
          <Heading4 size={s} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Đậm"
        >
          <Bold size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Nghiêng"
        >
          <Italic size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Gạch chân"
        >
          <UnderlineIcon size={s} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Danh sách"
        >
          <List size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Danh sách số"
        >
          <ListOrdered size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Trích dẫn"
        >
          <Quote size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Khối mã"
        >
          <Code size={s} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Canh trái"
        >
          <AlignLeft size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Canh giữa"
        >
          <AlignCenter size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Canh phải"
        >
          <AlignRight size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Canh đều"
        >
          <AlignJustify size={s} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Liên kết"
        >
          <LinkIcon size={s} />
        </ToolbarBtn>

        {editor.isActive("link") && (
          <ToolbarBtn
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Bỏ liên kết"
          >
            <Unlink size={s} />
          </ToolbarBtn>
        )}

        <ToolbarBtn
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Tải ảnh lên"
        >
          {uploading ? (
            <Loader2 size={s} className="animate-spin" />
          ) : (
            <ImagePlus size={s} />
          )}
        </ToolbarBtn>

        {onPickMedia && (
          <ToolbarBtn onClick={onPickMedia} title="Chọn từ thư viện">
            <GalleryHorizontalEnd size={s} />
          </ToolbarBtn>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        <div className="w-px h-5 bg-border mx-1" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Hoàn tác"
        >
          <Undo size={s} />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Làm lại"
        >
          <Redo size={s} />
        </ToolbarBtn>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border-b border-input text-xs text-primary">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang tải {uploadCount} ảnh lên...
        </div>
      )}

      <div className="relative">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
