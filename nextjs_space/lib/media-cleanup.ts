import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/s3";

/**
 * Parse HTML content to extract image URLs used in the content
 */
export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match = regex.exec(html);
  while (match) {
    if (match[1]) urls.push(match[1]);
    match = regex.exec(html);
  }
  return urls;
}

/**
 * Delete all media files and records for a post
 */
export async function deleteAllPostMedia(postId: string): Promise<void> {
  const mediaList = await prisma.media.findMany({ where: { postId } });
  // Delete files from S3
  for (const m of mediaList ?? []) {
    try {
      await deleteFile(m.cloud_storage_path);
    } catch (err: any) {
      console.error(`Failed to delete file ${m.cloud_storage_path}:`, err);
    }
  }
  // Delete records
  await prisma.media.deleteMany({ where: { postId } });
}

/**
 * Clean up orphaned media when updating a post
 * Compares current content images with media records and removes unused ones
 */
export async function cleanupOrphanedMedia(postId: string, newContent: string, newCoverImageId: string | null): Promise<void> {
  const usedUrls = extractImageUrlsFromHtml(newContent ?? "");

  // Get all CONTENT media for this post
  const contentMedia = await prisma.media.findMany({
    where: { postId, type: "CONTENT" },
  });

  for (const m of contentMedia ?? []) {
    // If this media URL is not in the content anymore, delete it
    const stillUsed = usedUrls.some((url: string) => url === m.url || url?.includes(m.cloud_storage_path));
    if (!stillUsed) {
      try {
        await deleteFile(m.cloud_storage_path);
      } catch (err: any) {
        console.error(`Failed to delete orphaned file ${m.cloud_storage_path}:`, err);
      }
      await prisma.media.delete({ where: { id: m.id } });
    }
  }

  // Handle old cover image if changed
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { coverImageId: true } });
  if (post?.coverImageId && post.coverImageId !== newCoverImageId) {
    const oldCover = await prisma.media.findUnique({ where: { id: post.coverImageId } });
    if (oldCover) {
      try {
        await deleteFile(oldCover.cloud_storage_path);
      } catch (err: any) {
        console.error(`Failed to delete old cover:`, err);
      }
      await prisma.media.delete({ where: { id: oldCover.id } });
    }
  }
}
