import { createSupabaseServerClient } from '@/libs/supabase/server';
import { successResponse, errorResponse } from '@/libs/apiHelpers';
import { getQuotaUsage } from '@/libs/aiQuota';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const usage = await getQuotaUsage(supabase, user.id);
    return successResponse(usage);
  } catch {
    return errorResponse('An unexpected error occurred.', 500);
  }
}
