type Bucket = "avatars" | "offer-covers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function getPublicUrl(bucket: Bucket, path: string | null) {
  if (!supabaseUrl || !path) return null;
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

function getRandomId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function normalizeExt(fileExt: string) {
  return fileExt.replace(".", "").toLowerCase();
}

export function buildAvatarPath(userId: string, fileExt: string) {
  const ext = normalizeExt(fileExt);
  return `${userId}/avatar-${getRandomId()}.${ext}`;
}

export function buildCoverPath(userId: string, offerId: string, fileExt: string) {
  const ext = normalizeExt(fileExt);
  return `${userId}/offer-${offerId}-${getRandomId()}.${ext}`;
}
