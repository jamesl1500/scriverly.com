import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse } from '@/libs/apiHelpers';
import { ZodError } from 'zod';
import { onboardingProfileSchema } from '@/libs/validations/onboarding';

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
    const rawData = {
      fullName: formData.get('fullName') as string,
      username: formData.get('username') as string,
      bio: (formData.get('bio') as string) || undefined,
    };

    const validated = onboardingProfileSchema.parse(rawData);

    // Handle optional avatar file upload
    let avatarUrl: string | undefined;
    const avatarFile = formData.get('avatar') as File | null;

    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/avatar.${ext}`;
      const buffer = Buffer.from(await avatarFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('user_assets')
        .upload(path, buffer, {
          contentType: avatarFile.type,
          upsert: true,
        });

      if (uploadError) {
        return errorResponse('Failed to upload avatar.', 500, 'avatar_upload_failed');
      }

      const { data: publicUrlData } = supabase.storage
        .from('user_assets')
        .getPublicUrl(path);

      avatarUrl = publicUrlData.publicUrl;
    }

    const updates: Record<string, unknown> = {
      full_name: validated.fullName,
      username: validated.username,
      bio: validated.bio ?? null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    if (avatarUrl) {
      updates.avatar_url = avatarUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (updateError) {
      if (updateError.code === '23505') {
        return errorResponse('That username is already taken.', 409, 'username_taken');
      }
      return errorResponse('Failed to update profile.', 500, 'update_failed');
    }

    return successResponse({ message: 'Profile updated.' });
  } catch (err) {
    if (err instanceof ZodError) {
      return errorResponse(err.issues[0].message, 422, 'validation_error');
    }
    return errorResponse('An unexpected error occurred.', 500);
  }
}
