import { supabase } from '../../config/supabase/client';
import type { DoctorProfile, DoctorSpecialty } from '../../types/doctor';

export async function getDoctorProfile(userId: string): Promise<DoctorProfile | null> {
    const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching doctor profile:', error);
        return null;
    }

    return data;
}

export async function updateDoctorProfile(profile: Partial<DoctorProfile>): Promise<boolean> {
    try {
        // Check authentication
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
            console.error('Authentication error:', authError);
            return false;
        }

        // Verify user is updating their own profile
        if (session.user.id !== profile.userId) {
            console.error('User can only update their own profile');
            return false;
        }

        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('user_id', profile.userId)
            .single();

        // Handle case where profile doesn't exist
        if (!existingProfile) {
            // Convert camelCase to snake_case for database
            const newProfile = {
                user_id: profile.userId,
                specialty: profile.specialty,
                description: profile.description,
                education: profile.education,
                years_of_experience: profile.yearsOfExperience,
                accepting_new_patients: profile.acceptingNewPatients ?? false,
            };

            const { error: insertError } = await supabase
                .from('doctor_profiles')
                .insert([newProfile]);

            if (insertError) {
                console.error('Error creating doctor profile:', insertError);
                return false;
            }

            return true;
        }

        // If we got here and there was a fetch error, it wasn't due to missing profile
        if (fetchError) {
            console.error('Error checking doctor profile:', fetchError);
            return false;
        }

        // Convert camelCase to snake_case for database
        const updateData = {
            specialty: profile.specialty,
            description: profile.description,
            education: profile.education,
            years_of_experience: profile.yearsOfExperience,
            accepting_new_patients: profile.acceptingNewPatients,
        };

        // Update existing profile
        const { error: updateError } = await supabase
            .from('doctor_profiles')
            .update(updateData)
            .eq('user_id', profile.userId);

        if (updateError) {
            console.error('Error updating doctor profile:', updateError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in updateDoctorProfile:', error);
        return false;
    }
}

export async function getDoctorsBySpecialty(specialty: DoctorSpecialty) {
    const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
            *,
            users:user_id (
                email
            )
        `)
        .eq('specialty', specialty)
        .eq('accepting_new_patients', true);

    if (error) {
        console.error('Error fetching doctors by specialty:', error);
        return [];
    }

    return data;
}

export async function createDoctorProfile(userId: string, specialty: DoctorSpecialty): Promise<boolean> {
    const { error } = await supabase
        .from('doctor_profiles')
        .insert({
            user_id: userId,
            specialty,
            accepting_new_patients: true
        });

    if (error) {
        console.error('Error creating doctor profile:', error);
        return false;
    }

    return true;
}
