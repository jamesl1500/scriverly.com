import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse } from '@/libs/apiHelpers';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;

    if (!avatarFile || avatarFile.size === 0) {
      return errorResponse('No file provided.', 400, 'no_file');
    }

    if (!ALLOWED_TYPES.has(avatarFile.type)) {
      return errorResponse('File must be a JPEG, PNG, WebP, or GIF image.', 400, 'invalid_type');
    }

    if (avatarFile.size > MAX_BYTES) {
      return errorResponse('File must be under 5 MB.', 400, 'file_too_large');
    }

    const ext = avatarFile.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const buffer = Buffer.from(await avatarFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('user_assets')
      .upload(path, buffer, {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) {
      return errorResponse('Failed to upload avatar.', 500, 'upload_failed');
    }

    const { data: publicUrlData } = supabase.storage
      .from('user_assets')
      .getPublicUrl(path);

    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      return errorResponse('Failed to save avatar URL.', 500, 'update_failed');
    }

    return successResponse({ avatarUrl });
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}
